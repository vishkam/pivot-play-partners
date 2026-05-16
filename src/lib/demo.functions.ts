import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type DemoRole = "athlete" | "brand" | "admin";

const DEMO_PASSWORD = "PegasusDemo2026!";

const DEMO_USERS: Record<DemoRole, { email: string; full_name: string }> = {
  athlete: { email: "demo-athlete@pegasus.app", full_name: "Maya Rivera" },
  brand: { email: "demo-brand@pegasus.app", full_name: "Lumen Wellness" },
  admin: { email: "demo-admin@pegasus.app", full_name: "Pegasus Admin" },
};

// Extra seeded athletes & brands so the marketplace feels alive
const EXTRA_ATHLETES = [
  { email: "demo-a-sofia@pegasus.app", full_name: "Sofia Kim", sport: "Tennis", discipline: "Singles",
    rankings: "WTA #38", achievements: "Grand Slam quarterfinalist · 4 ATP titles",
    values: ["Equity in sport", "Education", "Mental health"], country: "South Korea",
    favorite_brands: ["Wilson", "Nike", "Therabody"], pricing_min: 8000, pricing_max: 60000, completeness: 88 },
  { email: "demo-a-amara@pegasus.app", full_name: "Amara Bennett", sport: "Track & Field", discipline: "Sprints 100m / 200m",
    rankings: "World ranking #21", achievements: "World Championship bronze · NCAA champion",
    values: ["Body positivity", "Community", "Sustainability"], country: "United States",
    favorite_brands: ["Asics", "Athleta", "Liquid IV"], pricing_min: 6000, pricing_max: 48000, completeness: 84 },
  { email: "demo-a-elena@pegasus.app", full_name: "Elena Russo", sport: "Cycling", discipline: "Road racing",
    rankings: "UCI top 25", achievements: "Giro Donne stage winner · National TT champion",
    values: ["Sustainability", "Clean transport", "Women in leadership"], country: "Italy",
    favorite_brands: ["Castelli", "Specialized", "Wahoo"], pricing_min: 7000, pricing_max: 55000, completeness: 91 },
  { email: "demo-a-priya@pegasus.app", full_name: "Priya Shah", sport: "Climbing", discipline: "Sport · Lead",
    rankings: "IFSC top 15", achievements: "World Cup podium · 2x national champion",
    values: ["Conservation", "Inclusion", "Mental health"], country: "India",
    favorite_brands: ["La Sportiva", "Patagonia", "Black Diamond"], pricing_min: 4500, pricing_max: 38000, completeness: 79 },
];

const EXTRA_BRANDS = [
  { email: "demo-b-aero@pegasus.app", full_name: "Aerolite Footwear", brand_name: "Aerolite",
    industry: "Apparel & Footwear", revenue_stage: "$25M–$100M ARR",
    values: ["Performance", "Sustainability"], mission: "Lightweight footwear engineered for women's biomechanics.",
    positioning: "Performance footwear for elite women" },
  { email: "demo-b-soluna@pegasus.app", full_name: "Soluna Skincare", brand_name: "Soluna",
    industry: "Beauty & Skincare", revenue_stage: "$5M–$25M ARR",
    values: ["Clean ingredients", "Women-led"], mission: "Performance skincare formulated for athletes outdoors.",
    positioning: "Clean skincare for women in motion" },
];

interface SeedUser { id: string; email: string; }

async function upsertAuthUser(email: string, full_name: string, role: DemoRole): Promise<string> {
  // Page through users to find by email (admin list caps at 200/page)
  for (let page = 1; page <= 5; page++) {
    const { data } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
    const found = data?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (found) {
      await supabaseAdmin.auth.admin.updateUserById(found.id, {
        password: DEMO_PASSWORD, email_confirm: true, user_metadata: { full_name, role },
      });
      return found.id;
    }
    if (!data?.users || data.users.length < 200) break;
  }
  const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
    email, password: DEMO_PASSWORD, email_confirm: true, user_metadata: { full_name, role },
  });
  if (error || !created.user) throw new Error(error?.message ?? `Failed to create ${email}`);
  return created.user.id;
}

async function ensureProfile(userId: string, email: string, full_name: string, role: DemoRole, country?: string) {
  await supabaseAdmin.from("profiles").upsert(
    { id: userId, email, full_name, primary_role: role, onboarding_completed: true, country: country ?? null },
    { onConflict: "id" },
  );
  const { data: existingRole } = await supabaseAdmin
    .from("user_roles").select("id").eq("user_id", userId).eq("role", role).maybeSingle();
  if (!existingRole) await supabaseAdmin.from("user_roles").insert({ user_id: userId, role });
}

async function seedDemoAthlete(userId: string) {
  await supabaseAdmin.from("athlete_profiles").upsert(
    {
      user_id: userId, sport: "Swimming", discipline: "Freestyle 200m",
      professional_level: "Pro / National Team", team_federation: "USA Swimming",
      rankings: "National top 10 · World ranking #42",
      achievements: "2x national champion · Olympic trials finalist",
      values: ["Sustainability", "Mental health", "Equity in sport"],
      causes: ["Girls in STEM", "Ocean conservation"],
      story: "Recovering from injury taught me the power of clean nutrition, recovery routines and brands that show up for women athletes.",
      favorite_brands: ["TYR", "Arena", "Lululemon", "Hoka"],
      favorite_products: "Tech racing suits, recovery wear, clean electrolytes",
      material_preferences: ["Recycled polyester", "Carbon-fiber composites", "Merino blends"],
      sponsorship_categories: ["Apparel", "Nutrition", "Recovery tech"],
      partnership_types: ["Long-term ambassador", "Campaign", "Product seeding"],
      availability: "Open to 3–5 partnerships in 2026",
      pricing_min: 5000, pricing_max: 45000, profile_completeness: 92,
      verification_status: "verified",
      social_links: { instagram: "@maya.swims", tiktok: "@mayar", youtube: "Maya Rivera" },
      audience_demographics: { female_pct: 68, age_18_34_pct: 71, top_geos: ["US", "UK", "AU"] },
    },
    { onConflict: "user_id" },
  );
}

async function seedDemoBrand(userId: string) {
  await supabaseAdmin.from("brand_profiles").upsert(
    {
      user_id: userId, brand_name: "Lumen Wellness", website: "https://lumenwellness.demo",
      industry: "Health & Nutrition", revenue_stage: "$5M–$25M ARR",
      contact_role: "Head of Brand Partnerships",
      values: ["Clean ingredients", "Women-led", "Sustainability"],
      mission: "Help women athletes recover smarter with clean, science-backed nutrition.",
      esg_priorities: ["Recyclable packaging", "Carbon-neutral shipping"],
      positioning: "Premium recovery nutrition for performance women",
      consumer_demographics: { female_pct: 74, age_25_44_pct: 66 },
      verification_status: "verified",
    },
    { onConflict: "user_id" },
  );
}

async function seedMarketplace(athleteId: string, brandId: string) {
  // Idempotency guard: if any contract already exists between them, assume seeded
  const { data: existingContract } = await supabaseAdmin
    .from("contracts").select("id").eq("athlete_id", athleteId).eq("brand_id", brandId).limit(1).maybeSingle();
  if (existingContract) return;

  // Pricing packages for demo athlete
  await supabaseAdmin.from("pricing_profiles").insert([
    { athlete_id: athleteId, package_type: "Instagram post", price_min: 2500, price_max: 5000, unit: "post",
      description: "Static or carousel post + 2 stories. Audience: 184k, 68% women." },
    { athlete_id: athleteId, package_type: "Reel / TikTok", price_min: 4500, price_max: 9000, unit: "video",
      description: "Concept + production + post. Avg 240k views." },
    { athlete_id: athleteId, package_type: "Long-term ambassador", price_min: 25000, price_max: 60000, unit: "6 months",
      description: "Ambassador role, monthly content, event activations, jersey/race-suit branding." },
  ]);

  // Extra athlete & brand auth users
  const extraAthletes: (SeedUser & { rec: typeof EXTRA_ATHLETES[number] })[] = [];
  for (const a of EXTRA_ATHLETES) {
    const id = await upsertAuthUser(a.email, a.full_name, "athlete");
    await ensureProfile(id, a.email, a.full_name, "athlete", a.country);
    await supabaseAdmin.from("athlete_profiles").upsert({
      user_id: id, sport: a.sport, discipline: a.discipline,
      professional_level: "Pro", rankings: a.rankings, achievements: a.achievements,
      values: a.values, favorite_brands: a.favorite_brands,
      pricing_min: a.pricing_min, pricing_max: a.pricing_max,
      profile_completeness: a.completeness, verification_status: "verified",
      sponsorship_categories: ["Apparel", "Nutrition"],
      audience_demographics: { female_pct: 60 + Math.floor(Math.random() * 20), age_18_34_pct: 60 + Math.floor(Math.random() * 25) },
    }, { onConflict: "user_id" });
    extraAthletes.push({ id, email: a.email, rec: a });
  }

  const extraBrands: (SeedUser & { rec: typeof EXTRA_BRANDS[number] })[] = [];
  for (const b of EXTRA_BRANDS) {
    const id = await upsertAuthUser(b.email, b.full_name, "brand");
    await ensureProfile(id, b.email, b.full_name, "brand", "United States");
    await supabaseAdmin.from("brand_profiles").upsert({
      user_id: id, brand_name: b.brand_name, industry: b.industry, revenue_stage: b.revenue_stage,
      values: b.values, mission: b.mission, positioning: b.positioning, verification_status: "verified",
    }, { onConflict: "user_id" });
    extraBrands.push({ id, email: b.email, rec: b });
  }

  // Campaigns for demo brand
  const campaignsPayload = [
    { brand_id: brandId, name: "Spring Recovery Launch", status: "active" as const,
      description: "Hero campaign for our new electrolyte recovery line, focused on swimmers, runners and cyclists.",
      goals: "Drive 50k qualified site visits + 3.5k trial bottle sign-ups.",
      sports: ["Swimming", "Track & Field", "Cycling"], geographic_reach: ["United States", "Canada", "United Kingdom"],
      preferred_athlete_types: ["Verified pro", "Authentic story", "Mid audience (50k–500k)"],
      budget_min: 60000, budget_max: 140000, timeline: "Mar – May 2026",
      partnership_structure: "Cash + product seeding + revenue share on referral codes",
      content_deliverables: "2x Reels, 4x posts, 1x event activation", product_category: "Nutrition" },
    { brand_id: brandId, name: "Olympic Trials Activation", status: "active" as const,
      description: "On-site activation around US Olympic trials with hospitality lounge and athlete content series.",
      goals: "300% lift in brand search + earn media coverage.",
      sports: ["Swimming", "Gymnastics"], geographic_reach: ["United States"],
      preferred_athlete_types: ["Olympic hopeful", "Strong storyteller"],
      budget_min: 90000, budget_max: 220000, timeline: "Jun – Jul 2026",
      partnership_structure: "Cash + hospitality + ambassador retainer",
      content_deliverables: "Lounge appearance, 3x content drops", product_category: "Recovery" },
    { brand_id: brandId, name: "Founders Series — Athlete Stories", status: "draft" as const,
      description: "Long-form mini-documentary series featuring 6 women athletes and their recovery rituals.",
      goals: "Brand love + 6 evergreen content pieces.",
      sports: ["Swimming", "Climbing", "Cycling", "Track & Field"], geographic_reach: ["Global"],
      preferred_athlete_types: ["Verified pro", "Authentic story"],
      budget_min: 150000, budget_max: 280000, timeline: "Q4 2026",
      partnership_structure: "Cash + content licensing", content_deliverables: "1 documentary + 4 social cutdowns",
      product_category: "Brand" },
  ];
  const { data: insertedCampaigns } = await supabaseAdmin
    .from("campaigns").insert(campaignsPayload).select("id, name");
  const springCampaign = insertedCampaigns?.find((c) => c.name === "Spring Recovery Launch");
  const trialsCampaign = insertedCampaigns?.find((c) => c.name === "Olympic Trials Activation");

  // Matches: demo athlete with all brands, and extra athletes with demo brand
  const matchesPayload: Array<{
    athlete_id: string; brand_id: string; campaign_id?: string | null; score: number;
    values_score?: number; audience_score?: number; budget_score?: number; sport_score?: number;
    campaign_score?: number; explanation?: string; saved_by_brand?: boolean;
  }> = [
    { athlete_id: athleteId, brand_id: brandId, campaign_id: springCampaign?.id, score: 94,
      values_score: 96, audience_score: 88, budget_score: 92, sport_score: 95, campaign_score: 93,
      explanation: "Shared values (sustainability, women's health), audience overlap, perfect sport + budget fit.",
      saved_by_brand: true },
    { athlete_id: athleteId, brand_id: brandId, campaign_id: trialsCampaign?.id, score: 90,
      values_score: 92, audience_score: 86, budget_score: 88, sport_score: 95, campaign_score: 90,
      explanation: "Olympic-trials proximity + on-brand recovery storytelling.", saved_by_brand: true },
  ];
  for (const a of extraAthletes) {
    matchesPayload.push({
      athlete_id: a.id, brand_id: brandId, campaign_id: springCampaign?.id,
      score: 70 + Math.floor(Math.random() * 22),
      values_score: 70 + Math.floor(Math.random() * 25), audience_score: 65 + Math.floor(Math.random() * 30),
      budget_score: 70 + Math.floor(Math.random() * 25), sport_score: 60 + Math.floor(Math.random() * 35),
      explanation: `${a.rec.full_name} aligns on ${a.rec.values.slice(0, 2).join(" + ")}.`,
      saved_by_brand: Math.random() > 0.5,
    });
  }
  for (const b of extraBrands) {
    matchesPayload.push({
      athlete_id: athleteId, brand_id: b.id, score: 75 + Math.floor(Math.random() * 18),
      values_score: 78, audience_score: 80, budget_score: 82, sport_score: 75,
      explanation: `${b.rec.brand_name} matches Maya's ${b.rec.values[0].toLowerCase()} values.`,
    });
  }
  await supabaseAdmin.from("matches").insert(matchesPayload);

  // Saved athletes
  await supabaseAdmin.from("saved_athletes").insert([
    { brand_id: brandId, athlete_id: athleteId, notes: "Top of shortlist — schedule call." },
    ...extraAthletes.slice(0, 2).map((a) => ({ brand_id: brandId, athlete_id: a.id, notes: "Strong audience fit." })),
  ]);

  // Proposals
  const { data: proposals } = await supabaseAdmin.from("proposals").insert([
    { brand_id: brandId, athlete_id: athleteId, campaign_id: springCampaign?.id,
      body: "Hi Maya — your recovery + clean nutrition story aligns perfectly with our Spring launch. Proposing $14k + product seeding for 2 Reels, 4 posts and one event.",
      proposed_amount: 14000, partnership_type: "Campaign",
      deliverables: "2x Reels, 4x posts, 1x in-store event", timeline: "6 weeks (Mar–Apr 2026)",
      status: "accepted" as const, athlete_response: "Love this — let's lock it in." },
    { brand_id: brandId, athlete_id: athleteId, campaign_id: trialsCampaign?.id,
      body: "Olympic trials activation — proposing $28k retainer + hospitality + content series.",
      proposed_amount: 28000, partnership_type: "Ambassador",
      deliverables: "Lounge appearance, 3x content drops", timeline: "Jun–Jul 2026", status: "sent" as const },
    { brand_id: brandId, athlete_id: extraAthletes[0].id, campaign_id: springCampaign?.id,
      body: "Hi Sofia — would love to feature you in the Spring Recovery launch. Proposing $18k + product.",
      proposed_amount: 18000, partnership_type: "Campaign",
      deliverables: "3x posts, 1x Reel", timeline: "4 weeks", status: "negotiating" as const,
      athlete_response: "Interested — can we discuss exclusivity terms?" },
  ]).select("id, campaign_id, athlete_id");

  const acceptedProposal = proposals?.[0];

  // Contracts
  const contractsPayload = [
    { brand_id: brandId, athlete_id: athleteId, campaign_id: springCampaign?.id,
      proposal_id: acceptedProposal?.id, title: "Spring Recovery Launch — Maya Rivera",
      status: "active" as const, compensation_amount: 14000, platform_fee_pct: 10,
      deliverables: "2x Reels, 4x posts, 1x in-store event",
      timeline: "Mar 1 – Apr 15, 2026", payment_schedule: "50% on signature · 50% on completion",
      usage_rights: "Brand may license deliverables for paid social for 90 days post-campaign.",
      exclusivity: "Category exclusivity (recovery nutrition) for term + 30 days.",
      cancellation_terms: "Either party may cancel with 14 days notice; deliverables completed are billable.",
      ethical_notes: "Athlete will disclose partnership per FTC #ad guidelines.",
      legal_notes: "Governing law: California. Disputes via Pegasus mediation first.",
      plain_summary: "Maya creates 2 Reels and 4 posts for Lumen's spring launch in exchange for $14k + product.",
      post_deal_strategies: "Repurpose Reels into 6 short-form cuts · Pitch earned coverage to runner's outlets · Refresh rate card +12% post-campaign.",
      signed_by_brand_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
      signed_by_athlete_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 11).toISOString() },
    { brand_id: brandId, athlete_id: extraAthletes[2].id, title: "Holiday Capsule — Elena Russo",
      status: "completed" as const, compensation_amount: 22000, platform_fee_pct: 10,
      deliverables: "1x Reel, 3x posts, 1x newsletter feature", timeline: "Nov – Dec 2025",
      payment_schedule: "Net 30 on completion", usage_rights: "Brand-owned for 6 months.",
      ethical_notes: "Sustainability claims pre-approved by brand legal.",
      plain_summary: "Elena featured Lumen's holiday capsule in Italian + EN content.",
      signed_by_brand_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
      signed_by_athlete_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 89).toISOString() },
    { brand_id: brandId, athlete_id: athleteId, title: "Recovery Sample Program — Q1",
      status: "draft" as const, compensation_amount: 4500, platform_fee_pct: 10,
      deliverables: "1x post + product feedback report", timeline: "Q1 2026",
      payment_schedule: "Lump sum on delivery",
      plain_summary: "Maya samples Lumen's Q1 product line and posts honest review." },
  ];
  const { data: insertedContracts } = await supabaseAdmin
    .from("contracts").insert(contractsPayload).select("id, title, status, compensation_amount, athlete_id, brand_id");

  const activeContract = insertedContracts?.find((c) => c.status === "active");
  const completedContract = insertedContracts?.find((c) => c.status === "completed");

  // Payments
  const paymentsPayload = [];
  if (activeContract) {
    paymentsPayload.push(
      { contract_id: activeContract.id, brand_id: brandId, athlete_id: athleteId, amount: 7000,
        platform_fee: 700, athlete_payout: 6300, status: "paid" as const,
        milestone_label: "Signature deposit",
        due_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString().slice(0, 10) },
      { contract_id: activeContract.id, brand_id: brandId, athlete_id: athleteId, amount: 7000,
        platform_fee: 700, athlete_payout: 6300, status: "pending" as const,
        milestone_label: "Completion + deliverables",
        due_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10) },
    );
  }
  if (completedContract) {
    paymentsPayload.push({
      contract_id: completedContract.id, brand_id: brandId, athlete_id: extraAthletes[2].id,
      amount: 22000, platform_fee: 2200, athlete_payout: 19800, status: "paid" as const,
      milestone_label: "Final payment",
      due_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString().slice(0, 10),
    });
  }
  if (paymentsPayload.length) await supabaseAdmin.from("payments").insert(paymentsPayload);

  // Messages
  await supabaseAdmin.from("messages").insert([
    { sender_id: brandId, recipient_id: athleteId, body: "Hey Maya! Loved your recent open-water feature. Sending over a Spring Launch brief now.", contract_id: activeContract?.id },
    { sender_id: athleteId, recipient_id: brandId, body: "Thanks! Brief looks great — happy to lock the Reels for week 2.", contract_id: activeContract?.id },
    { sender_id: brandId, recipient_id: athleteId, body: "Sent the contract for signature. Looking forward to working together!", contract_id: activeContract?.id, system_event: "contract_sent" },
    { sender_id: athleteId, recipient_id: brandId, body: "Signed ✍️ Excited for this." },
    { sender_id: extraBrands[0].id, recipient_id: athleteId, body: "Hi Maya — Aerolite here. Would love to explore a footwear partnership." },
  ]);

  // Notifications
  await supabaseAdmin.from("notifications").insert([
    { user_id: athleteId, kind: "match", title: "New 94% match", body: "Lumen Wellness · Spring Recovery Launch", link: "/athlete/feed" },
    { user_id: athleteId, kind: "proposal", title: "Proposal accepted", body: "$14k Spring Recovery campaign", link: "/athlete/opportunities" },
    { user_id: athleteId, kind: "payment", title: "Payment received", body: "$6,300 from Lumen Wellness", link: "/athlete/earnings" },
    { user_id: athleteId, kind: "insight", title: "AI suggestion", body: "Your rate card could increase ~12% based on recent matches.", link: "/athlete/pricing" },
    { user_id: brandId, kind: "match", title: "3 new athlete matches", body: "Spring Recovery Launch", link: "/brand/matches" },
    { user_id: brandId, kind: "proposal", title: "Sofia Kim is negotiating", body: "Spring Recovery — $18k proposal", link: "/brand/proposals" },
    { user_id: brandId, kind: "contract", title: "Contract signed", body: "Maya Rivera × Spring Recovery", link: "/brand/contracts" },
  ]);

  // Reviews on completed contract
  if (completedContract) {
    await supabaseAdmin.from("reviews").insert([
      { contract_id: completedContract.id, reviewer_id: brandId, reviewee_id: extraAthletes[2].id,
        reviewer_role: "brand", communication: 5, professionalism: 5, reliability: 5, campaign_success: 5,
        comment: "Elena was a dream — on-time, on-brand, drove real referral conversions." },
      { contract_id: completedContract.id, reviewer_id: extraAthletes[2].id, reviewee_id: brandId,
        reviewer_role: "athlete", communication: 5, professionalism: 5, reliability: 4, campaign_success: 5,
        comment: "Great team, clear briefs, paid on time." },
    ]);
  }
}

export const ensureDemoUser = createServerFn({ method: "POST" })
  .inputValidator((input: { role: DemoRole }) => input)
  .handler(async ({ data }) => {
    const role = data.role;
    const cfg = DEMO_USERS[role];
    if (!cfg) throw new Error("Invalid demo role");

    // Ensure all 3 core demo users always exist (so admin always sees data)
    const ids: Record<DemoRole, string> = { athlete: "", brand: "", admin: "" };
    for (const r of ["athlete", "brand", "admin"] as DemoRole[]) {
      const c = DEMO_USERS[r];
      ids[r] = await upsertAuthUser(c.email, c.full_name, r);
      await ensureProfile(ids[r], c.email, c.full_name, r, r === "admin" ? null as unknown as string : "United States");
    }
    await seedDemoAthlete(ids.athlete);
    await seedDemoBrand(ids.brand);

    // Seed the marketplace once (idempotent)
    try {
      await seedMarketplace(ids.athlete, ids.brand);
    } catch (e) {
      console.error("[demo seed] marketplace seed failed:", e);
    }

    return { email: cfg.email, password: DEMO_PASSWORD, role };
  });
