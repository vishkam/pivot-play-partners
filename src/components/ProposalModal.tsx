import { useState } from "react";
import { X, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { buildProposalBody } from "@/lib/proposal-template";
import type { MatchScore } from "@/lib/matching";

interface Props {
  open: boolean;
  onClose: () => void;
  athleteId: string;
  athleteName: string;
  brandName: string;
  campaign?: { id: string; name: string; goals: string | null } | null;
  match: MatchScore;
  onSent?: () => void;
}

export function ProposalModal({
  open,
  onClose,
  athleteId,
  athleteName,
  brandName,
  campaign,
  match,
  onSent,
}: Props) {
  const { user } = useAuth();
  const [amount, setAmount] = useState<string>(String(match.score > 75 ? 12000 : 7500));
  const [timeline, setTimeline] = useState("6 weeks");
  const [deliverables, setDeliverables] = useState("3 IG posts, 1 reel, 1 event appearance");
  const [partnershipType, setPartnershipType] = useState(match.recommended_partnership);
  const [brandMessage, setBrandMessage] = useState("");
  const [sending, setSending] = useState(false);

  if (!open) return null;

  const previewBody = buildProposalBody({
    brandName,
    athleteName,
    campaignName: campaign?.name,
    campaignGoals: campaign?.goals ?? undefined,
    match,
    proposedAmount: Number(amount || 0),
    timeline,
    deliverables,
    partnershipType,
    brandMessage,
  });

  async function send() {
    if (!user) return;
    setSending(true);
    try {
      const { data: proposal, error } = await supabase.from("proposals").insert({
        brand_id: user.id,
        athlete_id: athleteId,
        campaign_id: campaign?.id ?? null,
        body: previewBody,
        proposed_amount: Number(amount || 0),
        partnership_type: partnershipType,
        timeline,
        deliverables,
        status: "sent",
      }).select("id").single();
      if (error) throw error;

      // Notify the athlete + drop a message thread entry so the demo feels live
      await Promise.all([
        supabase.from("notifications").insert({
          user_id: athleteId,
          kind: "proposal",
          title: `New proposal from ${brandName}`,
          body: `${campaign?.name ?? "Partnership"} · $${Number(amount || 0).toLocaleString()}`,
          link: "/athlete/opportunities",
        }),
        supabase.from("messages").insert({
          sender_id: user.id,
          recipient_id: athleteId,
          body: `Proposal sent: ${campaign?.name ?? "Partnership"} — $${Number(amount || 0).toLocaleString()}. Review in your opportunities inbox.`,
          proposal_id: proposal?.id ?? null,
          system_event: "proposal_sent",
        }),
      ]).catch((e) => console.warn("notify athlete failed", e));

      toast.success("Proposal sent · Athlete notified");
      onSent?.(proposal?.id);
      onClose();
    } catch (e) {
      console.error(e);
      toast.error("Couldn't send proposal");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-plum-deep/50 px-4 py-8">
      <div className="relative grid max-h-[90vh] w-full max-w-4xl grid-cols-1 overflow-hidden rounded-3xl border border-border bg-background shadow-elegant md:grid-cols-2">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-cream p-1.5 text-plum hover:bg-plum/10"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="overflow-y-auto p-8">
          <p className="text-xs uppercase tracking-[0.25em] text-plum">Send proposal</p>
          <h2 className="mt-1 font-display text-2xl">To {athleteName}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {campaign?.name ?? "No campaign linked"}
          </p>

          <div className="mt-5 space-y-4">
            <Field label="Partnership type">
              <input
                value={partnershipType}
                onChange={(e) => setPartnershipType(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Compensation ($)">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Timeline">
              <input
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Deliverables">
              <textarea
                value={deliverables}
                onChange={(e) => setDeliverables(e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Personal note (optional)">
              <textarea
                value={brandMessage}
                onChange={(e) => setBrandMessage(e.target.value)}
                rows={3}
                placeholder="Why she specifically — beyond the brief."
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              />
            </Field>
          </div>

          <button
            onClick={send}
            disabled={sending}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-plum-deep px-5 py-3 text-sm font-medium text-cream hover:opacity-90 disabled:opacity-50"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send proposal
          </button>
        </div>

        <div className="hidden flex-col bg-secondary md:flex">
          <div className="border-b border-border bg-cream px-6 py-4">
            <p className="text-xs uppercase tracking-[0.25em] text-plum">Live preview</p>
          </div>
          <div className="flex-1 overflow-y-auto whitespace-pre-wrap p-6 text-sm leading-relaxed text-foreground/90">
            {previewBody}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
