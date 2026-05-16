import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Database } from "@/integrations/supabase/types";
import { rankAthletes, type AthleteForMatch, type BrandForMatch, type CampaignForMatch } from "@/lib/matching";
import type { CampaignSubmission } from "./campaign-launch.functions";

type CampaignInsert = Database["public"]["Tables"]["campaigns"]["Insert"];
type CampaignRow = Database["public"]["Tables"]["campaigns"]["Row"];
type MatchInsert = Database["public"]["Tables"]["matches"]["Insert"];

const FALLBACK_ATHLETES = [
  {
    email: "demo-a-isla@pegasus.app",
    full_name: "Isla Thompson",
    sport: "Swimming",
    country: "United Kingdom",
    discipline: "Open-water · Masters",
    values: ["Wellness", "Women's health", "Sustainability"],
    pricing_min: 500,
    pricing_max: 2000,
    summary: "United Kingdom · women 30–35 wellness audience · Instagram-first swimming community",
  },
  {
    email: "demo-a-harriet@pegasus.app",
    full_name: "Harriet Boateng",
    sport: "Marathon",
    country: "United Kingdom",
    discipline: "Road running · Half + full",
    values: ["Wellness", "Mental health", "Inclusive fitness"],
    pricing_min: 600,
    pricing_max: 1800,
    summary: "United Kingdom · women 30–35 wellness audience · jogging and marathon community",
  },
  {
    email: "demo-a-niamh@pegasus.app",
    full_name: "Niamh O'Connor",
    sport: "Trail Running",
    country: "United Kingdom",
    discipline: "Ultra + trail",
    values: ["Wellness", "Nature", "Women's health"],
    pricing_min: 750,
    pricing_max: 2000,
    summary: "United Kingdom · women 30–35 wellness audience · trail and jogging community",
  },
];

const DEMO_PASSWORD = "PegasusDemo2026!";

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function requiredMissing(data: CampaignSubmission) {
  const required: Array<[keyof CampaignSubmission, string]> = [
    ["name", "Campaign name"],
    ["goals", "Goal"],
    ["description", "Description"],
    ["audience", "Audience"],
    ["values", "Brand values"],
    ["sports", "Sports"],
    ["geo", "Geography"],
    ["partnership_structure", "Partnership type"],
    ["product_category", "Product category"],
    ["budget_min", "Budget min"],
    ["budget_max", "Budget max"],
    ["timeline", "Timeline"],
  ];

  return required.filter(([key]) => !String(data[key] ?? "").trim()).map(([, label]) => label);
}

function parseBudget(value: string, label: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) throw new Error(`${label} must be a valid positive number.`);
  return Math.round(parsed);
}

async function assertBrandUser(userId: string) {
  const { data: roleRows, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .in("role", ["brand", "admin"]);

  if (error) throw new Error("Database error — campaign not saved.");
  if (!roleRows?.length) throw new Error("Only brand accounts can launch campaigns.");
}

async function upsertFallbackAthlete(seed: (typeof FALLBACK_ATHLETES)[number]) {
  let userId: string | undefined;

  for (let page = 1; page <= 5 && !userId; page += 1) {
    const { data } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
    userId = data?.users?.find((user) => user.email?.toLowerCase() === seed.email.toLowerCase())?.id;
    if (!data?.users || data.users.length < 200) break;
  }

  if (!userId) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: seed.email,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: seed.full_name, role: "athlete" },
    });
    if (error || !data.user) throw new Error(error?.message ?? `Could not create ${seed.full_name}`);
    userId = data.user.id;
  }

  await supabaseAdmin.from("profiles").upsert(
    {
      id: userId,
      email: seed.email,
      full_name: seed.full_name,
      country: seed.country,
      primary_role: "athlete",
      onboarding_completed: true,
    },
    { onConflict: "id" },
  );

  const { data: existingRole } = await supabaseAdmin
    .from("user_roles")
    .select("id")
    .eq("user_id", userId)
    .eq("role", "athlete")
    .maybeSingle();
  if (!existingRole) await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: "athlete" });

  await supabaseAdmin.from("athlete_profiles").upsert(
    {
      user_id: userId,
      sport: seed.sport,
      discipline: seed.discipline,
      professional_level: "Pro",
      rankings: "Demo verified · 30–35 age band",
      achievements: "UK wellness audience · strong Instagram engagement",
      values: seed.values,
      causes: ["Women's health", "Wellness access"],
      favorite_brands: ["Lululemon", "Hoka", "Wild Nutrition"],
      sponsorship_categories: ["Wellness", "Nutrition", "Apparel"],
      partnership_types: ["Instagram posts", "Product seeding", "Wellness campaign"],
      geographic_preferences: ["United Kingdom", "UK", "Europe"],
      pricing_min: seed.pricing_min,
      pricing_max: seed.pricing_max,
      profile_completeness: 88,
      verification_status: "verified",
      audience_demographics: { summary: seed.summary, female_pct: 72, age_30_35_pct: 58, top_geos: ["UK"] },
    },
    { onConflict: "user_id" },
  );
}

async function ensureFallbackPool() {
  await Promise.all(FALLBACK_ATHLETES.map(upsertFallbackAthlete));
}

async function buildAthletePool(): Promise<AthleteForMatch[]> {
  const { data: athleteRows, error } = await supabaseAdmin
    .from("athlete_profiles")
    .select("user_id, sport, values, causes, audience_demographics, pricing_min, pricing_max, partnership_types, geographic_preferences, verification_status")
    .eq("verification_status", "verified");
  if (error) throw error;

  const profileIds = (athleteRows ?? []).map((row) => row.user_id);
  const { data: profiles } = profileIds.length
    ? await supabaseAdmin.from("profiles").select("id, full_name, country").in("id", profileIds)
    : { data: [] as { id: string; full_name: string | null; country: string | null }[] };

  const byId = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
  return (athleteRows ?? []).map((row) => ({
    ...row,
    full_name: byId.get(row.user_id)?.full_name ?? "Athlete",
    country: byId.get(row.user_id)?.country ?? null,
  })) as AthleteForMatch[];
}

async function createMatches(userId: string, campaign: CampaignRow, brandValues: string[]) {
  await ensureFallbackPool();

  const { data: brandProfile } = await supabaseAdmin
    .from("brand_profiles")
    .select("values, esg_priorities, industry, consumer_demographics")
    .eq("user_id", userId)
    .maybeSingle();

  const brand: BrandForMatch = {
    values: brandValues.length ? brandValues : brandProfile?.values,
    esg_priorities: brandProfile?.esg_priorities,
    industry: brandProfile?.industry,
    consumer_demographics:
      brandProfile?.consumer_demographics && typeof brandProfile.consumer_demographics === "object" && !Array.isArray(brandProfile.consumer_demographics)
        ? (brandProfile.consumer_demographics as BrandForMatch["consumer_demographics"])
        : null,
  };
  const athletes = await buildAthletePool();
  const ranked = rankAthletes(athletes, brand, campaign as CampaignForMatch).slice(0, 12);

  const rows: MatchInsert[] = ranked.map((match) => ({
    athlete_id: match.athlete_id,
    brand_id: userId,
    campaign_id: campaign.id,
    score: match.score,
    values_score: match.values_score,
    audience_score: match.audience_score,
    budget_score: match.budget_score,
    sport_score: match.sport_score,
    campaign_score: match.campaign_score,
    explanation: match.explanation,
    saved_by_brand: false,
  }));

  await supabaseAdmin.from("matches").delete().eq("campaign_id", campaign.id);
  if (!rows.length) return { matchCount: 0, fallbackUsed: true };

  const { error } = await supabaseAdmin.from("matches").insert(rows);
  if (error) throw error;
  console.log("[Pegasus Launch] matching inserted", { campaignId: campaign.id, matchCount: rows.length });

  return { matchCount: rows.length, fallbackUsed: true };
}

export async function submitCampaign({ userId, data }: { userId: string; data: CampaignSubmission }) {
  await assertBrandUser(userId);

  const missing = data.mode === "launch" ? requiredMissing(data) : data.name.trim() ? [] : ["Campaign name"];
  if (missing.length) {
    console.warn("[Pegasus Launch] validation failed", { userId, missing });
    throw new Error(`Campaign could not be launched. Please check required fields. Missing: ${missing.join(", ")}.`);
  }

  const budgetMin = data.budget_min.trim() ? parseBudget(data.budget_min, "Budget min") : null;
  const budgetMax = data.budget_max.trim() ? parseBudget(data.budget_max, "Budget max") : null;
  if (budgetMin != null && budgetMax != null && budgetMin > budgetMax) {
    throw new Error("Campaign could not be launched. Please check required fields. Budget min must be lower than budget max.");
  }

  const brandValues = splitList(data.values);
  const campaignPayload: CampaignInsert = {
    brand_id: userId,
    name: data.name.trim(),
    goals: data.goals.trim() || null,
    description: data.description.trim() || null,
    preferred_athlete_types: splitList(data.audience),
    sports: splitList(data.sports),
    geographic_reach: splitList(data.geo),
    partnership_structure: data.partnership_structure.trim() || null,
    content_deliverables: data.deliverables.trim() || null,
    timeline: data.timeline.trim() || null,
    product_category: data.product_category.trim() || null,
    budget_min: budgetMin,
    budget_max: budgetMax,
    notes: data.notes.trim() || null,
    status: data.mode === "launch" ? "active" : "draft",
  };

  console.log("[Pegasus Launch] inserting campaign", {
    userId,
    status: campaignPayload.status,
    name: campaignPayload.name,
    sports: campaignPayload.sports,
    geo: campaignPayload.geographic_reach,
  });

  const { data: campaign, error } = await supabaseAdmin
    .from("campaigns")
    .insert(campaignPayload)
    .select("*")
    .single();

  if (error || !campaign) {
    console.error("[Pegasus Launch] campaign insert failed", error);
    throw new Error("Database error — campaign not saved.");
  }

  if (brandValues.length) {
    await supabaseAdmin.from("brand_profiles").update({ values: brandValues }).eq("user_id", userId);
  }

  if (data.mode === "draft") {
    return { campaignId: campaign.id, status: "draft" as const, matchCount: 0, fallbackUsed: false, matchingError: null };
  }

  try {
    const matchResult = await createMatches(userId, campaign, brandValues);
    return { campaignId: campaign.id, status: "active" as const, matchingError: null, ...matchResult };
  } catch (error) {
    console.error("[Pegasus Launch] matching failed after campaign save", error);
    return {
      campaignId: campaign.id,
      status: "active" as const,
      matchCount: 0,
      fallbackUsed: false,
      matchingError: "Campaign saved, but matching engine encountered an issue.",
    };
  }
}