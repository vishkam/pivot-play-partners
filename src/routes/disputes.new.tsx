import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, AlertOctagon } from "lucide-react";
import { toast } from "sonner";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/disputes/new")({
  validateSearch: (s: Record<string, unknown>) => ({
    contract_id: typeof s.contract_id === "string" ? s.contract_id : undefined,
  }),
  component: () => (
    <RequireAuth roles={["athlete", "brand"]}>
      <NewDispute />
    </RequireAuth>
  ),
});

function NewDispute() {
  const { contract_id } = Route.useSearch();
  const { user } = useAuth();
  const nav = useNavigate();
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!user || !reason.trim()) return;
    setBusy(true);
    const { error } = await supabase.from("disputes").insert({
      contract_id: contract_id ?? null,
      reporter_id: user.id,
      reason: reason.trim(),
      details: details.trim() || null,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Dispute filed. Moderators will review within 48h.");
    nav({ to: "/" });
  }

  return (
    <DashboardShell title="File a dispute" subtitle="Tell us what happened — Allyance moderators review every report.">
      <div className="max-w-2xl rounded-2xl border border-border bg-cream p-8 shadow-sm">
        <div className="flex items-start gap-3 rounded-xl bg-destructive/5 p-4 text-sm text-destructive">
          <AlertOctagon className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Be specific and respectful. False reports may affect your reputation score.</p>
        </div>
        <label className="mt-6 block">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Reason</span>
          <select value={reason} onChange={(e) => setReason(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm">
            <option value="">Select a reason</option>
            <option>Non-payment</option>
            <option>Scope changes after signing</option>
            <option>Deliverables not met</option>
            <option>Misleading brand information</option>
            <option>Inappropriate conduct</option>
            <option>Other</option>
          </select>
        </label>
        <label className="mt-4 block">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Details</span>
          <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={6}
            placeholder="Walk us through what happened, with dates if possible."
            className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" />
        </label>
        <button onClick={submit} disabled={busy || !reason}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-plum-deep px-5 py-2.5 text-sm font-medium text-cream disabled:opacity-50">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} File dispute
        </button>
      </div>
    </DashboardShell>
  );
}
