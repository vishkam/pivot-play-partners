import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { StatusChip } from "./athlete.contracts";

export const Route = createFileRoute("/admin/contracts")({
  component: () => (
    <RequireAuth roles={["admin"]}>
      <AdminContracts />
    </RequireAuth>
  ),
});

function AdminContracts() {
  const [rows, setRows] = useState<Array<{ id: string; title: string; status: string; compensation_amount: number; created_at: string }>>([]);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("contracts").select("id, title, status, compensation_amount, created_at").order("created_at", { ascending: false });
      setRows((data ?? []) as typeof rows);
    })();
  }, []);
  return (
    <DashboardShell title="Contract oversight" subtitle="All partnership agreements on the platform.">
      <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-cream">
        {rows.length === 0 && <li className="p-10 text-center text-sm text-muted-foreground">No contracts yet.</li>}
        {rows.map((r) => (
          <li key={r.id}>
            <Link to="/contracts/$id" params={{ id: r.id }} className="flex items-center justify-between gap-4 p-5 hover:bg-secondary">
              <div>
                <p className="font-display text-lg">{r.title}</p>
                <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-medium">${r.compensation_amount.toLocaleString()}</span>
                <StatusChip status={r.status} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </DashboardShell>
  );
}
