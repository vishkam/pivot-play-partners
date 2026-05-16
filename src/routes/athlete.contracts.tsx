import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

interface Row {
  id: string; title: string; status: string; compensation_amount: number;
  created_at: string; counterparty: string;
}

function makeRoute(path: "/athlete/contracts" | "/brand/contracts", role: "athlete" | "brand") {
  return createFileRoute(path)({
    component: () => (
      <RequireAuth roles={[role]} requireOnboarding>
        <ContractList role={role} />
      </RequireAuth>
    ),
  });
}

export const Route = makeRoute("/athlete/contracts", "athlete");
export { makeRoute as createContractListRoute };

export function ContractList({ role }: { role: "athlete" | "brand" }) {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const col = role === "athlete" ? "athlete_id" : "brand_id";
      const { data } = await supabase
        .from("contracts").select("*").eq(col, user.id).order("created_at", { ascending: false });
      const otherCol = role === "athlete" ? "brand_id" : "athlete_id";
      const otherIds = [...new Set((data ?? []).map((d) => d[otherCol] as string))];
      const [{ data: bp }, { data: ap }] = await Promise.all([
        otherIds.length && role === "athlete"
          ? supabase.from("brand_profiles").select("user_id, brand_name").in("user_id", otherIds)
          : Promise.resolve({ data: [] }),
        otherIds.length && role === "brand"
          ? supabase.from("profiles").select("id, full_name").in("id", otherIds)
          : Promise.resolve({ data: [] }),
      ]);
      const nameMap = new Map<string, string>();
      (bp ?? []).forEach((b: { user_id: string; brand_name: string | null }) => nameMap.set(b.user_id, b.brand_name || "Brand"));
      (ap ?? []).forEach((a: { id: string; full_name: string | null }) => nameMap.set(a.id, a.full_name || "Athlete"));
      setRows(
        (data ?? []).map((d) => ({
          id: d.id, title: d.title, status: d.status,
          compensation_amount: d.compensation_amount, created_at: d.created_at,
          counterparty: nameMap.get(d[otherCol] as string) || "Member",
        }))
      );
    })();
  }, [user, role]);

  return (
    <DashboardShell title="Contracts" subtitle="Your partnership agreements across the platform.">
      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-cream p-12 text-center">
          <FileText className="mx-auto h-6 w-6 text-plum" />
          <p className="mt-3 text-sm text-muted-foreground">No contracts yet.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-cream">
          {rows.map((r) => (
            <li key={r.id}>
              <Link to="/contracts/$id" params={{ id: r.id }} className="flex items-center justify-between gap-4 p-5 hover:bg-secondary">
                <div className="min-w-0">
                  <p className="font-display text-lg text-foreground">{r.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{r.counterparty} · {new Date(r.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-sm font-medium">${r.compensation_amount.toLocaleString()}</span>
                  <StatusChip status={r.status} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </DashboardShell>
  );
}

export function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    pending_signature: "bg-gold/15 text-plum-deep",
    signed: "bg-plum/10 text-plum",
    active: "bg-gradient-gold text-plum-deep",
    completed: "bg-cream text-plum border border-border",
    cancelled: "bg-destructive/10 text-destructive",
  };
  return (
    <span className={`rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-wider ${map[status] ?? "bg-muted text-muted-foreground"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
