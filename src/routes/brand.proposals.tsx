import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/brand/proposals")({
  component: () => (
    <RequireAuth roles={["brand"]} requireOnboarding>
      <Proposals />
    </RequireAuth>
  ),
});

interface Row {
  id: string; athlete_id: string; created_at: string;
  status: string; proposed_amount: number | null; partnership_type: string | null;
  campaign_id: string | null; athlete_name?: string; campaign_name?: string;
}

const STATUS_STYLE: Record<string, string> = {
  sent: "bg-plum/10 text-plum",
  viewed: "bg-secondary text-foreground",
  accepted: "bg-gradient-gold text-plum-deep",
  declined: "bg-destructive/10 text-destructive",
  negotiating: "bg-gold/15 text-plum-deep",
};

function Proposals() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("proposals")
        .select("id, athlete_id, created_at, status, proposed_amount, partnership_type, campaign_id")
        .eq("brand_id", user.id)
        .order("created_at", { ascending: false });
      const ids = [...new Set((data ?? []).map((r) => r.athlete_id))];
      const cids = [...new Set((data ?? []).map((r) => r.campaign_id).filter(Boolean) as string[])];
      const [profs, camps] = await Promise.all([
        ids.length ? supabase.from("profiles").select("id, full_name").in("id", ids) : Promise.resolve({ data: [] as { id: string; full_name: string | null }[] }),
        cids.length ? supabase.from("campaigns").select("id, name").in("id", cids) : Promise.resolve({ data: [] as { id: string; name: string }[] }),
      ]);
      const pMap = new Map(profs.data?.map((p) => [p.id, p.full_name]));
      const cMap = new Map(camps.data?.map((c) => [c.id, c.name]));
      setRows(
        (data ?? []).map((r) => ({
          ...r,
          athlete_name: pMap.get(r.athlete_id) ?? "Athlete",
          campaign_name: r.campaign_id ? cMap.get(r.campaign_id) : undefined,
        })) as Row[],
      );
    })();
  }, [user]);

  return (
    <DashboardShell title="Proposals" subtitle="Track every offer you've sent and its status.">
      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-cream p-12 text-center">
          <FileText className="mx-auto h-6 w-6 text-plum" />
          <p className="mt-3 text-sm text-muted-foreground">No proposals sent yet. Find an aligned athlete and send your first offer.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-cream">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Athlete</th>
                <th className="px-4 py-3">Campaign</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Sent</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium text-foreground">{r.athlete_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.campaign_name ?? "—"}</td>
                  <td className="px-4 py-3 text-foreground/80">{r.partnership_type ?? "—"}</td>
                  <td className="px-4 py-3 text-foreground">${(r.proposed_amount ?? 0).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider ${STATUS_STYLE[r.status] ?? "bg-muted text-muted-foreground"}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardShell>
  );
}
