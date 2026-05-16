import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { scoreAthlete, type BrandForMatch, type MatchScore } from "@/lib/matching";
import { MatchExplanation } from "@/components/MatchExplanation";
import { ProposalModal } from "@/components/ProposalModal";

export const Route = createFileRoute("/brand/athletes/$id")({
  component: () => (
    <RequireAuth roles={["brand"]} requireOnboarding>
      <AthleteView />
    </RequireAuth>
  ),
});

function AthleteView() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ full_name: string | null; country: string | null } | null>(null);
  const [athlete, setAthlete] = useState<Record<string, never> | null>(null as never);
  const [brand, setBrand] = useState<BrandForMatch & { brand_name: string | null }>({ brand_name: null });
  const [match, setMatch] = useState<MatchScore | null>(null);
  const [propose, setPropose] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [p, a, b] = await Promise.all([
        supabase.from("profiles").select("full_name, country").eq("id", id).maybeSingle(),
        supabase.from("athlete_profiles").select("*").eq("user_id", id).maybeSingle(),
        supabase.from("brand_profiles").select("brand_name, values, esg_priorities, consumer_demographics").eq("user_id", user.id).maybeSingle(),
      ]);
      setProfile(p.data as never);
      setAthlete(a.data as never);
      if (b.data) setBrand(b.data as never);
      if (a.data && p.data) {
        const ad = a.data as Record<string, unknown>;
        setMatch(
          scoreAthlete(
            { ...ad, user_id: id, full_name: p.data.full_name, country: p.data.country } as never,
            (b.data ?? {}) as BrandForMatch,
            null,
          ),
        );
      }
    })();
  }, [id, user]);

  async function shortlist() {
    if (!user) return;
    await supabase.from("saved_athletes").upsert({ brand_id: user.id, athlete_id: id });
    toast.success("Added to shortlist");
  }

  if (!profile || !athlete) {
    return <DashboardShell title="Loading athlete…"><div /></DashboardShell>;
  }
  const a = athlete as unknown as {
    sport: string | null; discipline: string | null; professional_level: string | null;
    values: string[] | null; causes: string[] | null; story: string | null;
    audience_demographics: { summary?: string } | null;
    pricing_min: number | null; pricing_max: number | null;
    partnership_types: string[] | null; verification_status: string | null;
  };

  return (
    <DashboardShell
      title={profile.full_name ?? "Athlete"}
      subtitle={`${a.sport ?? ""}${a.discipline ? ` · ${a.discipline}` : ""}${profile.country ? ` · ${profile.country}` : ""}`}
      actions={
        <Link to="/brand/matches" className="inline-flex items-center gap-2 rounded-full border border-border bg-cream px-4 py-2 text-sm">
          <ArrowLeft className="h-4 w-4" /> Discovery
        </Link>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-border bg-cream p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-gold font-display text-2xl text-plum-deep">
                {(profile.full_name ?? "A").split(" ").map((p) => p[0]).slice(0, 2).join("")}
              </div>
              <div>
                <h2 className="font-display text-2xl">{profile.full_name}</h2>
                <p className="text-sm text-muted-foreground">{a.professional_level} · {a.sport}</p>
                {a.verification_status === "verified" && (
                  <span className="mt-1 inline-flex items-center gap-1 text-xs text-plum">
                    <ShieldCheck className="h-3.5 w-3.5" /> Verified
                  </span>
                )}
              </div>
            </div>
            {a.story && <p className="mt-5 text-sm leading-relaxed text-foreground/85">{a.story}</p>}
          </div>

          <Section title="Values & causes">
            <div className="flex flex-wrap gap-2">
              {(a.values ?? []).map((v) => (
                <span key={v} className="rounded-full bg-plum/10 px-3 py-1 text-xs text-plum">{v}</span>
              ))}
              {(a.causes ?? []).map((v) => (
                <span key={v} className="rounded-full bg-gold/15 px-3 py-1 text-xs text-plum-deep">{v}</span>
              ))}
            </div>
          </Section>

          <Section title="Audience">
            <p className="text-sm text-foreground/85">{a.audience_demographics?.summary ?? "Audience insights coming soon."}</p>
          </Section>

          <Section title="Partnership preferences">
            <p className="text-sm text-foreground/85">
              {(a.partnership_types ?? []).join(", ") || "Open to all"} · pricing
              {a.pricing_min ? ` $${a.pricing_min.toLocaleString()}` : ""}
              {a.pricing_max ? `–$${a.pricing_max.toLocaleString()}` : ""}
            </p>
          </Section>
        </div>

        <div className="space-y-4">
          {match && <MatchExplanation match={match} />}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setPropose(true)}
              className="rounded-full bg-gradient-gold px-5 py-3 text-sm font-medium text-plum-deep shadow-gold"
            >
              Send proposal
            </button>
            <button onClick={shortlist} className="rounded-full border border-plum px-5 py-3 text-sm font-medium text-plum hover:bg-plum/5">
              Save to shortlist
            </button>
          </div>
        </div>
      </div>

      {match && propose && (
        <ProposalModal
          open
          onClose={() => setPropose(false)}
          athleteId={id}
          athleteName={profile.full_name ?? "Athlete"}
          brandName={brand.brand_name ?? "Your brand"}
          campaign={null}
          match={match}
        />
      )}
    </DashboardShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-cream p-6 shadow-sm">
      <h3 className="font-display text-base text-plum-deep">{title}</h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}
