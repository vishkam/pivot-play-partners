import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Send, CheckCircle2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { notify } from "@/components/NotificationBell";

export const Route = createFileRoute("/athlete/deals")({
  component: () => (
    <RequireAuth roles={["athlete"]}>
      <AthleteDeals />
    </RequireAuth>
  ),
});

interface Campaign {
  id: string; brand_id: string; name: string; goals: string | null;
  budget_min: number | null; budget_max: number | null;
  sports: string[] | null; preferred_athlete_types: string[] | null;
  partnership_structure: string | null; timeline: string | null;
  content_deliverables: string | null;
}
interface Brand { user_id: string; brand_name: string | null; industry: string | null; }

function AthleteDeals() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [brands, setBrands] = useState<Record<string, Brand>>({});
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);

  async function load() {
    if (!user) return;
    setLoading(true);
    const { data: camps } = await supabase
      .from("campaigns").select("*").eq("status", "active").order("created_at", { ascending: false });
    const list = (camps as Campaign[]) ?? [];
    setCampaigns(list);

    const brandIds = Array.from(new Set(list.map((c) => c.brand_id)));
    if (brandIds.length) {
      const { data: brs } = await supabase.from("brand_profiles").select("user_id, brand_name, industry").in("user_id", brandIds);
      const map: Record<string, Brand> = {};
      (brs ?? []).forEach((b) => (map[b.user_id] = b as Brand));
      setBrands(map);
    }

    const { data: applied } = await supabase
      .from("proposals").select("campaign_id").eq("athlete_id", user.id);
    setAppliedIds(new Set((applied ?? []).map((p) => p.campaign_id).filter(Boolean) as string[]));
    setLoading(false);
  }
  useEffect(() => { load(); }, [user]);

  return (
    <DashboardShell title="Open deals" subtitle="Browse active campaigns and apply to ones you love">
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-plum" /></div>
      ) : campaigns.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-cream p-12 text-center">
          <Sparkles className="mx-auto h-6 w-6 text-plum" />
          <p className="mt-3 font-display text-lg">No open deals right now</p>
          <p className="mt-1 text-sm text-muted-foreground">New campaigns drop weekly. We'll notify you when a match goes live.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {campaigns.map((c) => {
            const brand = brands[c.brand_id];
            const applied = appliedIds.has(c.id);
            return (
              <article key={c.id} className="flex flex-col rounded-2xl border border-border bg-cream p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{brand?.industry ?? "Brand"}</p>
                    <h3 className="mt-0.5 font-display text-lg text-foreground">{c.name}</h3>
                    <p className="mt-1 text-xs text-plum">{brand?.brand_name ?? "Brand on Allyance"}</p>
                  </div>
                  {(c.budget_min || c.budget_max) && (
                    <span className="rounded-full bg-gradient-gold px-3 py-1 text-[11px] font-medium text-plum-deep">
                      ${(c.budget_min ?? 0).toLocaleString()}–${(c.budget_max ?? 0).toLocaleString()}
                    </span>
                  )}
                </div>
                {c.goals && <p className="mt-3 line-clamp-3 text-sm text-foreground/80">{c.goals}</p>}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(c.sports ?? []).slice(0, 3).map((s) => (
                    <span key={s} className="rounded-full bg-plum/5 px-2 py-0.5 text-[10px] text-plum">{s}</span>
                  ))}
                  {c.partnership_structure && (
                    <span className="rounded-full bg-plum/5 px-2 py-0.5 text-[10px] text-plum">{c.partnership_structure}</span>
                  )}
                </div>
                <div className="mt-auto pt-4 flex items-center justify-between">
                  <Link
                    to="/athlete/opportunities"
                    className="text-xs text-muted-foreground hover:text-plum"
                  >
                    View my inbox →
                  </Link>
                  {applied ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-plum/5 px-3 py-1.5 text-xs text-plum">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Applied
                    </span>
                  ) : (
                    <button
                      onClick={() => setActiveCampaign(c)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-plum-deep px-4 py-1.5 text-xs font-medium text-cream hover:bg-plum"
                    >
                      <Send className="h-3.5 w-3.5" /> Apply
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {activeCampaign && (
        <ApplyModal
          campaign={activeCampaign}
          onClose={() => setActiveCampaign(null)}
          onApplied={() => { setActiveCampaign(null); load(); }}
        />
      )}
    </DashboardShell>
  );
}

function ApplyModal({ campaign, onClose, onApplied }: { campaign: Campaign; onClose: () => void; onApplied: () => void }) {
  const { user } = useAuth();
  const [pitch, setPitch] = useState("");
  const [amount, setAmount] = useState<string>(String(campaign.budget_min ?? ""));
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!user) return;
    if (pitch.trim().length < 20) { toast.error("Tell the brand a bit more (20+ characters)."); return; }
    setBusy(true);
    const { error } = await supabase.from("proposals").insert({
      athlete_id: user.id, brand_id: campaign.brand_id, campaign_id: campaign.id,
      body: pitch.trim().slice(0, 2000), proposed_amount: amount ? Number(amount) : null,
      partnership_type: campaign.partnership_structure ?? null,
      status: "sent",
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    await notify(campaign.brand_id, "proposal", "New athlete application",
      `An athlete applied to "${campaign.name}".`, "/brand/proposals");
    toast.success("Application sent — the brand will be in touch.");
    onApplied();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-plum-deep/50 p-4">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-background p-6 shadow-elegant">
        <h3 className="font-display text-2xl">Apply — {campaign.name}</h3>
        <p className="mt-1 text-xs text-muted-foreground">Pitch in your own voice. Brands respond best to specifics.</p>
        <label className="mt-4 block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Your pitch</span>
          <textarea
            value={pitch}
            onChange={(e) => setPitch(e.target.value.slice(0, 2000))}
            maxLength={2000}
            rows={5}
            placeholder="Why this campaign fits — your audience, recent results, ideas for content…"
            className="w-full rounded-xl border border-border bg-cream px-4 py-2.5 text-sm focus:border-plum focus:outline-none"
          />
          <span className="mt-1 block text-right text-[10px] text-muted-foreground">{pitch.length}/2000</span>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Proposed fee (USD, optional)</span>
          <input
            type="number" min={0} max={10000000}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-xl border border-border bg-cream px-4 py-2.5 text-sm focus:border-plum focus:outline-none"
          />
        </label>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-full border border-border px-4 py-2 text-xs">Cancel</button>
          <button onClick={submit} disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-gold px-5 py-2 text-xs font-medium text-plum-deep shadow-gold disabled:opacity-50">
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Send application
          </button>
        </div>
      </div>
    </div>
  );
}
