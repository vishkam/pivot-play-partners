import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { AthleteCard } from "@/components/AthleteCard";
import { scoreAthlete, type BrandForMatch, type MatchScore } from "@/lib/matching";
import { ProposalModal } from "@/components/ProposalModal";

export const Route = createFileRoute("/brand/saved")({
  component: () => (
    <RequireAuth roles={["brand"]} requireOnboarding>
      <Saved />
    </RequireAuth>
  ),
});

interface Row {
  user_id: string; full_name: string | null; country: string | null;
  sport: string | null; values: string[] | null;
  verification_status: string | null;
  audience_demographics: { summary?: string } | null;
  pricing_min: number | null; pricing_max: number | null;
  causes: string[] | null;
}

function Saved() {
  const { user } = useAuth();
  const [brand, setBrand] = useState<BrandForMatch & { brand_name: string | null }>({ brand_name: null });
  const [rows, setRows] = useState<Row[]>([]);
  const [propose, setPropose] = useState<{ row: Row; match: MatchScore } | null>(null);

  async function load() {
    if (!user) return;
    const [b, s] = await Promise.all([
      supabase.from("brand_profiles").select("brand_name, values, esg_priorities, consumer_demographics").eq("user_id", user.id).maybeSingle(),
      supabase.from("saved_athletes").select("athlete_id").eq("brand_id", user.id),
    ]);
    if (b.data) setBrand(b.data as never);
    const ids = (s.data ?? []).map((x) => x.athlete_id);
    if (!ids.length) { setRows([]); return; }
    const [ap, pp] = await Promise.all([
      supabase.from("athlete_profiles").select("user_id, sport, values, causes, audience_demographics, pricing_min, pricing_max, verification_status").in("user_id", ids),
      supabase.from("profiles").select("id, full_name, country").in("id", ids),
    ]);
    const byId = new Map(pp.data?.map((p) => [p.id, p]));
    setRows(
      (ap.data ?? []).map((x) => ({
        ...x,
        full_name: byId.get(x.user_id)?.full_name ?? "Athlete",
        country: byId.get(x.user_id)?.country ?? null,
      })) as Row[],
    );
  }

  useEffect(() => { load(); }, [user]);

  async function unsave(aid: string) {
    if (!user) return;
    await supabase.from("saved_athletes").delete().eq("brand_id", user.id).eq("athlete_id", aid);
    setRows((r) => r.filter((x) => x.user_id !== aid));
    toast("Removed from shortlist");
  }

  return (
    <DashboardShell
      title="Shortlist"
      subtitle="Athletes you've saved across campaigns. Compare and reach out when ready."
    >
      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-cream p-12 text-center">
          <Bookmark className="mx-auto h-6 w-6 text-plum" />
          <p className="mt-3 text-sm text-muted-foreground">No saved athletes yet. Save matches from discovery to build your shortlist.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((r) => {
            const match = scoreAthlete(
              {
                user_id: r.user_id, full_name: r.full_name, country: r.country, sport: r.sport,
                values: r.values, causes: r.causes,
                audience_demographics: r.audience_demographics,
                pricing_min: r.pricing_min, pricing_max: r.pricing_max,
              },
              brand,
              null,
            );
            return (
              <AthleteCard
                key={r.user_id}
                athlete={{
                  user_id: r.user_id, full_name: r.full_name, country: r.country, sport: r.sport,
                  values: r.values, verification_status: r.verification_status,
                  audienceSummary: r.audience_demographics?.summary,
                }}
                match={match}
                saved
                onToggleSave={() => unsave(r.user_id)}
                onSendProposal={() => setPropose({ row: r, match })}
              />
            );
          })}
        </div>
      )}

      {propose && (
        <ProposalModal
          open
          onClose={() => setPropose(null)}
          athleteId={propose.row.user_id}
          athleteName={propose.row.full_name ?? "Athlete"}
          brandName={brand.brand_name ?? "Your brand"}
          campaign={null}
          match={propose.match}
        />
      )}
    </DashboardShell>
  );
}
