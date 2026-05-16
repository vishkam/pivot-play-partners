import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MessageSquare, Loader2 } from "lucide-react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/messages")({
  component: () => (
    <RequireAuth roles={["athlete", "brand", "admin"]}>
      <Threads />
    </RequireAuth>
  ),
});

interface Thread {
  proposal_id: string;
  counterparty_id: string;
  counterparty_name: string;
  last_body: string;
  last_at: string;
  unread: number;
}

function Threads() {
  const { user, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [threads, setThreads] = useState<Thread[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const col = role === "athlete" ? "athlete_id" : "brand_id";
      const { data: props } = await supabase
        .from("proposals")
        .select("id, athlete_id, brand_id, body, created_at")
        .eq(col, user.id)
        .order("created_at", { ascending: false });

      const cps = [...new Set((props ?? []).map((p) => (role === "athlete" ? p.brand_id : p.athlete_id)))];
      const [bp, ap, msgs] = await Promise.all([
        cps.length ? supabase.from("brand_profiles").select("user_id, brand_name").in("user_id", cps) : Promise.resolve({ data: [] }),
        cps.length ? supabase.from("profiles").select("id, full_name").in("id", cps) : Promise.resolve({ data: [] }),
        (props ?? []).length
          ? supabase.from("messages").select("proposal_id, body, created_at, recipient_id, read_at")
              .in("proposal_id", (props ?? []).map((p) => p.id))
              .order("created_at", { ascending: false })
          : Promise.resolve({ data: [] }),
      ]);

      const bMap = new Map((bp.data ?? []).map((b: { user_id: string; brand_name: string | null }) => [b.user_id, b.brand_name]));
      const aMap = new Map((ap.data ?? []).map((p: { id: string; full_name: string | null }) => [p.id, p.full_name]));
      const msgsByProp = new Map<string, { body: string; created_at: string; recipient_id: string; read_at: string | null }[]>();
      ((msgs.data ?? []) as { proposal_id: string; body: string; created_at: string; recipient_id: string; read_at: string | null }[]).forEach((m) => {
        if (!m.proposal_id) return;
        const arr = msgsByProp.get(m.proposal_id) ?? [];
        arr.push(m);
        msgsByProp.set(m.proposal_id, arr);
      });

      const result: Thread[] = (props ?? []).map((p) => {
        const cp = role === "athlete" ? p.brand_id : p.athlete_id;
        const ms = msgsByProp.get(p.id) ?? [];
        const last = ms[0];
        const unread = ms.filter((m) => m.recipient_id === user.id && !m.read_at).length;
        return {
          proposal_id: p.id,
          counterparty_id: cp,
          counterparty_name: (role === "athlete" ? bMap.get(cp) : aMap.get(cp)) || "Member",
          last_body: last?.body ?? (p.body ?? "Proposal sent."),
          last_at: last?.created_at ?? p.created_at,
          unread,
        };
      });

      setThreads(result);
      setLoading(false);
    })();
  }, [user, role]);

  return (
    <DashboardShell title="Messages" subtitle="Negotiation threads with brands and athletes.">
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-plum" /></div>
      ) : threads.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-cream p-12 text-center">
          <MessageSquare className="mx-auto h-6 w-6 text-plum" />
          <p className="mt-3 text-sm text-muted-foreground">No threads yet. Start a proposal to open a conversation.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-cream">
          {threads.map((t) => (
            <li key={t.proposal_id}>
              <Link to="/messages/$id" params={{ id: t.proposal_id }} className="flex items-center gap-4 p-5 hover:bg-secondary">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-gold font-display text-plum-deep">
                  {t.counterparty_name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-foreground">{t.counterparty_name}</p>
                    {t.unread > 0 && (
                      <span className="rounded-full bg-gradient-gold px-2 py-0.5 text-[10px] font-semibold text-plum-deep">{t.unread}</span>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{t.last_body}</p>
                </div>
                <span className="shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {new Date(t.last_at).toLocaleDateString()}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </DashboardShell>
  );
}
