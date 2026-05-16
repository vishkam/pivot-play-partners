import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Loader2, ArrowLeft, Rocket, Sparkles, Target, Users, Wallet, FileText } from "lucide-react";
import { toast } from "sonner";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useAuth } from "@/hooks/use-auth";
import { submitCampaignLaunch } from "@/lib/campaign-launch.functions";

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
  const submitCampaign = useServerFn(submitCampaignLaunch);
  const [d, setD] = useState<F>(INIT);
  const [saving, setSaving] = useState(false);
  const [matching, setMatching] = useState(false);
  const [missingFields, setMissingFields] = useState<Set<keyof F>>(new Set());
  const upd = <K extends keyof F>(k: K) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setD((s) => ({ ...s, [k]: e.target.value }));

  const requiredForLaunch: Array<keyof F> = [
    "name", "goals", "description", "audience", "values", "sports", "geo",
    "partnership_structure", "product_category", "budget_min", "budget_max", "timeline",
  ];

  function validate(mode: "draft" | "active") {
    const required = mode === "draft" ? (["name"] as Array<keyof F>) : requiredForLaunch;
    const missing = required.filter((key) => !d[key].trim());
    const next = new Set(missing);
    setMissingFields(next);
    if (missing.length) {
      toast.error("Campaign could not be launched. Please check required fields.");
      console.warn("[Pegasus Launch] client validation failed", { mode, missing });
      return false;
    }
    const min = Number(d.budget_min);
    const max = Number(d.budget_max);
    if (mode === "active" && (!Number.isFinite(min) || !Number.isFinite(max) || min > max)) {
      setMissingFields(new Set(["budget_min", "budget_max"]));
      toast.error("Campaign could not be launched. Please check required fields.");
      console.warn("[Pegasus Launch] client budget validation failed", { min: d.budget_min, max: d.budget_max });
      return false;
    }
    return true;
  }

  async function launch(status: "draft" | "active") {
    if (!user) return;
    if (saving) return;
    if (!validate(status)) return;
    setSaving(true);
    setMatching(status === "active");
    console.log("[Pegasus Launch] submitting", { status, fields: d });
    try {
      const result = await submitCampaign({ data: { ...d, mode: status === "active" ? "launch" : "draft" } });
      console.log("[Pegasus Launch] completed", result);
      if (status === "draft") {
        toast.success("Campaign draft saved");
        navigate({ to: "/brand/pipeline" });
        return;
      }
      await new Promise((r) => setTimeout(r, 1400));
      if (result.matchingError) toast.warning(result.matchingError);
      else toast.success(`Campaign saved. ${result.matchCount} athlete matches generated.`);
      navigate({ to: "/brand/campaigns/$id", params: { id: result.campaignId } });
    } catch (e: unknown) {
      console.error("[Pegasus Launch] submission failed", e);
      const message = e instanceof Error ? e.message : "Campaign could not be launched. Please check required fields.";
      toast.error(message.includes("Database error") ? "Database error — campaign not saved." : message);
    } finally {
      setSaving(false);
      setMatching(false);
    }
  }

  return (
    <DashboardShell
      title="New campaign"
      subtitle="Define the brief. Pegasus AI will surface aligned women athletes instantly."
      actions={
        <button
          onClick={() => navigate({ to: "/brand/dashboard" })}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-cream px-4 py-2 text-sm text-plum-deep hover:bg-secondary"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      }
    >
      <div className="space-y-5">
        <Section icon={<FileText className="h-4 w-4" />} title="Campaign basics" hint="What you're launching and why.">
          <Grid>
            <Input label="Campaign name" required value={d.name} onChange={upd("name")} placeholder="Spring Recovery Launch" />
            <Input label="Goal" required value={d.goals} onChange={upd("goals")} placeholder="Brand awareness, launch, advocacy…" />
            <Textarea label="Short description" value={d.description} onChange={upd("description")} placeholder="One sentence your team and athletes can both rally around." />
          </Grid>
        </Section>

        <Section icon={<Users className="h-4 w-4" />} title="Audience & values" hint="Pegasus matches on values overlap first.">
          <Grid>
            <Input label="Target audience" value={d.audience} onChange={upd("audience")} placeholder="Women 18–34, urban, fitness-curious" />
            <Input label="Brand values (comma)" value={d.values} onChange={upd("values")} placeholder="Sustainability, equity, women's health" />
            <Input label="Preferred sports (comma)" value={d.sports} onChange={upd("sports")} placeholder="Climbing, rowing, ultra-running" />
            <Input label="Geographic markets (comma)" value={d.geo} onChange={upd("geo")} placeholder="US, UK, EU" />
          </Grid>
        </Section>

        <Section icon={<Target className="h-4 w-4" />} title="Partnership scope" hint="Set the deal shape — we'll generate the legal next step.">
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

        <Section icon={<Wallet className="h-4 w-4" />} title="Budget & notes" hint="Used to score affordability and shortlist depth.">
          <Grid>
            <Input label="Budget min ($)" required type="number" value={d.budget_min} onChange={upd("budget_min")} placeholder="25000" />
            <Input label="Budget max ($)" required type="number" value={d.budget_max} onChange={upd("budget_max")} placeholder="120000" />
            <Textarea label="Internal notes" value={d.notes} onChange={upd("notes")} placeholder="Anything the AI team should know — exclusions, must-haves, references." />
          </Grid>
        </Section>

        <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-cream/95 p-4 shadow-elegant backdrop-blur">
          <p className="text-xs text-muted-foreground">
            <Sparkles className="mr-1 inline h-3.5 w-3.5 text-[--gold]" />
            Launching runs our AI matching engine across every verified athlete.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => launch("draft")}
              disabled={saving}
              className="rounded-full border border-plum px-5 py-2.5 text-sm font-medium text-plum hover:bg-secondary"
            >
              Save as draft
            </button>
            <button
              onClick={() => launch("active")}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-hero px-6 py-2.5 text-sm font-semibold text-cream shadow-elegant hover:opacity-95"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
              Launch & match
            </button>
          </div>
        </div>
      </div>

      {matching && <MatchingOverlay />}
    </DashboardShell>
  );
}

function MatchingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-plum-deep/70 backdrop-blur-sm">
      <div className="mx-4 max-w-md rounded-3xl border border-border bg-cream p-8 text-center shadow-elegant">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-hero shadow-gold">
          <Sparkles className="h-6 w-6 text-cream animate-pulse" />
        </div>
        <h3 className="mt-5 font-display text-2xl text-plum-deep">Pegasus AI Managers are working…</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Scanning verified women athletes for values alignment, audience fit, and budget compatibility.
        </p>
        <div className="mt-5 space-y-2 text-left text-xs text-muted-foreground">
          <Step label="Reading your brief" />
          <Step label="Scoring 6 weighted signals" />
          <Step label="Ranking your strongest matches" />
        </div>
      </div>
    </div>
  );
}
function Step({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[--gold]" />
      <span>{label}</span>
    </div>
  );
}

function Section({ icon, title, hint, children }: { icon: React.ReactNode; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-border bg-cream p-6 shadow-sm md:p-8">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-plum-deep">{icon}</span>
        <div>
          <h3 className="font-display text-lg text-plum-deep">{title}</h3>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>;
}
function Input({ label, required, type = "text", ...rest }: { label: string; required?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label} {required && <span className="text-[--gold]">*</span>}
      </span>
      <input
        type={type}
        {...rest}
        className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm shadow-sm transition focus:border-plum focus:outline-none focus:ring-2 focus:ring-plum/20"
      />
    </label>
  );
}
function Textarea({ label, ...rest }: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block md:col-span-2">
      <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <textarea
        rows={3}
        {...rest}
        className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm shadow-sm transition focus:border-plum focus:outline-none focus:ring-2 focus:ring-plum/20"
      />
    </label>
  );
}
function Select({ label, options, ...rest }: { label: string; options: string[] } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <select
        {...rest}
        className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm shadow-sm transition focus:border-plum focus:outline-none focus:ring-2 focus:ring-plum/20"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
