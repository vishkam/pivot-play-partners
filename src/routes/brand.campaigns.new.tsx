import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, ArrowLeft, Rocket } from "lucide-react";
import { toast } from "sonner";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/brand/campaigns/new")({
  component: () => (
    <RequireAuth roles={["brand"]} requireOnboarding>
      <NewCampaign />
    </RequireAuth>
  ),
});

interface F {
  name: string; goals: string; description: string;
  audience: string; values: string; sports: string; geo: string;
  partnership_structure: string; deliverables: string; timeline: string;
  product_category: string; budget_min: string; budget_max: string; notes: string;
}
const INIT: F = {
  name: "", goals: "", description: "",
  audience: "", values: "", sports: "", geo: "",
  partnership_structure: "Ambassador deal", deliverables: "", timeline: "",
  product_category: "", budget_min: "", budget_max: "", notes: "",
};

function NewCampaign() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [d, setD] = useState<F>(INIT);
  const [saving, setSaving] = useState(false);
  const upd = <K extends keyof F>(k: K) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setD((s) => ({ ...s, [k]: e.target.value }));

  async function launch(status: "draft" | "active") {
    if (!user) return;
    if (!d.name) {
      toast.error("Give your campaign a name.");
      return;
    }
    setSaving(true);
    try {
      const split = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
      const { data, error } = await supabase
        .from("campaigns")
        .insert({
          brand_id: user.id,
          name: d.name,
          description: d.description,
          goals: d.goals,
          preferred_athlete_types: split(d.audience),
          sports: split(d.sports),
          geographic_reach: split(d.geo),
          partnership_structure: d.partnership_structure,
          content_deliverables: d.deliverables,
          timeline: d.timeline,
          product_category: d.product_category,
          budget_min: d.budget_min ? Number(d.budget_min) : null,
          budget_max: d.budget_max ? Number(d.budget_max) : null,
          notes: d.notes,
          status,
        })
        .select("id")
        .single();
      if (error) throw error;
      toast.success(status === "active" ? "Campaign live — matching now" : "Saved as draft");
      navigate({ to: "/brand/campaigns/$id", params: { id: data!.id } });
    } catch (e) {
      console.error(e);
      toast.error("Couldn't create campaign");
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardShell
      title="New campaign"
      subtitle="Define the brief. We'll surface aligned women athletes instantly."
      actions={
        <button
          onClick={() => navigate({ to: "/brand/dashboard" })}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-cream px-4 py-2 text-sm"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      }
    >
      <div className="rounded-3xl border border-border bg-cream p-6 shadow-elegant md:p-8">
        <Section title="Campaign basics">
          <Grid>
            <Input label="Campaign name" value={d.name} onChange={upd("name")} />
            <Input label="Goal" value={d.goals} onChange={upd("goals")} placeholder="Brand awareness, launch, advocacy…" />
            <Textarea label="Short description" value={d.description} onChange={upd("description")} />
          </Grid>
        </Section>

        <Section title="Audience & values">
          <Grid>
            <Input label="Target audience" value={d.audience} onChange={upd("audience")} placeholder="Women 18-34, urban, fitness-curious" />
            <Input label="Brand values (comma)" value={d.values} onChange={upd("values")} placeholder="Sustainability, equity, women health" />
            <Input label="Preferred sports (comma)" value={d.sports} onChange={upd("sports")} placeholder="Climbing, rowing, ultra-running" />
            <Input label="Geographic markets (comma)" value={d.geo} onChange={upd("geo")} placeholder="US, UK, EU" />
          </Grid>
        </Section>

        <Section title="Partnership scope">
          <Grid>
            <Select
              label="Partnership type"
              value={d.partnership_structure}
              onChange={upd("partnership_structure")}
              options={["Ambassador deal", "Single campaign", "Long-term partnership", "Content series", "Event appearance"]}
            />
            <Input label="Product category" value={d.product_category} onChange={upd("product_category")} placeholder="Apparel, wellness, nutrition…" />
            <Textarea label="Content deliverables" value={d.deliverables} onChange={upd("deliverables")} placeholder="3 IG posts, 1 reel, 1 event…" />
            <Input label="Timeline" value={d.timeline} onChange={upd("timeline")} placeholder="6 weeks · launches Q2" />
          </Grid>
        </Section>

        <Section title="Budget & notes">
          <Grid>
            <Input label="Budget min ($)" type="number" value={d.budget_min} onChange={upd("budget_min")} />
            <Input label="Budget max ($)" type="number" value={d.budget_max} onChange={upd("budget_max")} />
            <Textarea label="Internal notes" value={d.notes} onChange={upd("notes")} />
          </Grid>
        </Section>

        <div className="mt-8 flex flex-wrap items-center justify-end gap-3">
          <button
            onClick={() => launch("draft")}
            disabled={saving}
            className="rounded-full border border-plum px-5 py-2.5 text-sm font-medium text-plum hover:bg-plum/5"
          >
            Save as draft
          </button>
          <button
            onClick={() => launch("active")}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-gold px-6 py-2.5 text-sm font-medium text-plum-deep shadow-gold"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
            Launch & match
          </button>
        </div>
      </div>
    </DashboardShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 first:mt-0">
      <h3 className="font-display text-base text-plum-deep">{title}</h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>;
}
function Input({ label, type = "text", ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <input type={type} {...rest} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-plum focus:outline-none" />
    </label>
  );
}
function Textarea({ label, ...rest }: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block md:col-span-2">
      <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <textarea rows={3} {...rest} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-plum focus:outline-none" />
    </label>
  );
}
function Select({ label, options, ...rest }: { label: string; options: string[] } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <select {...rest} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-plum focus:outline-none">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
