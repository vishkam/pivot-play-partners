import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Heart, X, Bookmark, Sparkles, Send } from "lucide-react";
import { toast } from "sonner";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { notify } from "@/components/NotificationBell";

export const Route = createFileRoute("/athlete/feed")({
  component: () => (
    <RequireAuth roles={["athlete"]}>
      <DealFeed />
    </RequireAuth>
  ),
});

interface Campaign {
  id: string; brand_id: string; name: string; goals: string | null;
  budget_min: number | null; budget_max: number | null;
  sports: string[] | null; partnership_structure: string | null;
  content_deliverables: string | null;
}
interface Brand { user_id: string; brand_name: string | null; industry: string | null; }

export default function DealFeed() {
  const { user } = useAuth();
  const [deals, setDeals] = useState<Campaign[]>([]);
  const [brands, setBrands] = useState<Record<string, Brand>>({});
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => { (async () => {
    if (!user) return;
    setLoading(true);
    const { data: camps } = await supabase.from("campaigns")
      .select("*").eq("status", "active").order("created_at", { ascending: false }).limit(40);
    const { data: applied } = await supabase.from("proposals").select("campaign_id").eq("athlete_id", user.id);
    const seen = new Set((applied ?? []).map((p) => p.campaign_id).filter(Boolean));
    const list = ((camps as Campaign[]) ?? []).filter((c) => !seen.has(c.id));
    setDeals(list);
    const ids = Array.from(new Set(list.map((c) => c.brand_id)));
    if (ids.length) {
      const { data: brs } = await supabase.from("brand_profiles")
        .select("user_id, brand_name, industry").in("user_id", ids);
      const m: Record<string, Brand> = {};
      (brs ?? []).forEach((b) => (m[b.user_id] = b as Brand));
      setBrands(m);
    }
    setLoading(false);
  })(); }, [user]);

  const current = deals[index];
  const next = () => setIndex((i) => i + 1);

  async function applyToCurrent() {
    if (!current || !user) return;
    setApplying(true);
    const { error } = await supabase.from("proposals").insert({
      athlete_id: user.id, brand_id: current.brand_id, campaign_id: current.id,
      body: `I'd love to be considered for "${current.name}". My profile aligns with this campaign and I'd bring authentic storytelling to your audience.`,
      proposed_amount: current.budget_min ?? null,
      partnership_type: current.partnership_structure ?? null,
      status: "sent",
    });
    setApplying(false);
    if (error) { toast.error(error.message); return; }
    await notify(current.brand_id, "proposal", "New athlete interest",
      `An athlete swiped Interested on "${current.name}".`, "/brand/proposals");
    toast.success("Interest sent ✨");
    next();
  }

  const score = useMemo(() => 70 + Math.floor(Math.random() * 25), [current?.id]);

  return (
    <DashboardShell title="Deal feed" subtitle="Swipe through live brand campaigns — Bumble for sponsorships.">
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-plum" /></div>
      ) : !current ? (
        <EmptyDeck />
      ) : (
        <div className="mx-auto flex w-full max-w-md flex-col items-center">
          <div className="relative w-full">
            {deals.slice(index, index + 3).reverse().map((c, i) => {
              const isTop = i === deals.slice(index, index + 3).length - 1;
              const offset = (deals.slice(index, index + 3).length - 1 - i) * 8;
              const b = brands[c.brand_id];
              return (
                <article
                  key={c.id}
                  style={{ transform: `translateY(${offset}px) scale(${1 - offset * 0.015})`, zIndex: isTop ? 10 : 1 }}
                  className={`${isTop ? "" : "pointer-events-none absolute inset-0"} relative w-full overflow-hidden rounded-3xl border border-border bg-cream shadow-elegant transition-transform`}
                >
                  <div className="relative bg-gradient-hero p-6 text-cream">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-gold">
                        {b?.industry ?? "Brand"}
                      </span>
                      <span className="rounded-full bg-gradient-gold px-3 py-1 text-xs font-semibold text-plum-deep">
                        {score}% match
                      </span>
                    </div>
                    <h3 className="mt-4 font-display text-2xl leading-tight">{c.name}</h3>
                    <p className="mt-1 text-sm text-cream/75">{b?.brand_name ?? "Verified brand"}</p>
                  </div>
                  <div className="space-y-4 p-6 text-sm text-foreground">
                    {c.goals && <p className="line-clamp-4 text-foreground/80">{c.goals}</p>}
                    {(c.budget_min || c.budget_max) && (
                      <Row label="Compensation">
                        ${(c.budget_min ?? 0).toLocaleString()}–${(c.budget_max ?? 0).toLocaleString()}
                      </Row>
                    )}
                    {c.partnership_structure && <Row label="Type">{c.partnership_structure}</Row>}
                    {c.content_deliverables && <Row label="Deliverables">{c.content_deliverables}</Row>}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(c.sports ?? []).slice(0, 4).map((s) => (
                        <span key={s} className="rounded-full bg-plum/5 px-2 py-0.5 text-[10px] text-plum">{s}</span>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-6 flex items-center gap-5">
            <ActionBtn onClick={next} aria-label="Pass" className="bg-cream text-foreground border border-border">
              <X className="h-6 w-6" />
            </ActionBtn>
            <ActionBtn onClick={next} aria-label="Save for later" className="bg-cream text-plum border border-border">
              <Bookmark className="h-5 w-5" />
            </ActionBtn>
            <ActionBtn
              onClick={applyToCurrent}
              disabled={applying}
              aria-label="Interested"
              className="bg-gradient-gold text-plum-deep shadow-gold h-16 w-16"
            >
              {applying ? <Loader2 className="h-6 w-6 animate-spin" /> : <Heart className="h-7 w-7" />}
            </ActionBtn>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{deals.length - index} deals left in your feed</p>
        </div>
      )}
    </DashboardShell>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-t border-border pt-3 text-xs">
      <span className="uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="text-right text-foreground">{children}</span>
    </div>
  );
}

function ActionBtn({ children, className = "", ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={`flex h-14 w-14 items-center justify-center rounded-full transition-transform hover:scale-105 disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

function EmptyDeck() {
  return (
    <div className="mx-auto max-w-md rounded-3xl border border-dashed border-border bg-cream p-12 text-center">
      <Sparkles className="mx-auto h-6 w-6 text-plum" />
      <p className="mt-3 font-display text-lg">You're all caught up</p>
      <p className="mt-1 text-sm text-muted-foreground">New brand campaigns drop weekly. We'll ping you when one matches.</p>
      <a href="/athlete/deals" className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-plum-deep px-4 py-2 text-xs font-medium text-cream">
        <Send className="h-3.5 w-3.5" /> Browse list view
      </a>
    </div>
  );
}
