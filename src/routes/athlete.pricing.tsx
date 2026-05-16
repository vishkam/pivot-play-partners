import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2, Tag } from "lucide-react";
import { toast } from "sonner";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/athlete/pricing")({
  component: () => (
    <RequireAuth roles={["athlete"]} requireOnboarding>
      <Pricing />
    </RequireAuth>
  ),
});

const PACKAGES = [
  { key: "sponsored_post", label: "Sponsored post", bench: [800, 2500] },
  { key: "ambassador", label: "Ambassador package", bench: [5000, 25000] },
  { key: "appearance", label: "Event appearance", bench: [1500, 8000] },
  { key: "affiliate", label: "Affiliate (commission)", bench: [10, 30] },
  { key: "equity", label: "Equity partnership", bench: [0, 0] },
  { key: "long_term", label: "Long-term campaign", bench: [15000, 80000] },
];

interface PP { id: string; package_type: string; description: string | null; price_min: number | null; price_max: number | null; unit: string | null }

function Pricing() {
  const { user } = useAuth();
  const [rows, setRows] = useState<PP[]>([]);
  const [busy, setBusy] = useState(false);

  async function load() {
    if (!user) return;
    const { data } = await supabase.from("pricing_profiles").select("*").eq("athlete_id", user.id);
    setRows((data ?? []) as PP[]);
  }
  useEffect(() => { load(); }, [user]);

  async function addPackage(key: string) {
    if (!user) return;
    setBusy(true);
    const def = PACKAGES.find((p) => p.key === key)!;
    await supabase.from("pricing_profiles").insert({
      athlete_id: user.id, package_type: key,
      price_min: def.bench[0], price_max: def.bench[1], unit: "flat",
    });
    setBusy(false); load();
  }

  async function update(id: string, patch: Partial<PP>) {
    await supabase.from("pricing_profiles").update(patch).eq("id", id);
  }

  async function remove(id: string) {
    await supabase.from("pricing_profiles").delete().eq("id", id);
    load();
  }

  const available = PACKAGES.filter((p) => !rows.find((r) => r.package_type === p.key));

  return (
    <DashboardShell title="Rate card" subtitle="Set your preferred pricing. Brands see these on your profile.">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {rows.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-cream p-10 text-center">
              <Tag className="mx-auto h-6 w-6 text-plum" />
              <p className="mt-3 text-sm text-muted-foreground">Add your first package to start receiving better-matched proposals.</p>
            </div>
          )}
          {rows.map((r) => {
            const def = PACKAGES.find((p) => p.key === r.package_type);
            return (
              <div key={r.id} className="rounded-2xl border border-border bg-cream p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="font-display text-lg">{def?.label || r.package_type}</p>
                  <button onClick={() => remove(r.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground">Market benchmark: ${def?.bench[0].toLocaleString()}–${def?.bench[1].toLocaleString()}</p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <NumField label="Min ($)" value={r.price_min ?? 0}
                    onChange={(v) => { setRows((rs) => rs.map((x) => x.id === r.id ? { ...x, price_min: v } : x)); update(r.id, { price_min: v }); }} />
                  <NumField label="Max ($)" value={r.price_max ?? 0}
                    onChange={(v) => { setRows((rs) => rs.map((x) => x.id === r.id ? { ...x, price_max: v } : x)); update(r.id, { price_max: v }); }} />
                </div>
                <input
                  defaultValue={r.description ?? ""}
                  onBlur={(e) => update(r.id, { description: e.target.value })}
                  placeholder="Add a note (what's included, turnaround time…)"
                  className="mt-3 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs"
                />
              </div>
            );
          })}
        </div>

        <div>
          <div className="sticky top-6 rounded-2xl border border-border bg-cream p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Add a package</p>
            <ul className="mt-3 space-y-1">
              {available.map((p) => (
                <li key={p.key}>
                  <button onClick={() => addPackage(p.key)} disabled={busy}
                    className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-secondary disabled:opacity-50">
                    <span>{p.label}</span>
                    {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5 text-plum" />}
                  </button>
                </li>
              ))}
              {available.length === 0 && (
                <li className="px-3 py-4 text-xs text-muted-foreground">All package types added.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function NumField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <input type="number" value={value}
        onChange={(e) => onChange(parseInt(e.target.value || "0", 10))}
        className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" />
    </label>
  );
}
