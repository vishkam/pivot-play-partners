import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Wallet, TrendingUp } from "lucide-react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/athlete/earnings")({
  component: () => (
    <RequireAuth roles={["athlete"]} requireOnboarding>
      <Earnings />
    </RequireAuth>
  ),
});

interface Pay { id: string; amount: number; athlete_payout: number; status: string; milestone_label: string | null; due_date: string | null; contract_id: string; created_at: string }

function Earnings() {
  const { user } = useAuth();
  const [pays, setPays] = useState<Pay[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("payments").select("*").eq("athlete_id", user.id).order("created_at", { ascending: false });
      setPays((data ?? []) as Pay[]);
    })();
  }, [user]);

  const earned = pays.filter((p) => p.status === "released").reduce((s, p) => s + p.athlete_payout, 0);
  const escrow = pays.filter((p) => p.status === "escrow").reduce((s, p) => s + p.athlete_payout, 0);
  const pending = pays.filter((p) => p.status === "pending").reduce((s, p) => s + p.athlete_payout, 0);

  return (
    <DashboardShell title="Earnings" subtitle="Track payouts across your partnerships.">
      <div className="grid gap-5 lg:grid-cols-3">
        <Stat label="Earned (released)" value={earned} accent />
        <Stat label="In escrow" value={escrow} />
        <Stat label="Pending milestones" value={pending} />
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-cream">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h3 className="font-display text-lg">Payment history</h3>
          <TrendingUp className="h-4 w-4 text-plum" />
        </div>
        {pays.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            <Wallet className="mx-auto h-6 w-6 text-plum" />
            <p className="mt-2">No payouts yet. Earnings appear once a contract is signed.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {pays.map((p) => (
              <li key={p.id} className="flex items-center justify-between p-5 text-sm">
                <div>
                  <p className="font-medium">{p.milestone_label || "Milestone"}</p>
                  <p className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display text-lg text-plum-deep">${p.athlete_payout.toLocaleString()}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                    p.status === "released" ? "bg-gradient-gold text-plum-deep" :
                    p.status === "escrow" ? "bg-plum/10 text-plum" :
                    p.status === "pending" ? "bg-muted text-muted-foreground" :
                    "bg-destructive/10 text-destructive"
                  }`}>{p.status}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardShell>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-6 ${accent ? "border-gold bg-gradient-gold/10" : "border-border bg-cream"}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-4xl text-plum-deep">${value.toLocaleString()}</p>
    </div>
  );
}
