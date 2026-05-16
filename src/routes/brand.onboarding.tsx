import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { OnboardingHeader } from "@/components/onboarding/OnboardingHeader";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/brand/onboarding")({
  component: () => (
    <RequireAuth roles={["brand"]}>
      <BrandOnboarding />
    </RequireAuth>
  ),
});

const STEPS = ["Company", "Values", "Audience", "Campaign"] as const;

interface FormState {
  brand_name: string; website: string; industry: string; revenue_stage: string;
  contact_role: string; mission: string; values: string; esg_priorities: string;
  positioning: string; audience_age: string; audience_gender: string; audience_geo: string;
  campaign_name: string; campaign_goals: string; campaign_budget_min: string; campaign_budget_max: string;
  preferred_athletes: string; sports: string;
}
const INITIAL: FormState = {
  brand_name: "", website: "", industry: "", revenue_stage: "", contact_role: "",
  mission: "", values: "", esg_priorities: "", positioning: "",
  audience_age: "", audience_gender: "", audience_geo: "",
  campaign_name: "", campaign_goals: "", campaign_budget_min: "", campaign_budget_max: "",
  preferred_athletes: "", sports: "",
};

function BrandOnboarding() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<FormState>(INITIAL);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: bp } = await supabase.from("brand_profiles").select("*").eq("user_id", user.id).maybeSingle();
      if (bp) {
        const d = bp.consumer_demographics as Record<string, string> | null;
        setData((s) => ({
          ...s,
          brand_name: bp.brand_name ?? "", website: bp.website ?? "",
          industry: bp.industry ?? "", revenue_stage: bp.revenue_stage ?? "",
          contact_role: bp.contact_role ?? "", mission: bp.mission ?? "",
          values: (bp.values ?? []).join(", "),
          esg_priorities: (bp.esg_priorities ?? []).join(", "),
          positioning: bp.positioning ?? "",
          audience_age: d?.age ?? "", audience_gender: d?.gender ?? "", audience_geo: d?.geo ?? "",
        }));
      }
    })();
  }, [user]);

  const upd = <K extends keyof FormState>(k: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setData((d) => ({ ...d, [k]: e.target.value }));

  async function persist(markComplete = false) {
    if (!user) return;
    setSaving(true);
    try {
      const splitList = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
      await supabase.from("brand_profiles").update({
        brand_name: data.brand_name, website: data.website, industry: data.industry,
        revenue_stage: data.revenue_stage, contact_role: data.contact_role,
        mission: data.mission, positioning: data.positioning,
        values: splitList(data.values), esg_priorities: splitList(data.esg_priorities),
        consumer_demographics: {
          age: data.audience_age, gender: data.audience_gender, geo: data.audience_geo,
        },
      }).eq("user_id", user.id);

      if (markComplete) {
        if (data.campaign_name) {
          await supabase.from("campaigns").insert({
            brand_id: user.id, name: data.campaign_name, goals: data.campaign_goals,
            budget_min: data.campaign_budget_min ? Number(data.campaign_budget_min) : null,
            budget_max: data.campaign_budget_max ? Number(data.campaign_budget_max) : null,
            preferred_athlete_types: splitList(data.preferred_athletes),
            sports: splitList(data.sports),
            status: "draft",
          });
        }
        await supabase.from("profiles").update({ onboarding_completed: true }).eq("id", user.id);
        await refreshProfile();
        toast.success("Brand workspace ready.");
        navigate({ to: "/brand/dashboard" });
      } else {
        toast.success("Progress saved");
      }
    } catch (e) {
      toast.error("Couldn't save — try again.");
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-secondary">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-xs uppercase tracking-[0.3em] text-plum">Brand onboarding</p>
        <h1 className="mt-2 font-display text-4xl text-foreground">Build your brand workspace</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Define who you are and what you want — our match engine does the rest.
        </p>

        <div className="mt-8">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Step {step + 1} of {STEPS.length} · {STEPS[step]}</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
            <div className="h-full bg-gradient-gold transition-all" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-border bg-cream p-8 shadow-elegant">
          {step === 0 && (
            <Grid>
              <Input label="Brand name" value={data.brand_name} onChange={upd("brand_name")} />
              <Input label="Website" value={data.website} onChange={upd("website")} placeholder="https://" />
              <Input label="Industry" value={data.industry} onChange={upd("industry")} placeholder="Wellness, apparel, tech…" />
              <Select label="Revenue stage" value={data.revenue_stage} onChange={upd("revenue_stage")}
                options={["Pre-revenue", "<$1M", "$1M–$10M", "$10M–$50M", "$50M–$250M", "$250M+"]} />
              <Input label="Your role" value={data.contact_role} onChange={upd("contact_role")} placeholder="Head of marketing" />
              <Textarea label="Mission statement" value={data.mission} onChange={upd("mission")} />
            </Grid>
          )}
          {step === 1 && (
            <Grid>
              <Input label="Brand values (comma-separated)" value={data.values} onChange={upd("values")} placeholder="Inclusion, sustainability, performance" />
              <Input label="ESG priorities" value={data.esg_priorities} onChange={upd("esg_priorities")} placeholder="Climate, equity, transparency" />
              <Textarea label="Positioning" value={data.positioning} onChange={upd("positioning")} placeholder="Where you sit in market & culture" />
            </Grid>
          )}
          {step === 2 && (
            <Grid>
              <Input label="Audience age range" value={data.audience_age} onChange={upd("audience_age")} placeholder="18–34" />
              <Input label="Gender skew" value={data.audience_gender} onChange={upd("audience_gender")} placeholder="68% women" />
              <Input label="Geographic focus" value={data.audience_geo} onChange={upd("audience_geo")} placeholder="US, UK, AU" />
            </Grid>
          )}
          {step === 3 && (
            <Grid>
              <Input label="Campaign name" value={data.campaign_name} onChange={upd("campaign_name")} placeholder="Spring 2026 wellness" />
              <Select label="Sports of interest" value={data.sports} onChange={upd("sports")}
                options={["Multi-sport", "Track & field", "Soccer", "Tennis", "Basketball", "Climbing", "Surf", "Cycling"]} />
              <Input label="Budget min ($)" type="number" value={data.campaign_budget_min} onChange={upd("campaign_budget_min")} />
              <Input label="Budget max ($)" type="number" value={data.campaign_budget_max} onChange={upd("campaign_budget_max")} />
              <Input label="Preferred athlete types" value={data.preferred_athletes} onChange={upd("preferred_athletes")} placeholder="Rising stars, advocates, Olympians" />
              <Textarea label="Campaign goals" value={data.campaign_goals} onChange={upd("campaign_goals")} />
            </Grid>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="flex items-center gap-2 rounded-full border border-border bg-cream px-5 py-2.5 text-sm disabled:opacity-40">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => persist(false)} disabled={saving}
              className="rounded-full border border-plum px-5 py-2.5 text-sm font-medium text-plum hover:bg-plum/5">
              Save progress
            </button>
            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                className="flex items-center gap-2 rounded-full bg-plum-deep px-5 py-2.5 text-sm font-medium text-cream">
                Next <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button onClick={() => persist(true)} disabled={saving}
                className="flex items-center gap-2 rounded-full bg-gradient-gold px-5 py-2.5 text-sm font-medium text-plum-deep shadow-gold">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Launch workspace
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-5 md:grid-cols-2">{children}</div>;
}
function Input({ label, type = "text", ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <input type={type} {...rest}
        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-plum focus:outline-none" />
    </label>
  );
}
function Textarea({ label, ...rest }: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block md:col-span-2">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <textarea rows={4} {...rest}
        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-plum focus:outline-none" />
    </label>
  );
}
function Select({ label, options, ...rest }: { label: string; options: string[] } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <select {...rest}
        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-plum focus:outline-none">
        <option value="">Select…</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
