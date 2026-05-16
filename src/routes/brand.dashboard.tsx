import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Megaphone, Users, Bookmark, FileText, Wallet, ArrowRight } from "lucide-react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/brand/dashboard")({
  component: () => (
    <RequireAuth roles={["brand"]} requireOnboarding>
      <BrandDashboard />
    </RequireAuth>
  ),
});

interface Campaign {
  id: string; name: string; status: string;
  budget_min: number | null; budget_max: number | null;
}

function BrandDashboard() {
  const { profile, user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("campaigns")
        .select("id, name, status, budget_min, budget_max")
        .eq("brand_id", user.id)
        .order("created_at", { ascending: false });
      setCampaigns((data as Campaign[]) ?? []);
    })();
  }, [user]);

  return (
    <DashboardShell
      title={profile?.full_name ? `${profile.full_name.split(" ")[0]}'s workspace` : "Brand workspace"}
      subtitle="Discover, message and partner with women athletes."
      actions={
        <button className="rounded-full bg-plum-deep px-5 py-2.5 text-sm font-medium text-cream hover:opacity-90">
          + New campaign
        </button>
      }
    >
      <div className="grid gap-5 lg:grid-cols-4">
        <Stat icon={Megaphone} label="Active campaigns" value={campaigns.filter((c) => c.status === "active").length.toString()} />
        <Stat icon={Users} label="Matched athletes" value="0" />
        <Stat icon={Bookmark} label="Saved athletes" value="0" />
        <Stat icon={Wallet} label="Budget deployed" value="$0" />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-cream p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg">Campaigns</h3>
            <span className="text-xs text-muted-foreground">{campaigns.length} total</span>
          </div>
          <div className="mt-4 space-y-2">
            {campaigns.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-background p-8 text-center text-sm text-muted-foreground">
                No campaigns yet. Launch your first one to start matching with athletes.
              </div>
            ) : campaigns.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3">
                <div>
                  <p className="font-medium text-foreground">{c.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.budget_min ? `$${c.budget_min.toLocaleString()}` : "—"}
                    {c.budget_max ? ` – $${c.budget_max.toLocaleString()}` : ""}
                  </p>
                </div>
                <span className="rounded-full bg-plum/10 px-3 py-1 text-xs uppercase tracking-wider text-plum">{c.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-cream p-6 shadow-sm">
          <h3 className="font-display text-lg">Proposal center</h3>
          <div className="mt-4 rounded-xl border border-dashed border-border bg-background p-6 text-center text-sm text-muted-foreground">
            <FileText className="mx-auto h-6 w-6 text-plum" />
            <p className="mt-3">Send proposals to athletes — track status, contracts and payouts in one place.</p>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-cream p-6 shadow-sm">
        <h3 className="font-display text-lg">Athlete discovery</h3>
        <div className="mt-4 rounded-xl border border-dashed border-border bg-background p-8 text-center text-sm text-muted-foreground">
          The AI match engine launches with Phase 3. Your campaign brief will surface ranked athletes here.
        </div>
      </div>
    </DashboardShell>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Megaphone; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-cream p-5 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-plum" /> {label}
      </div>
      <p className="mt-2 font-display text-3xl text-plum-deep">{value}</p>
    </div>
  );
}
