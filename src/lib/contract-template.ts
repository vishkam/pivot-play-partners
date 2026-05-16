// Contract generation helpers — plain-language summary + structured template.

export interface ContractInput {
  brandName: string;
  athleteName: string;
  campaignName?: string | null;
  partnershipType?: string | null;
  compensation: number;
  platformFeePct?: number; // default 10
  timeline?: string | null;
  deliverables?: string | null;
}

export function calcPayout(amount: number, feePct = 10) {
  const fee = Math.round((amount * feePct) / 100);
  const payout = amount - fee;
  return { fee, payout };
}

export function buildPlainSummary(i: ContractInput): string {
  const { fee, payout } = calcPayout(i.compensation, i.platformFeePct ?? 10);
  return [
    `${i.brandName} is partnering with ${i.athleteName}${i.campaignName ? ` on the "${i.campaignName}" campaign` : ""}.`,
    `${i.athleteName} will deliver ${i.deliverables || "the agreed campaign deliverables"} over ${i.timeline || "the agreed timeline"}.`,
    `Total compensation is $${i.compensation.toLocaleString()}. After Allyance's ${(i.platformFeePct ?? 10)}% platform fee ($${fee.toLocaleString()}), ${i.athleteName} receives $${payout.toLocaleString()}.`,
    `Payment is held in escrow on contract signing and released when the campaign is marked complete.`,
    `Either party may cancel before signing; after signing, cancellation follows the terms below.`,
  ].join(" ");
}

export const DEFAULT_USAGE_RIGHTS =
  "Brand may repurpose delivered content on owned channels for 12 months. Paid media rights require written consent and additional compensation.";

export const DEFAULT_EXCLUSIVITY =
  "Category exclusivity within the partnership window only. Athlete remains free to work with non-competing brands.";

export const DEFAULT_CANCELLATION =
  "Either party may cancel with 14 days notice. If brand cancels post-signing, 50% of compensation is released to athlete for work-to-date.";

export const DEFAULT_PAYMENT_SCHEDULE =
  "50% on contract signing (held in escrow), 50% on campaign completion.";
