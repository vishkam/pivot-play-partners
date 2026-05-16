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

interface Counts { athletes: number; brands: number; pending: number; }

function AdminDashboard() {
  const [counts, setCounts] = useState<Counts>({ athletes: 0, brands: 0, pending: 0 });

  useEffect(() => {
    (async () => {
      const [{ count: athletes }, { count: brands }, { count: pending }] = await Promise.all([
        supabase.from("athlete_profiles").select("*", { count: "exact", head: true }),
        supabase.from("brand_profiles").select("*", { count: "exact", head: true }),
        supabase.from("athlete_profiles").select("*", { count: "exact", head: true }).eq("verification_status", "pending"),
      ]);
      setCounts({ athletes: athletes ?? 0, brands: brands ?? 0, pending: pending ?? 0 });
    })();
  }, []);

  return (
    <DashboardShell title="Admin control" subtitle="Verification queues, users and platform health.">
      <div className="grid gap-5 lg:grid-cols-4">
        <Stat icon={Users} label="Athletes" value={counts.athletes.toString()} />
        <Stat icon={Users} label="Brands" value={counts.brands.toString()} />
        <Stat icon={ShieldCheck} label="Pending verifications" value={counts.pending.toString()} />
        <Stat icon={LineChart} label="GMV (MTD)" value="$0" />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Panel icon={ShieldCheck} title="Verification queue"
          body="Review athlete and brand verification submissions. Approve to unlock matching." />
        <Panel icon={AlertTriangle} title="Fraud & integrity"
          body="Anomaly signals on signups, contract terms and payment flows surface here." />
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
