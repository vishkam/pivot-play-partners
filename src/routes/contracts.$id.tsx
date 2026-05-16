import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Check, Download, ArrowLeft, Star, AlertOctagon } from "lucide-react";
import { toast } from "sonner";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { notify } from "@/components/NotificationBell";
import { calcPayout, DEFAULT_USAGE_RIGHTS, DEFAULT_EXCLUSIVITY, DEFAULT_CANCELLATION, DEFAULT_PAYMENT_SCHEDULE } from "@/lib/contract-template";
import { generatePostDealStrategies } from "@/lib/post-deal-strategies";
import { StatusChip } from "./athlete.contracts";

export const Route = createFileRoute("/contracts/$id")({
  component: () => (
    <RequireAuth roles={["athlete", "brand", "admin"]}>
      <ContractDetail />
    </RequireAuth>
  ),
});

interface Contract {
  id: string; athlete_id: string; brand_id: string; title: string;
  deliverables: string | null; compensation_amount: number; platform_fee_pct: number;
  timeline: string | null; usage_rights: string | null; exclusivity: string | null;
  cancellation_terms: string | null; payment_schedule: string | null;
  plain_summary: string | null; status: string;
  signed_by_brand_at: string | null; signed_by_athlete_at: string | null;
  legal_notes: string | null; ethical_notes: string | null;
  post_deal_strategies: string | null;
}

function ContractDetail() {
  const { id } = Route.useParams();
  const { user, role } = useAuth();
  const [c, setC] = useState<Contract | null>(null);
  const [busy, setBusy] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  async function load() {
    const { data } = await supabase.from("contracts").select("*").eq("id", id).maybeSingle();
    setC(data as Contract | null);
  }
  useEffect(() => { load(); }, [id]);

  async function sign() {
    if (!c || !user) return;
    setBusy(true);
    const isBrand = user.id === c.brand_id;
    const bothSigned = isBrand ? !!c.signed_by_athlete_at : !!c.signed_by_brand_at;
    const ts = new Date().toISOString();
    const update = isBrand
      ? { signed_by_brand_at: ts, ...(bothSigned ? { status: "active" as const } : {}) }
      : { signed_by_athlete_at: ts, ...(bothSigned ? { status: "active" as const } : {}) };
    const { error } = await supabase.from("contracts").update(update).eq("id", c.id);
    if (!error && bothSigned) {
      const { fee, payout } = calcPayout(c.compensation_amount, c.platform_fee_pct);
      await supabase.from("payments").insert([
        { contract_id: c.id, athlete_id: c.athlete_id, brand_id: c.brand_id,
          amount: Math.round(c.compensation_amount / 2), platform_fee: Math.round(fee / 2),
          athlete_payout: Math.round(payout / 2), milestone_label: "50% on signing", status: "escrow" },
        { contract_id: c.id, athlete_id: c.athlete_id, brand_id: c.brand_id,
          amount: c.compensation_amount - Math.round(c.compensation_amount / 2),
          platform_fee: fee - Math.round(fee / 2),
          athlete_payout: payout - Math.round(payout / 2),
          milestone_label: "50% on completion", status: "pending" },
      ]);
      const other = user.id === c.brand_id ? c.athlete_id : c.brand_id;
      notify(other, "contract", "Contract is now active", "Both parties have signed.", `/contracts/${c.id}`);
    }
    setBusy(false);
    if (error) toast.error(error.message); else toast.success(bothSigned ? "Signed — contract is active." : "Signed");
    load();
  }

  async function markComplete() {
    if (!c || !user) return;
    setBusy(true);
    // Generate post-deal strategies if not already present
    let strategiesUpdate: { post_deal_strategies?: string } = {};
    if (!c.post_deal_strategies) {
      const { data: ap } = await supabase
        .from("athlete_profiles").select("sport, values").eq("user_id", c.athlete_id).maybeSingle();
      const { data: bp } = await supabase
        .from("brand_profiles").select("brand_name").eq("user_id", c.brand_id).maybeSingle();
      strategiesUpdate = {
        post_deal_strategies: generatePostDealStrategies({
          partnershipType: c.exclusivity,
          athleteSport: ap?.sport ?? null,
          brandName: bp?.brand_name ?? null,
          values: (ap?.values as string[] | null) ?? [],
        }),
      };
    }
    await supabase.from("contracts").update({ status: "completed", ...strategiesUpdate }).eq("id", c.id);
    await supabase.from("payments").update({ status: "released" }).eq("contract_id", c.id).eq("status", "escrow");
    await supabase.from("payments").update({ status: "released" }).eq("contract_id", c.id).eq("status", "pending");
    setBusy(false);
    toast.success("Marked complete — funds released & next-step strategies generated.");
    load();
    setReviewOpen(true);
  }

  async function cancel() {
    if (!c) return;
    if (!confirm("Cancel this contract?")) return;
    await supabase.from("contracts").update({ status: "cancelled" }).eq("id", c.id);
    toast.success("Contract cancelled");
    load();
  }

  if (!c) {
    return <DashboardShell title="Contract"><div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-plum" /></div></DashboardShell>;
  }

  const { fee, payout } = calcPayout(c.compensation_amount, c.platform_fee_pct);
  const mySigned = user?.id === c.brand_id ? c.signed_by_brand_at : c.signed_by_athlete_at;
  const canSign = (role === "athlete" || role === "brand") && c.status === "pending_signature" && !mySigned;
  const canComplete = c.status === "active" && (role === "brand" || role === "athlete");

  return (
    <DashboardShell
      title={c.title}
      subtitle="Partnership agreement"
      actions={
        <Link to={role === "athlete" ? "/athlete/contracts" : role === "brand" ? "/brand/contracts" : "/admin/contracts"}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-cream px-4 py-2 text-xs text-plum hover:bg-plum/5">
          <ArrowLeft className="h-3.5 w-3.5" /> All contracts
        </Link>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl">Plain-language summary</h3>
              <StatusChip status={c.status} />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-foreground/85">{c.plain_summary}</p>
          </Card>

          <Card>
            <h3 className="font-display text-xl">Terms</h3>
            <div className="mt-4 grid gap-4 text-sm">
              <Term label="Deliverables" value={c.deliverables || "—"} />
              <Term label="Timeline" value={c.timeline || "—"} />
              <Term label="Usage rights" value={c.usage_rights || DEFAULT_USAGE_RIGHTS} />
              <Term label="Exclusivity" value={c.exclusivity || DEFAULT_EXCLUSIVITY} />
              <Term label="Payment schedule" value={c.payment_schedule || DEFAULT_PAYMENT_SCHEDULE} />
              <Term label="Cancellation" value={c.cancellation_terms || DEFAULT_CANCELLATION} />
            </div>
          </Card>

          <LegalEthicalCard contract={c} onSaved={load} canEdit={(role === "athlete" && user?.id === c.athlete_id) || (role === "brand" && user?.id === c.brand_id)} />

          {c.status === "completed" && c.post_deal_strategies && (
            <Card>
              <h3 className="font-display text-xl">What's next — aligned strategies</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Auto-generated playbook to convert this win into the next one.
              </p>
              <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-secondary p-4 text-sm leading-relaxed text-foreground/85 font-sans">{c.post_deal_strategies}</pre>
            </Card>
          )}

          <Card>
            <h3 className="font-display text-xl">Signatures</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <SigBox label="Brand" signedAt={c.signed_by_brand_at} />
              <SigBox label="Athlete" signedAt={c.signed_by_athlete_at} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {canSign && (
                <button onClick={sign} disabled={busy}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-gold px-5 py-2.5 text-sm font-medium text-plum-deep shadow-gold disabled:opacity-50">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Sign contract
                </button>
              )}
              {canComplete && (
                <button onClick={markComplete} disabled={busy}
                  className="inline-flex items-center gap-2 rounded-full bg-plum-deep px-5 py-2.5 text-sm font-medium text-cream disabled:opacity-50">
                  <Check className="h-4 w-4" /> Mark complete & release funds
                </button>
              )}
              {(c.status === "pending_signature" || c.status === "active") && (
                <button onClick={cancel}
                  className="inline-flex items-center gap-2 rounded-full border border-destructive/30 px-4 py-2 text-xs text-destructive hover:bg-destructive/5">
                  Cancel
                </button>
              )}
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-cream px-4 py-2 text-xs text-plum hover:bg-plum/5">
                <Download className="h-3.5 w-3.5" /> Export
              </button>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h3 className="font-display text-xl">Financial summary</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <FinRow label="Brand total cost" value={`$${c.compensation_amount.toLocaleString()}`} />
              <FinRow label={`Platform commission (${c.platform_fee_pct}%)`} value={`$${fee.toLocaleString()}`} />
              <FinRow label="Estimated athlete payout" value={`$${payout.toLocaleString()}`} accent />
            </dl>
            <p className="mt-3 text-[11px] text-muted-foreground">Funds held in escrow on signing. Released when campaign is marked complete.</p>
          </Card>

          <Card>
            <h3 className="font-display text-xl">Trust & safety</h3>
            <p className="mt-2 text-xs text-muted-foreground">
              Spotted something off? File a dispute and Allyance moderators will review within 48h.
            </p>
            <Link to="/disputes/new" search={{ contract_id: c.id }}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-destructive hover:underline">
              <AlertOctagon className="h-3.5 w-3.5" /> Report an issue
            </Link>
          </Card>
        </div>
      </div>

      {reviewOpen && <ReviewModal contractId={c.id} athleteId={c.athlete_id} brandId={c.brand_id} onClose={() => setReviewOpen(false)} />}
    </DashboardShell>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-border bg-cream p-6 shadow-sm">{children}</div>;
}
function Term({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm text-foreground/85">{value}</p>
    </div>
  );
}
function SigBox({ label, signedAt }: { label: string; signedAt: string | null }) {
  return (
    <div className={`rounded-xl border p-4 ${signedAt ? "border-gold bg-gold/5" : "border-dashed border-border"}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      {signedAt ? (
        <p className="mt-1 font-display text-sm text-plum-deep">Signed · {new Date(signedAt).toLocaleDateString()}</p>
      ) : (
        <p className="mt-1 text-sm text-muted-foreground">Awaiting signature</p>
      )}
    </div>
  );
}
function FinRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${accent ? "rounded-xl bg-gradient-gold px-3 py-2 text-plum-deep" : ""}`}>
      <dt className={accent ? "text-xs font-medium" : "text-xs text-muted-foreground"}>{label}</dt>
      <dd className={accent ? "font-display text-base" : "font-medium"}>{value}</dd>
    </div>
  );
}

function ReviewModal({ contractId, athleteId, brandId, onClose }: { contractId: string; athleteId: string; brandId: string; onClose: () => void }) {
  const { user, role } = useAuth();
  const [scores, setScores] = useState({ professionalism: 5, communication: 5, reliability: 5, campaign_success: 5 });
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!user || !role) return;
    setBusy(true);
    const reviewee_id = user.id === brandId ? athleteId : brandId;
    const { error } = await supabase.from("reviews").insert({
      contract_id: contractId, reviewer_id: user.id, reviewee_id,
      reviewer_role: role, ...scores, comment,
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success("Review submitted"); onClose(); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-plum-deep/50 p-4">
      <div className="w-full max-w-md rounded-3xl border border-border bg-background p-6 shadow-elegant">
        <h3 className="font-display text-2xl">Leave a review</h3>
        <p className="mt-1 text-xs text-muted-foreground">Help build trust on Allyance.</p>
        <div className="mt-5 space-y-3">
          {(["professionalism", "communication", "reliability", "campaign_success"] as const).map((k) => (
            <div key={k}>
              <p className="text-xs font-medium capitalize">{k.replace("_", " ")}</p>
              <div className="mt-1 flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => setScores((s) => ({ ...s, [k]: n }))}>
                    <Star className={`h-5 w-5 ${n <= scores[k] ? "fill-gold text-gold" : "text-border"}`} />
                  </button>
                ))}
              </div>
            </div>
          ))}
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3}
            placeholder="Optional note"
            className="w-full rounded-xl border border-border bg-cream px-3 py-2 text-sm" />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-full border border-border px-4 py-2 text-xs">Skip</button>
          <button onClick={submit} disabled={busy}
            className="rounded-full bg-plum-deep px-4 py-2 text-xs font-medium text-cream disabled:opacity-50">
            {busy ? "Submitting…" : "Submit review"}
          </button>
        </div>
      </div>
    </div>
  );
}
