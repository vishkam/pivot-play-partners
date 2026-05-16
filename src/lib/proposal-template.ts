import type { MatchScore } from "./matching";

export interface ProposalTemplateInput {
  brandName: string;
  athleteName: string;
  campaignName?: string | null;
  campaignGoals?: string | null;
  match: MatchScore;
  proposedAmount: number;
  timeline?: string;
  deliverables?: string;
  partnershipType?: string;
  brandMessage?: string;
}

export function buildProposalBody(i: ProposalTemplateInput): string {
  return [
    `Hi ${i.athleteName.split(" ")[0]},`,
    "",
    `${i.brandName} would love to partner with you${
      i.campaignName ? ` on **${i.campaignName}**` : ""
    }.`,
    "",
    "**Why you**",
    i.match.explanation,
    "",
    "**Campaign summary**",
    i.campaignGoals || "A values-aligned campaign celebrating women in sport.",
    "",
    "**Proposed deliverables**",
    i.deliverables || "3 social posts, 1 long-form content piece, 1 event appearance.",
    "",
    "**Partnership type**",
    i.partnershipType || i.match.recommended_partnership,
    "",
    "**Timeline**",
    i.timeline || "6–8 weeks from countersignature.",
    "",
    "**Compensation**",
    `$${i.proposedAmount.toLocaleString()} cash + product, with bonuses tied to agreed KPIs.`,
    "",
    "**Next steps**",
    "If this resonates, accept the proposal to open a working channel. Request changes if you'd like to negotiate scope or fee.",
    "",
    i.brandMessage ? `_A note from ${i.brandName}:_ ${i.brandMessage}` : "",
    "",
    `— ${i.brandName}`,
  ]
    .filter(Boolean)
    .join("\n");
}
