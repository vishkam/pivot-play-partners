import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Inbox, Check, X, MessageSquare, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/athlete/opportunities")({
  component: () => (
    <RequireAuth roles={["athlete"]} requireOnboarding>
      <Opportunities />
    </RequireAuth>
  ),
});

interface Row {
  id: string; brand_id: string; campaign_id: string | null; status: string;
  body: string | null; proposed_amount: number | null; partnership_type: string | null;
  timeline: string | null; deliverables: string | null; created_at: string;
  brand_name?: string; campaign_name?: string; campaign_goals?: string | null;
}

function Opportunities() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    if (!user) return;
    const { data } = await supabase
      .from("proposals")
      .select("*")
      .eq("athlete_id", user.id)
      .order("created_at", { ascending: false });
    const bids = [...new Set((data ?? []).map((r) => r.brand_id))];
    const cids = [...new Set((data ?? []).map((r) => r.campaign_id).filter(Boolean) as string[])];
    const [bp, cp] = await Promise.all([
      bids.length ? supabase.from("brand_profiles").select("user_id, brand_name").in("user_id", bids) : Promise.resolve({ data: [] as { user_id: string; brand_name: string | null }[] }),
      cids.length ? supabase.from("campaigns").select("id, name, goals").in("id", cids) : Promise.resolve({ data: [] as { id: string; name: string; goals: string | null }[] }),
    ]);
    const bMap = new Map(bp.data?.map((b) => [b.user_id, b.brand_name]));
    const cMap = new Map(cp.data?.map((c) => [c.id, c]));
    setRows(
      (data ?? []).map((r) => ({
        ...r,
        brand_name: bMap.get(r.brand_id) ?? "Brand",
        campaign_name: r.campaign_id ? cMap.get(r.campaign_id)?.name : undefined,
        campaign_goals: r.campaign_id ? cMap.get(r.campaign_id)?.goals : null,
      })) as Row[],
    );
  }

  useEffect(() => { load(); }, [user]);

  async function respond(id: string, status: "accepted" | "declined" | "negotiating") {
    if (!user) return;
    const row = rows.find((r) => r.id === id);
    setBusy(id);
    const { error } = await supabase.from("proposals").update({ status }).eq("id", id);
    if (error) { setBusy(null); toast.error(error.message); return; }

    // On accept → spin up a draft contract + notify the brand
    if (status === "accepted" && row) {
      const amount = row.proposed_amount ?? 0;
      const fee = Math.round(amount * 0.1);
      const { data: contract } = await supabase.from("contracts").insert({
        brand_id: row.brand_id,
        athlete_id: user.id,
        campaign_id: row.campaign_id,
        proposal_id: id,
        title: `${row.campaign_name ?? row.partnership_type ?? "Partnership"} — ${row.brand_name ?? "Brand"}`,
        status: "draft",
        compensation_amount: amount,
        platform_fee_pct: 10,
        deliverables: row.deliverables ?? "",
        timeline: row.timeline ?? "",
        payment_schedule: "50% on signature · 50% on completion",
        plain_summary: `${row.brand_name ?? "Brand"} × you — ready for review and signature.`,
      }).select("id").single();
      await Promise.all([
        supabase.from("notifications").insert({
          user_id: row.brand_id, kind: "proposal",
          title: "Proposal accepted",
          body: `$${amount.toLocaleString()} · contract draft ready`,
          link: contract?.id ? `/contracts/${contract.id}` : "/brand/contracts",
        }),
        supabase.from("messages").insert({
          sender_id: user.id, recipient_id: row.brand_id,
          body: `Accepted — contract draft is ready to review.`,
          proposal_id: id, contract_id: contract?.id ?? null,
          system_event: "proposal_accepted",
        }),
      ]);
      void fee;
      toast.success("Accepted · Contract draft ready");
    } else if (status === "negotiating" && row) {
      await supabase.from("notifications").insert({
        user_id: row.brand_id, kind: "proposal",
        title: "Changes requested", body: row.brand_name ? `${row.brand_name} proposal` : "Proposal",
        link: "/brand/proposals",
      });
      toast.success("Sent back for revisions");
    } else {
      toast.success("Declined");
      if (row) {
        await supabase.from("notifications").insert({
          user_id: row.brand_id, kind: "proposal",
          title: "Proposal declined", body: row.brand_name ?? "", link: "/brand/proposals",
        });
      }
    }
    setBusy(null);
    load();
  }

  const labelFor = (s: string) =>
    s === "sent" ? "New" : s === "negotiating" ? "Changes requested" : s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <DashboardShell title="Opportunities" subtitle="Brand proposals tailored to your profile and values.">
      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-cream p-12 text-center">
          <Inbox className="mx-auto h-6 w-6 text-plum" />
          <p className="mt-3 text-sm text-muted-foreground">No opportunities yet. Brands typically reach out within 14 days of going live.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((r) => {
            const expanded = open === r.id;
            return (
              <div key={r.id} className="rounded-2xl border border-border bg-cream shadow-sm">
                <button
                  onClick={() => setOpen(expanded ? null : r.id)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left"
                >
                  <div className="min-w-0">
                    <p className="font-display text-lg text-foreground">{r.brand_name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {r.campaign_name ?? "Direct proposal"} · {r.partnership_type ?? "Partnership"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="hidden text-sm font-medium text-foreground sm:inline">
                      ${(r.proposed_amount ?? 0).toLocaleString()}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-wider ${
                      r.status === "accepted" ? "bg-gradient-gold text-plum-deep" :
                      r.status === "declined" ? "bg-destructive/10 text-destructive" :
                      r.status === "negotiating" ? "bg-gold/15 text-plum-deep" :
                      "bg-plum/10 text-plum"
                    }`}>
                      {labelFor(r.status)}
                    </span>
                  </div>
                </button>

                {expanded && (
                  <div className="border-t border-border p-5">
                    <div className="grid gap-2 text-xs sm:grid-cols-3">
                      <Info label="Partnership" value={r.partnership_type ?? "—"} />
                      <Info label="Timeline" value={r.timeline ?? "—"} />
                      <Info label="Compensation" value={`$${(r.proposed_amount ?? 0).toLocaleString()}`} />
                    </div>
                    {r.deliverables && (
                      <div className="mt-3">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Deliverables</p>
                        <p className="text-sm text-foreground/85">{r.deliverables}</p>
                      </div>
                    )}
                    {r.body && (
                      <pre className="mt-4 max-h-72 overflow-y-auto whitespace-pre-wrap rounded-xl border border-dashed border-border bg-background p-4 text-sm leading-relaxed text-foreground/85">
                        {r.body}
                      </pre>
                    )}

                    {r.status === "sent" || r.status === "viewed" || r.status === "negotiating" ? (
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <button
                          disabled={busy === r.id}
                          onClick={() => respond(r.id, "accepted")}
                          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-gold px-5 py-2 text-xs font-medium text-plum-deep shadow-gold"
                        >
                          {busy === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Accept
                        </button>
                        <button
                          disabled={busy === r.id}
                          onClick={() => respond(r.id, "negotiating")}
                          className="inline-flex items-center gap-1.5 rounded-full border border-plum px-5 py-2 text-xs font-medium text-plum hover:bg-plum/5"
                        >
                          <MessageSquare className="h-3.5 w-3.5" /> Request changes
                        </button>
                        <button
                          disabled={busy === r.id}
                          onClick={() => respond(r.id, "declined")}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border px-5 py-2 text-xs text-muted-foreground hover:bg-secondary"
                        >
                          <X className="h-3.5 w-3.5" /> Decline
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-background p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
