import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Sparkles, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { rankAthletes, type AthleteForMatch, type BrandForMatch, type CampaignForMatch, type MatchScore } from "@/lib/matching";
import { AthleteCard } from "@/components/AthleteCard";
import { ProposalModal } from "@/components/ProposalModal";

export const Route = createFileRoute("/brand/campaigns/$id")({
  component: () => (
    <RequireAuth roles={["brand"]} requireOnboarding>
      <CampaignDetail />
    </RequireAuth>
  ),
});

interface AthleteRow extends AthleteForMatch {
  full_name: string | null;
  verification_status: string | null;
}

function CampaignDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<(CampaignForMatch & { name: string; description: string | null; status: string }) | null>(null);
  const [brand, setBrand] = useState<BrandForMatch & { brand_name: string | null }>({ brand_name: null });
  const [athletes, setAthletes] = useState<AthleteRow[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [proposeFor, setProposeFor] = useState<{ athlete: AthleteRow; match: MatchScore } | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [c, b, a, s] = await Promise.all([
        supabase.from("campaigns").select("*").eq("id", id).maybeSingle(),
        supabase.from("brand_profiles").select("brand_name, values, esg_priorities, industry, consumer_demographics").eq("user_id", user.id).maybeSingle(),
        supabase
          .from("athlete_profiles")
          .select("user_id, sport, values, causes, audience_demographics, pricing_min, pricing_max, partnership_types, geographic_preferences, verification_status")
          .eq("verification_status", "verified"),
        supabase.from("saved_athletes").select("athlete_id").eq("brand_id", user.id),
      ]);
      if (c.data) setCampaign(c.data as never);
      if (b.data) setBrand(b.data as never);

      const profileIds = (a.data ?? []).map((x) => x.user_id);
      const { data: profs } = profileIds.length
        ? await supabase.from("profiles").select("id, full_name, country").in("id", profileIds)
        : { data: [] as { id: string; full_name: string | null; country: string | null }[] };
      const byId = new Map(profs?.map((p) => [p.id, p]));
      setAthletes(
        (a.data ?? []).map((x) => ({
          ...x,
          full_name: byId.get(x.user_id)?.full_name ?? "Athlete",
          country: byId.get(x.user_id)?.country ?? null,
        })) as AthleteRow[],
      );
      setSavedIds(new Set((s.data ?? []).map((x) => x.athlete_id)));
    })();
  }, [id, user]);

  const ranked = useMemo(() => (campaign ? rankAthletes(athletes, brand, campaign) : []), [athletes, brand, campaign]);

  async function toggleSave(aid: string) {
    if (!user) return;
    if (savedIds.has(aid)) {
      await supabase.from("saved_athletes").delete().eq("brand_id", user.id).eq("athlete_id", aid);
      setSavedIds((s) => { const n = new Set(s); n.delete(aid); return n; });
      toast("Removed from shortlist");
    } else {
      await supabase.from("saved_athletes").insert({ brand_id: user.id, athlete_id: aid });
      setSavedIds((s) => new Set(s).add(aid));
      toast.success("Saved to shortlist");
    }
  }

  if (!campaign) {
    return (
      <DashboardShell title="Loading campaign…">
        <div className="rounded-2xl border border-border bg-cream p-10 text-center text-sm text-muted-foreground">
          Fetching brief and matches.
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title={campaign.name}
      subtitle={campaign.description || "Live match results — ranked by values, audience, and budget fit."}
      actions={
        <Link to="/brand/dashboard" className="inline-flex items-center gap-2 rounded-full border border-border bg-cream px-4 py-2 text-sm">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
      }
    >
      <div className="grid gap-5 lg:grid-cols-4">
        <Stat label="Status" value={campaign.status} />
        <Stat label="Budget" value={campaign.budget_min || campaign.budget_max ? `$${(campaign.budget_min ?? 0).toLocaleString()}–$${(campaign.budget_max ?? 0).toLocaleString()}` : "—"} />
        <Stat label="Sports" value={(campaign.sports ?? []).join(", ") || "Multi-sport"} />
        <Stat label="Athletes matched" value={ranked.length.toString()} />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-display text-xl">
          <Sparkles className="h-4 w-4 text-plum" /> Ranked matches
        </h3>
        <p className="text-xs text-muted-foreground">{ranked.filter((r) => r.category === "Strong Match").length} strong · {ranked.filter((r) => r.category === "Good Match").length} good</p>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {ranked.map((match) => {
          const a = athletes.find((x) => x.user_id === match.athlete_id)!;
          return (
            <AthleteCard
              key={a.user_id}
              athlete={{
                user_id: a.user_id,
                full_name: a.full_name,
                country: a.country ?? null,
                sport: a.sport ?? null,
                values: a.values ?? [],
                verification_status: a.verification_status,
                audienceSummary: (a.audience_demographics as { summary?: string } | null)?.summary,
              }}
              match={match}
              saved={savedIds.has(a.user_id)}
              onToggleSave={() => toggleSave(a.user_id)}
              onSendProposal={() => setProposeFor({ athlete: a, match })}
            />
          );
        })}
        {ranked.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-border bg-cream p-10 text-center text-sm text-muted-foreground">
            No athletes available yet. Verified athletes appear here as they join.
          </div>
        )}
      </div>

      {proposeFor && (
        <ProposalModal
          open
          onClose={() => setProposeFor(null)}
          athleteId={proposeFor.athlete.user_id}
          athleteName={proposeFor.athlete.full_name ?? "Athlete"}
          brandName={brand.brand_name ?? "Your brand"}
          campaign={{ id: id, name: campaign.name, goals: campaign.goals ?? null }}
          match={proposeFor.match}
          onSent={() => navigate({ to: "/brand/proposals" })}
        />
      )}
    </DashboardShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-cream p-4 shadow-sm">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-lg text-plum-deep capitalize truncate">{value}</p>
    </div>
  );
}
