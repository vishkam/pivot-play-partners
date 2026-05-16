import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck, Users, AlertTriangle, LineChart } from "lucide-react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/dashboard")({
  component: () => (
    <RequireAuth roles={["admin"]}>
      <AdminDashboard />
    </RequireAuth>
  ),
});

interface Counts { athletes: number; brands: number; pending: number; campaigns: number; matches: number; proposals: number; accepted: number; }

function AdminDashboard() {
  const [c, setC] = useState<Counts>({ athletes: 0, brands: 0, pending: 0, campaigns: 0, matches: 0, proposals: 0, accepted: 0 });

  useEffect(() => {
    (async () => {
      const [a, b, p, cm, m, pr, ac] = await Promise.all([
        supabase.from("athlete_profiles").select("*", { count: "exact", head: true }),
        supabase.from("brand_profiles").select("*", { count: "exact", head: true }),
        supabase.from("athlete_profiles").select("*", { count: "exact", head: true }).eq("verification_status", "pending"),
        supabase.from("campaigns").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("matches").select("*", { count: "exact", head: true }),
        supabase.from("proposals").select("*", { count: "exact", head: true }),
        supabase.from("proposals").select("*", { count: "exact", head: true }).eq("status", "accepted"),
      ]);
      setC({
        athletes: a.count ?? 0, brands: b.count ?? 0, pending: p.count ?? 0,
        campaigns: cm.count ?? 0, matches: m.count ?? 0,
        proposals: pr.count ?? 0, accepted: ac.count ?? 0,
      });
    })();
  }, []);

  const successRate = c.proposals ? Math.round((c.accepted / c.proposals) * 100) : 0;

  return (
    <DashboardShell title="Admin control" subtitle="Verification queues, marketplace activity and platform health.">
      <div className="grid gap-5 lg:grid-cols-4">
        <Stat icon={Users} label="Athletes" value={c.athletes.toString()} />
        <Stat icon={Users} label="Brands" value={c.brands.toString()} />
        <Stat icon={ShieldCheck} label="Pending verifications" value={c.pending.toString()} />
        <Stat icon={LineChart} label="Active campaigns" value={c.campaigns.toString()} />
        <Stat icon={LineChart} label="Matches generated" value={c.matches.toString()} />
        <Stat icon={LineChart} label="Proposals sent" value={c.proposals.toString()} />
        <Stat icon={LineChart} label="Accepted" value={c.accepted.toString()} />
        <Stat icon={LineChart} label="Match success rate" value={`${successRate}%`} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Panel icon={ShieldCheck} title="Verification queue"
          body="Review athlete and brand verification submissions. Approve to unlock matching." />
        <Panel icon={AlertTriangle} title="Low-confidence matches"
          body="Matches scoring under 50 are flagged here for review before brand visibility." />
        <Panel icon={Users} title="User management"
          body="Search, impersonate, and manage roles across all members." />
        <Panel icon={LineChart} title="Revenue analytics"
          body="MRR, take-rate, retention and athlete earnings dashboards." />
      </div>
    </DashboardShell>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-cream p-5 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-plum" /> {label}
      </div>
      <p className="mt-2 font-display text-3xl text-plum-deep">{value}</p>
    </div>
  );
}
function Panel({ icon: Icon, title, body }: { icon: typeof Users; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border bg-cream p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-plum" />
        <h3 className="font-display text-lg">{title}</h3>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{body}</p>
      <div className="mt-4 rounded-xl border border-dashed border-border bg-background p-6 text-center text-xs text-muted-foreground">
        Tooling coming online with Phase 3.
      </div>
    </div>
  );
}
