import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/revenue")({
  component: () => (
    <RequireAuth roles={["admin"]}>
      <Revenue />
    </RequireAuth>
  ),
});

function Revenue() {
  const [stats, setStats] = useState({ gmv: 0, fees: 0, payouts: 0, contracts: 0 });
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("payments").select("amount, platform_fee, athlete_payout, status");
      const { count } = await supabase.from("contracts").select("*", { count: "exact", head: true });
      const released = (data ?? []).filter((p) => p.status === "released");
      setStats({
        gmv: released.reduce((s, p) => s + (p.amount ?? 0), 0),
        fees: released.reduce((s, p) => s + (p.platform_fee ?? 0), 0),
        payouts: released.reduce((s, p) => s + (p.athlete_payout ?? 0), 0),
        contracts: count ?? 0,
      });
    })();
  }, []);
  return (
    <DashboardShell title="Revenue" subtitle="Platform GMV, commission, and payouts.">
      <div className="grid gap-5 lg:grid-cols-4">
        <Stat label="GMV (released)" value={`$${stats.gmv.toLocaleString()}`} accent />
        <Stat label="Platform commission" value={`$${stats.fees.toLocaleString()}`} />
        <Stat label="Athlete payouts" value={`$${stats.payouts.toLocaleString()}`} />
        <Stat label="Total contracts" value={String(stats.contracts)} />
      </div>
    </DashboardShell>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-6 ${accent ? "border-gold bg-gradient-gold/10" : "border-border bg-cream"}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-4xl text-plum-deep">{value}</p>
    </div>
  );
}
