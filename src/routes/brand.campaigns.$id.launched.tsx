import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Sparkles, CheckCircle2, Rocket, Users, Target, Wallet, Globe2,
  Calendar, TrendingUp, ArrowRight, PartyPopper, Brain, Zap,
} from "lucide-react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/brand/campaigns/$id/launched")({
  component: () => (
    <RequireAuth roles={["brand"]} requireOnboarding>
      <Launched />
    </RequireAuth>
  ),
});

interface CampaignRow {
  id: string;
  name: string;
  description: string | null;
  goals: string | null;
  status: string;
  sports: string[] | null;
  geographic_reach: string[] | null;
  preferred_athlete_types: string[] | null;
  partnership_structure: string | null;
  content_deliverables: string | null;
  timeline: string | null;
  product_category: string | null;
  budget_min: number | null;
  budget_max: number | null;
  created_at: string;
}

interface MatchRow {
  athlete_id: string;
  score: number;
  values_score: number | null;
  audience_score: number | null;
  budget_score: number | null;
  sport_score: number | null;
  campaign_score: number | null;
  explanation: string | null;
}

interface AthleteMini {
  user_id: string;
  full_name: string | null;
  country: string | null;
  sport: string | null;
  pricing_min: number | null;
  pricing_max: number | null;
}

function Launched() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<CampaignRow | null>(null);
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [athletes, setAthletes] = useState<Map<string, AthleteMini>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [c, m] = await Promise.all([
        supabase.from("campaigns").select("*").eq("id", id).maybeSingle(),
        supabase
          .from("matches")
          .select("athlete_id, score, values_score, audience_score, budget_score, sport_score, campaign_score, explanation")
          .eq("campaign_id", id)
          .eq("brand_id", user.id)
          .order("score", { ascending: false })
          .limit(6),
      ]);
      if (c.data) setCampaign(c.data as CampaignRow);
      const matchRows = (m.data ?? []) as MatchRow[];
      setMatches(matchRows);
      const ids = matchRows.map((r) => r.athlete_id);
      if (ids.length) {
        const [profRes, athRes] = await Promise.all([
          supabase.from("profiles").select("id, full_name, country").in("id", ids),
          supabase.from("athlete_profiles").select("user_id, sport, pricing_min, pricing_max").in("user_id", ids),
        ]);
        const map = new Map<string, AthleteMini>();
        (athRes.data ?? []).forEach((a) => {
          const p = (profRes.data ?? []).find((x) => x.id === a.user_id);
          map.set(a.user_id, {
            user_id: a.user_id,
            sport: a.sport,
            pricing_min: a.pricing_min,
            pricing_max: a.pricing_max,
            full_name: p?.full_name ?? "Athlete",
            country: p?.country ?? null,
          });
        });
        setAthletes(map);
      }
      setLoading(false);
    })();
  }, [id, user]);

  const stats = useMemo(() => {
    if (!matches.length) return { avg: 0, top: 0, strong: 0 };
    const avg = Math.round(matches.reduce((s, m) => s + m.score, 0) / matches.length);
    const top = matches[0]?.score ?? 0;
    const strong = matches.filter((m) => m.score >= 70).length;
    return { avg, top, strong };
  }, [matches]);

  if (loading) {
    return (
      <DashboardShell title="Loading launch…" subtitle="">
        <div className="rounded-3xl border border-border bg-cream p-12 text-center text-sm text-muted-foreground">
          <Sparkles className="mx-auto mb-3 h-6 w-6 animate-pulse text-[--gold]" />
          Pulling your live campaign…
        </div>
      </DashboardShell>
    );
  }
  if (!campaign) {
    return (
      <DashboardShell title="Campaign not found" subtitle="">
        <Link to="/brand/dashboard" className="text-sm text-plum hover:underline">← Back to dashboard</Link>
      </DashboardShell>
    );
  }

  const budget = campaign.budget_min && campaign.budget_max
    ? `$${campaign.budget_min.toLocaleString()} – $${campaign.budget_max.toLocaleString()}`
    : "—";

  return (
    <DashboardShell
      title="Campaign launched"
      subtitle="Pegasus AI has activated your brief and matched aligned women athletes — live below."
    >
      <div className="space-y-6">
        {/* Hero / celebration */}
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-hero p-8 text-cream shadow-elegant md:p-10">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-cream/10 blur-3xl" />
          <div className="absolute -bottom-12 -left-8 h-56 w-56 rounded-full bg-[--gold]/20 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full bg-cream/15 px-3 py-1 text-xs font-medium uppercase tracking-wider backdrop-blur">
              <PartyPopper className="h-3.5 w-3.5 text-[--gold]" /> Live · Status active
            </div>
            <h1 className="mt-4 font-display text-3xl md:text-4xl">{campaign.name}</h1>
            {campaign.description && <p className="mt-3 max-w-2xl text-sm text-cream/85 md:text-base">{campaign.description}</p>}
            <div className="mt-6 grid grid-cols-3 gap-3 md:max-w-xl">
              <Stat icon={<CheckCircle2 className="h-4 w-4" />} label="Matches" value={matches.length.toString()} />
              <Stat icon={<TrendingUp className="h-4 w-4" />} label="Avg score" value={`${stats.avg}`} />
              <Stat icon={<Zap className="h-4 w-4" />} label="Strong fits" value={`${stats.strong}`} />
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/brand/campaigns/$id"
                params={{ id: campaign.id }}
                className="inline-flex items-center gap-2 rounded-full bg-cream px-5 py-2.5 text-sm font-semibold text-plum-deep shadow-elegant hover:bg-cream/90"
              >
                Open match list <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/brand/pipeline"
                className="inline-flex items-center gap-2 rounded-full border border-cream/30 bg-cream/10 px-5 py-2.5 text-sm font-medium text-cream backdrop-blur hover:bg-cream/20"
              >
                View pipeline
              </Link>
            </div>
          </div>
        </div>

        {/* AI activity strip */}
        <div className="rounded-3xl border border-border bg-cream p-5 shadow-sm md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-plum-deep">
                <Brain className="h-4 w-4" />
              </span>
              <div>
                <h3 className="font-display text-lg text-plum-deep">Pegasus AI activity</h3>
                <p className="text-xs text-muted-foreground">Live signals captured during launch</p>
              </div>
            </div>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{new Date(campaign.created_at).toLocaleString()}</span>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-4">
            <Activity label="Brief parsed" value="6 signals" />
            <Activity label="Athletes scanned" value="Verified pool" />
            <Activity label="Matches ranked" value={`${matches.length} surfaced`} />
            <Activity label="Top score" value={`${stats.top}/100`} />
          </div>
        </div>

        {/* Brief recap */}
        <div className="rounded-3xl border border-border bg-cream p-6 shadow-sm md:p-8">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-plum-deep">
              <Rocket className="h-4 w-4" />
            </span>
            <h3 className="font-display text-lg text-plum-deep">What you launched</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field icon={<Target className="h-3.5 w-3.5" />} label="Goal" value={campaign.goals} />
            <Field icon={<Users className="h-3.5 w-3.5" />} label="Audience" value={campaign.preferred_athlete_types?.join(", ")} />
            <Field icon={<Sparkles className="h-3.5 w-3.5" />} label="Sports" value={campaign.sports?.join(", ")} />
            <Field icon={<Globe2 className="h-3.5 w-3.5" />} label="Geography" value={campaign.geographic_reach?.join(", ")} />
            <Field icon={<Calendar className="h-3.5 w-3.5" />} label="Timeline" value={campaign.timeline} />
            <Field icon={<Wallet className="h-3.5 w-3.5" />} label="Budget" value={budget} />
            <Field icon={<Target className="h-3.5 w-3.5" />} label="Partnership type" value={campaign.partnership_structure} />
            <Field icon={<Sparkles className="h-3.5 w-3.5" />} label="Category" value={campaign.product_category} />
            {campaign.content_deliverables && (
              <div className="md:col-span-2">
                <Field icon={<Calendar className="h-3.5 w-3.5" />} label="Deliverables" value={campaign.content_deliverables} />
              </div>
            )}
          </div>
        </div>

        {/* Top matches */}
        <div className="rounded-3xl border border-border bg-cream p-6 shadow-sm md:p-8">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="font-display text-lg text-plum-deep">Top AI matches</h3>
              <p className="text-xs text-muted-foreground">Sorted by Pegasus alignment score · live from your campaign</p>
            </div>
            <Link
              to="/brand/campaigns/$id"
              params={{ id: campaign.id }}
              className="text-xs font-medium text-plum hover:underline"
            >
              See all {matches.length > 6 ? matches.length : ""} matches →
            </Link>
          </div>
          {matches.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No matches yet. Try broadening sports or geography in your brief.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {matches.map((m, i) => {
                const a = athletes.get(m.athlete_id);
                return (
                  <div key={m.athlete_id} className="rounded-2xl border border-border bg-background p-4 transition hover:border-plum/40 hover:shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold text-[--gold]">#{i + 1}</span>
                          <h4 className="truncate font-display text-base text-plum-deep">{a?.full_name ?? "Athlete"}</h4>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {[a?.sport, a?.country].filter(Boolean).join(" · ") || "Verified athlete"}
                        </p>
                      </div>
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-hero text-cream shadow-elegant">
                        <span className="font-display text-lg">{m.score}</span>
                      </div>
                    </div>
                    {m.explanation && (
                      <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">{m.explanation}</p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                      <Chip label={`Values ${m.values_score ?? 0}`} />
                      <Chip label={`Audience ${m.audience_score ?? 0}`} />
                      <Chip label={`Budget ${m.budget_score ?? 0}`} />
                      <Chip label={`Sport ${m.sport_score ?? 0}`} />
                    </div>
                    <button
                      onClick={() => navigate({ to: "/brand/campaigns/$id", params: { id: campaign.id } })}
                      className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-plum px-3 py-2 text-xs font-medium text-cream hover:bg-plum-deep"
                    >
                      Review & send proposal <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Next steps */}
        <div className="rounded-3xl border border-border bg-secondary/60 p-6 md:p-8">
          <h3 className="font-display text-lg text-plum-deep">What happens next</h3>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <Next n="1" title="Review matches" body="Open your match list, save favourites, dig into profiles." />
            <Next n="2" title="Send proposals" body="Pegasus pre-fills pricing, deliverables, and timeline per athlete." />
            <Next n="3" title="Sign & activate" body="Accepted proposals roll into contracts and your live pipeline." />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-cream/15 p-3 backdrop-blur">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-cream/80">{icon}{label}</div>
      <div className="mt-1 font-display text-2xl">{value}</div>
    </div>
  );
}
function Activity({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[--gold]" /> {label}
      </div>
      <div className="mt-1 text-sm font-medium text-plum-deep">{value}</div>
    </div>
  );
}
function Field({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | null | undefined }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">{icon}{label}</div>
      <div className="mt-1 text-sm text-plum-deep">{value || "—"}</div>
    </div>
  );
}
function Chip({ label }: { label: string }) {
  return <span className="rounded-full bg-secondary px-2 py-0.5">{label}</span>;
}
function Next({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border bg-cream p-4">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-hero text-xs font-semibold text-cream">{n}</span>
        <h4 className="font-display text-sm text-plum-deep">{title}</h4>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{body}</p>
    </div>
  );
}
