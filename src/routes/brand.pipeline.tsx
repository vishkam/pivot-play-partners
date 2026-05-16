import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { KanbanSquare } from "lucide-react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/brand/pipeline")({
  component: () => (
    <RequireAuth roles={["brand"]} requireOnboarding>
      <Pipeline />
    </RequireAuth>
  ),
});

const COLUMNS: Array<{ key: string; label: string }> = [
  { key: "draft", label: "Drafts" },
  { key: "active", label: "Active campaigns" },
  { key: "negotiating", label: "Negotiations" },
  { key: "signed", label: "Signed deals" },
  { key: "completed", label: "Completed" },
];

interface Card { id: string; title: string; subtitle: string; href: string; meta: string; col: string }

function Pipeline() {
  const { user } = useAuth();
  const [cards, setCards] = useState<Card[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: camps }, { data: props }, { data: contracts }] = await Promise.all([
        supabase.from("campaigns").select("*").eq("brand_id", user.id),
        supabase.from("proposals").select("*").eq("brand_id", user.id),
        supabase.from("contracts").select("*").eq("brand_id", user.id),
      ]);

      const result: Card[] = [];
      (camps ?? []).forEach((c) => {
        result.push({
          id: `camp-${c.id}`, title: c.name, subtitle: "Campaign",
          href: `/brand/campaigns/${c.id}`, meta: c.budget_max ? `$${(c.budget_max).toLocaleString()}` : "",
          col: c.status === "active" ? "active" : "draft",
        });
      });
      (props ?? []).forEach((p) => {
        if (["sent", "viewed", "negotiating", "counter_offered"].includes(p.status)) {
          result.push({
            id: `prop-${p.id}`, title: p.partnership_type || "Proposal",
            subtitle: "Negotiation", href: `/messages/${p.id}`,
            meta: `$${(p.proposed_amount ?? 0).toLocaleString()}`, col: "negotiating",
          });
        }
      });
      (contracts ?? []).forEach((c) => {
        const col = c.status === "completed" ? "completed" : c.status === "active" || c.status === "signed" ? "signed" : null;
        if (col) {
          result.push({
            id: `con-${c.id}`, title: c.title, subtitle: "Contract",
            href: `/contracts/${c.id}`, meta: `$${(c.compensation_amount).toLocaleString()}`, col,
          });
        }
      });
      setCards(result);
    })();
  }, [user]);

  return (
    <DashboardShell
      title="Deal pipeline"
      subtitle="From campaign brief to completed partnership."
      actions={
        <Link to="/brand/campaigns/new"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-gold px-4 py-2 text-xs font-medium text-plum-deep shadow-gold">
          New campaign
        </Link>
      }
    >
      <div className="grid gap-4 lg:grid-cols-5">
        {COLUMNS.map((col) => {
          const items = cards.filter((c) => c.col === col.key);
          return (
            <div key={col.key} className="flex flex-col rounded-2xl border border-border bg-cream p-3">
              <div className="flex items-center justify-between px-2 py-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{col.label}</p>
                <span className="rounded-full bg-plum/10 px-2 py-0.5 text-[10px] font-semibold text-plum">{items.length}</span>
              </div>
              <div className="mt-2 space-y-2">
                {items.length === 0 && (
                  <div className="rounded-xl border border-dashed border-border bg-background p-4 text-center text-[11px] text-muted-foreground">
                    <KanbanSquare className="mx-auto h-4 w-4 opacity-50" />
                    <p className="mt-1">Empty</p>
                  </div>
                )}
                {items.map((c) => (
                  <a key={c.id} href={c.href} className="block rounded-xl border border-border bg-background p-3 text-sm hover:border-plum">
                    <p className="font-medium text-foreground">{c.title}</p>
                    <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{c.subtitle}</p>
                    {c.meta && <p className="mt-1.5 text-xs font-medium text-plum-deep">{c.meta}</p>}
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardShell>
  );
}
