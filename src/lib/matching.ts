// Rule-based matching engine — Phase 3 MVP.
// Structured so a future AI scoring layer can replace `scoreAthlete`
// while keeping the same Match shape.

export interface AthleteForMatch {
  user_id: string;
  full_name?: string | null;
  country?: string | null;
  sport?: string | null;
  values?: string[] | null;
  causes?: string[] | null;
  audience_demographics?: { summary?: string } | Record<string, unknown> | null;
  pricing_min?: number | null;
  pricing_max?: number | null;
  partnership_types?: string[] | null;
  geographic_preferences?: string[] | null;
  verification_status?: string | null;
}

export interface CampaignForMatch {
  id?: string;
  name?: string | null;
  goals?: string | null;
  budget_min?: number | null;
  budget_max?: number | null;
  sports?: string[] | null;
  geographic_reach?: string[] | null;
  preferred_athlete_types?: string[] | null;
  partnership_structure?: string | null;
}

export interface BrandForMatch {
  values?: string[] | null;
  esg_priorities?: string[] | null;
  industry?: string | null;
  consumer_demographics?: { age?: string; gender?: string; geo?: string } | null;
}

export interface MatchScore {
  athlete_id: string;
  score: number;            // 0-100
  category: "Strong Match" | "Good Match" | "Emerging Match";
  values_score: number;
  audience_score: number;
  sport_score: number;
  budget_score: number;
  campaign_score: number;
  location_score: number;
  explanation: string;
  recommended_partnership: string;
  pricing_band: string;
  suggested_action: string;
}

const norm = (s: string) => s.toLowerCase().trim();
function overlap(a: string[] | null | undefined, b: string[] | null | undefined): number {
  if (!a?.length || !b?.length) return 0;
  const A = new Set(a.map(norm));
  let hit = 0;
  for (const x of b) if (A.has(norm(x))) hit++;
  return hit / Math.max(a.length, b.length);
}

function pct(v: number) {
  return Math.round(Math.min(100, Math.max(0, v * 100)));
}

export function scoreAthlete(
  athlete: AthleteForMatch,
  brand: BrandForMatch,
  campaign?: CampaignForMatch | null,
): MatchScore {
  // 1. Values (35%)
  const brandValues = [...(brand.values ?? []), ...(brand.esg_priorities ?? [])];
  const athleteValues = [...(athlete.values ?? []), ...(athlete.causes ?? [])];
  const valuesRaw = overlap(brandValues, athleteValues);
  const values_score = pct(valuesRaw || 0.25);

  // 2. Audience fit (20%) — text-similarity heuristic on demo summary
  const audienceText = String(
    (athlete.audience_demographics as { summary?: string } | null)?.summary ?? "",
  ).toLowerCase();
  const targetGeo = (brand.consumer_demographics?.geo ?? "").toLowerCase();
  const targetGender = (brand.consumer_demographics?.gender ?? "").toLowerCase();
  const targetAge = (brand.consumer_demographics?.age ?? "").toLowerCase();
  let audienceHits = 0;
  if (targetGeo && targetGeo.split(/[\s,/]+/).some((p) => p && audienceText.includes(p))) audienceHits++;
  if (targetGender && audienceText.includes("women") && targetGender.includes("women")) audienceHits++;
  if (targetAge && audienceText.includes(targetAge.slice(0, 2))) audienceHits++;
  const audience_score = pct(audienceHits / 3 || 0.4);

  // 3. Sport / category (15%)
  const sportMatch = campaign?.sports?.length
    ? campaign.sports.some((s) =>
        norm(s) === norm(athlete.sport ?? "") || norm(s).includes("multi"),
      )
    : true;
  const sport_score = pct(sportMatch ? 0.9 : 0.45);

  // 4. Budget compatibility (15%)
  let budgetRaw = 0.5;
  if (campaign?.budget_min && campaign?.budget_max && athlete.pricing_min && athlete.pricing_max) {
    const overlapLo = Math.max(campaign.budget_min, athlete.pricing_min);
    const overlapHi = Math.min(campaign.budget_max, athlete.pricing_max);
    if (overlapHi >= overlapLo) {
      const span = overlapHi - overlapLo;
      const range = Math.max(1, campaign.budget_max - campaign.budget_min);
      budgetRaw = 0.6 + 0.4 * Math.min(1, span / range);
    } else {
      budgetRaw = 0.2;
    }
  }
  const budget_score = pct(budgetRaw);

  // 5. Campaign objective fit (10%)
  const campaign_score = pct(
    campaign?.preferred_athlete_types?.length
      ? overlap(campaign.preferred_athlete_types, [athlete.sport ?? "", ...(athlete.values ?? [])]) || 0.5
      : 0.6,
  );

  // 6. Location / availability (5%)
  const location_score = pct(
    campaign?.geographic_reach?.length
      ? campaign.geographic_reach.some((g) => norm(g).includes(norm(athlete.country ?? "")) || norm(athlete.country ?? "").includes(norm(g))) ? 1 : 0.4
      : 0.7,
  );

  // Weighted total
  const score = Math.round(
    values_score * 0.35 +
      audience_score * 0.2 +
      sport_score * 0.15 +
      budget_score * 0.15 +
      campaign_score * 0.1 +
      location_score * 0.05,
  );

  const category: MatchScore["category"] =
    score >= 78 ? "Strong Match" : score >= 60 ? "Good Match" : "Emerging Match";

  const sharedValues = (brand.values ?? []).filter((v) =>
    athleteValues.map(norm).includes(norm(v)),
  );
  const sharedTxt = sharedValues.length
    ? sharedValues.slice(0, 3).join(", ")
    : "purpose-led storytelling";

  const explanation =
    `${athlete.full_name ?? "This athlete"} is a ${category.toLowerCase()} for ${
      campaign?.name ?? "your brand"
    } because she shares your ${sharedTxt} focus, reaches ${
      audienceText || "an engaged values-driven audience"
    }, competes in ${athlete.sport ?? "her discipline"} which aligns with the campaign brief, and ${
      budget_score >= 60 ? "fits comfortably inside your budget band" : "sits slightly outside your stated budget"
    }.`;

  const recommended_partnership =
    (athlete.partnership_types?.[0] ?? campaign?.partnership_structure ?? "Ambassador deal");
  const pricing_band =
    athlete.pricing_min && athlete.pricing_max
      ? `$${athlete.pricing_min.toLocaleString()} – $${athlete.pricing_max.toLocaleString()}`
      : "On request";
  const suggested_action =
    category === "Strong Match"
      ? "Send a personalized proposal this week."
      : category === "Good Match"
        ? "Save to shortlist and benchmark against 2–3 others."
        : "Open with a discovery message to gauge fit.";

  return {
    athlete_id: athlete.user_id,
    score,
    category,
    values_score,
    audience_score,
    sport_score,
    budget_score,
    campaign_score,
    location_score,
    explanation,
    recommended_partnership,
    pricing_band,
    suggested_action,
  };
}

export function rankAthletes(
  athletes: AthleteForMatch[],
  brand: BrandForMatch,
  campaign?: CampaignForMatch | null,
): MatchScore[] {
  return athletes
    .map((a) => scoreAthlete(a, brand, campaign))
    .sort((a, b) => b.score - a.score);
}
