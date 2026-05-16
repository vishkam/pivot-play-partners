import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck, Sparkles, Inbox, Wallet, TrendingUp, Edit3 } from "lucide-react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/athlete/dashboard")({
  component: () => (
    <RequireAuth roles={["athlete"]} requireOnboarding>
      <AthleteDashboard />
    </RequireAuth>
  ),
});

function AthleteDashboard() {
  const { profile, user } = useAuth();
  const [completeness, setCompleteness] = useState(0);
  const [verification, setVerification] = useState<string>("pending");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("athlete_profiles")
        .select("profile_completeness, verification_status")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setCompleteness(data.profile_completeness ?? 0);
        setVerification(data.verification_status ?? "pending");
      }
    })();
  }, [user]);

  return (
      <DashboardShell
        title={`Welcome, ${profile?.full_name?.split(" ")[0] || "Athlete"}.`}
        subtitle="Your Allyance workspace — partnerships, inbox and earnings."
        actions={
          <Link to="/athlete/onboarding"
            className="inline-flex items-center gap-2 rounded-full border border-plum px-4 py-2 text-sm text-plum hover:bg-plum/5">
            <Edit3 className="h-4 w-4" /> Edit profile
          </Link>
        }
      >
        <div className="grid gap-5 lg:grid-cols-3">
          <Card>
            <CardHead icon={Sparkles} label="Profile completeness" />
            <p className="mt-2 font-display text-4xl text-plum-deep">{completeness}%</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border">
              <div className="h-full bg-gradient-gold" style={{ width: `${completeness}%` }} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Complete your media kit to boost match quality.</p>
          </Card>
          <Card>
            <CardHead icon={ShieldCheck} label="Verification" />
            <div className="mt-3 flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                verification === "verified" ? "bg-gold/15 text-plum-deep" : "bg-muted text-muted-foreground"
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${verification === "verified" ? "bg-gold" : "bg-muted-foreground"}`} />
                {verification}
              </span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Verified athletes get 3x more brand outreach.</p>
          </Card>
          <Card>
            <CardHead icon={Wallet} label="Earnings (this year)" />
            <p className="mt-2 font-display text-4xl text-plum-deep">$0</p>
            <p className="mt-2 text-xs text-muted-foreground">Your first deal lands here.</p>
          </Card>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <Card>
            <CardHead icon={Sparkles} label="Recommended brand matches" />
            <EmptyState text="Match engine starts running once your verification clears." />
          </Card>
          <Card>
            <CardHead icon={Inbox} label="Opportunities inbox" />
            <EmptyState text="No outreach yet — brands typically reach out within 14 days of going live." />
          </Card>
        </div>

        <div className="mt-6">
          <Card>
            <CardHead icon={TrendingUp} label="Profile insights" />
            <EmptyState text="Once you're live, you'll see profile views, brand saves and proposal-to-deal conversion here." />
          </Card>
        </div>
      </DashboardShell>
    </RequireAuth>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-border bg-cream p-6 shadow-sm">{children}</div>;
}
function CardHead({ icon: Icon, label }: { icon: typeof Sparkles; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      <Icon className="h-3.5 w-3.5 text-plum" /> {label}
    </div>
  );
}
function EmptyState({ text }: { text: string }) {
  return (
    <div className="mt-4 rounded-xl border border-dashed border-border bg-background p-6 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}
