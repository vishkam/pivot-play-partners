// Generates plain-English next-step strategies once a partnership is completed,
// so athlete + brand can plan an aligned follow-up rather than ending cold.

export interface StrategyInput {
  partnershipType?: string | null;
  athleteSport?: string | null;
  brandName?: string | null;
  values?: string[];
}

export function generatePostDealStrategies(input: StrategyInput): string {
  const { partnershipType, athleteSport, brandName, values = [] } = input;
  const sport = athleteSport ?? "your sport";
  const brand = brandName ?? "the brand";
  const valueLine = values.length
    ? `Lean into your shared values (${values.slice(0, 3).join(", ")}) in any next content.`
    : "Document the shared values from this campaign so the next pitch is sharper.";

  const lines = [
    `1. Recap & receipts — within 7 days, send ${brand} a one-page recap: reach, sentiment, sell-through if available, top-performing asset, athlete quote.`,
    `2. Renewal window — propose a Q+1 renewal (3–6 months) with a 10–15% rate uplift backed by the recap.`,
    `3. Cross-category expansion — explore adjacent product lines (training, recovery, lifestyle) you already use in ${sport}.`,
    `4. Earned media — pitch a joint story to one trade outlet (e.g. SportsPro, AdAge, BoF) framed around the campaign result.`,
    `5. Community activation — co-host one IRL event or clinic to convert audience into community.`,
    `6. UGC rights extension — negotiate paid usage of campaign assets in ${brand}'s paid social for 6 months.`,
  ];
  if (partnershipType?.toLowerCase().includes("ambassador")) {
    lines.push(`7. Long-term ambassadorship — convert this one-off into an annual ambassador deal with quarterly deliverables.`);
  }
  lines.push(`8. ${valueLine}`);
  return lines.join("\n");
}
