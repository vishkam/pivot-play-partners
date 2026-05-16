import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { rankAthletes, type AthleteForMatch, type BrandForMatch, type CampaignForMatch, type MatchScore } from "@/lib/matching";
import { AthleteCard } from "@/components/AthleteCard";
import { ProposalModal } from "@/components/ProposalModal";

export const Route = createFileRoute("/brand/matches")({
  component: () => (
    <RequireAuth roles={["brand"]} requireOnboarding>
      <Matches />
    </RequireAuth>
  ),
});

interface AthleteRow extends AthleteForMatch {
  full_name: string | null;
  verification_status: string | null;
}

function Matches() {
  const { user } = useAuth();
  const [brand, setBrand] = useState<BrandForMatch & { brand_name: string | null }>({ brand_name: null });
  const [campaigns, setCampaigns] = useState<(CampaignForMatch & { id: string; name: string; goals: string | null })[]>([]);
  const [campaignId, setCampaignId] = useState<string>("");
  const [athletes, setAthletes] = useState<AthleteRow[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [proposeFor, setProposeFor] = useState<{ athlete: AthleteRow; match: MatchScore } | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [b, c, a, s] = await Promise.all([
        supabase.from("brand_profiles").select("brand_name, values, esg_priorities, industry, consumer_demographics").eq("user_id", user.id).maybeSingle(),
        supabase.from("campaigns").select("id, name, goals, budget_min, budget_max, sports, geographic_reach, preferred_athlete_types, partnership_structure").eq("brand_id", user.id),
        supabase.from("athlete_profiles").select("user_id, sport, values, causes, audience_demographics, pricing_min, pricing_max, partnership_types, geographic_preferences, verification_status").eq("verification_status", "verified"),
        supabase.from("saved_athletes").select("athlete_id").eq("brand_id", user.id),
      ]);
      if (b.data) setBrand(b.data as never);
      setCampaigns((c.data ?? []) as never);
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
  }, [user]);

  const selectedCampaign = campaigns.find((c) => c.id === campaignId) ?? null;
  const ranked = useMemo(() => rankAthletes(athletes, brand, selectedCampaign), [athletes, brand, selectedCampaign]);

  async function toggleSave(aid: string) {
    if (!user) return;
    if (savedIds.has(aid)) {
      await supabase.from("saved_athletes").delete().eq("brand_id", user.id).eq("athlete_id", aid);
      setSavedIds((s) => { const n = new Set(s); n.delete(aid); return n; });
    } else {
      await supabase.from("saved_athletes").insert({ brand_id: user.id, athlete_id: aid });
      setSavedIds((s) => new Set(s).add(aid));
      toast.success("Saved");
    }
  }

  return (
    <DashboardShell
      title="Athlete discovery"
      subtitle="Search the verified pool. Filter by campaign to rank by fit."
      actions={
        <Link to="/brand/campaigns/new" className="rounded-full bg-plum-deep px-5 py-2.5 text-sm text-cream">+ New campaign</Link>
      }
    >
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          Rank for campaign:
          <select
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
            className="rounded-full border border-border bg-cream px-3 py-1.5 text-xs text-foreground"
          >
            <option value="">General fit</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-plum" /> {ranked.length} verified athletes
        </span>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
      </div>

      {proposeFor && (
        <ProposalModal
          open
          onClose={() => setProposeFor(null)}
          athleteId={proposeFor.athlete.user_id}
          athleteName={proposeFor.athlete.full_name ?? "Athlete"}
          brandName={brand.brand_name ?? "Your brand"}
          campaign={selectedCampaign ? { id: selectedCampaign.id, name: selectedCampaign.name, goals: selectedCampaign.goals } : null}
          match={proposeFor.match}
        />
      )}
    </DashboardShell>
  );
}
