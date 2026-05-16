import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/disputes")({
  component: () => (
    <RequireAuth roles={["admin"]}>
      <Disputes />
    </RequireAuth>
  ),
});

interface D { id: string; reason: string; details: string | null; status: string; created_at: string; reporter_id: string }

function Disputes() {
  const [rows, setRows] = useState<D[]>([]);
  async function load() {
    const { data } = await supabase.from("disputes").select("*").order("created_at", { ascending: false });
    setRows((data ?? []) as D[]);
  }
  useEffect(() => { load(); }, []);

  async function setStatus(id: string, status: "in_review" | "resolved" | "rejected") {
    const { error } = await supabase.from("disputes").update({ status }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Updated"); load(); }
  }

  return (
    <DashboardShell title="Disputes" subtitle="Trust & safety queue.">
      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-cream p-12 text-center">
          <AlertTriangle className="mx-auto h-6 w-6 text-plum" />
          <p className="mt-3 text-sm text-muted-foreground">No disputes on the queue.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {rows.map((d) => (
            <li key={d.id} className="rounded-2xl border border-border bg-cream p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-display text-lg">{d.reason}</p>
                  <p className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleString()} · reporter {d.reporter_id.slice(0, 8)}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-wider ${
                  d.status === "open" ? "bg-destructive/10 text-destructive" :
                  d.status === "in_review" ? "bg-gold/15 text-plum-deep" :
                  d.status === "resolved" ? "bg-gradient-gold text-plum-deep" :
                  "bg-muted text-muted-foreground"
                }`}>{d.status.replace("_", " ")}</span>
              </div>
              {d.details && <p className="mt-2 text-sm text-foreground/85">{d.details}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={() => setStatus(d.id, "in_review")} className="rounded-full border border-plum px-3 py-1 text-xs text-plum hover:bg-plum/5">Mark in review</button>
                <button onClick={() => setStatus(d.id, "resolved")} className="rounded-full bg-plum-deep px-3 py-1 text-xs text-cream">Resolve</button>
                <button onClick={() => setStatus(d.id, "rejected")} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-secondary">Reject</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashboardShell>
  );
}
