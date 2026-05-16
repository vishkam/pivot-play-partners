import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, ArrowLeft, ArrowRight, Check, UploadCloud, X, FileText } from "lucide-react";
import { toast } from "sonner";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { OnboardingHeader } from "@/components/onboarding/OnboardingHeader";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { MATERIALS } from "@/lib/onboarding-options";
import { COUNTRIES } from "@/data/countries";
import { SPORTS } from "@/data/sports";
import { getDisciplinesForSport } from "@/data/sportDisciplines";

export const Route = createFileRoute("/athlete/onboarding")({
  component: () => (
    <RequireAuth roles={["athlete"]}>
      <AthleteOnboarding />
    </RequireAuth>
  ),
});

const STEPS = [
  "Personal",
  "Athletic",
  "Verification",
  "Values",
  "Gear & Brands",
  "Social",
  "Media kit",
  "Commercials",
] as const;

interface FormState {
  country: string;
  sport: string;
  discipline: string;
  professional_level: string;
  team_federation: string;
  rankings: string;
  achievements: string;
  certifications: string;
  values: string;
  causes: string;
  personality: string;
  story: string;
  favorite_brands: string;
  favorite_products: string;
  material_preferences: string;
  brands_apparel: string;
  brands_footwear: string;
  brands_nutrition: string;
  brands_recovery: string;
  brands_tech: string;
  brands_equipment: string;
  size_top: string;
  size_bottom: string;
  size_shoe: string;
  size_wetsuit: string;
  instagram: string;
  tiktok: string;
  youtube: string;
  linkedin: string;
  followers: string;
  partnership_types: string;
  pricing_min: string;
  pricing_max: string;
  availability: string;
}

const INITIAL: FormState = {
  country: "", sport: "", discipline: "", professional_level: "", team_federation: "",
  rankings: "", achievements: "", certifications: "", values: "", causes: "",
  personality: "", story: "",
  favorite_brands: "", favorite_products: "", material_preferences: "",
  brands_apparel: "", brands_footwear: "", brands_nutrition: "",
  brands_recovery: "", brands_tech: "", brands_equipment: "",
  size_top: "", size_bottom: "", size_shoe: "", size_wetsuit: "",
  instagram: "", tiktok: "", youtube: "", linkedin: "", followers: "",
  partnership_types: "", pricing_min: "", pricing_max: "", availability: "",
};

function AthleteOnboarding() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<FormState>(INITIAL);
  const [sportSuggestions, setSportSuggestions] = useState<string[]>(SPORTS);
  const [verificationFiles, setVerificationFiles] = useState<File[]>([]);

  const disciplineOptions = useMemo(() => getDisciplinesForSport(data.sport), [data.sport]);
  const selectedDisciplines = useMemo(
    () => data.discipline.split(",").map((s) => s.trim()).filter(Boolean),
    [data.discipline],
  );

  function toggleDiscipline(value: string) {
    const set = new Set(selectedDisciplines);
    if (set.has(value)) set.delete(value); else set.add(value);
    setData((d) => ({ ...d, discipline: Array.from(set).join(", ") }));
  }

  // Load existing draft + dynamic sport suggestions from other athletes
  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: ap }, { data: pf }, { data: others }] = await Promise.all([
        supabase.from("athlete_profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("profiles").select("country").eq("id", user.id).maybeSingle(),
        supabase.from("athlete_profiles").select("sport").not("sport", "is", null).limit(500),
      ]);

      const dbSports = Array.from(
        new Set((others ?? []).map((r) => r.sport).filter(Boolean) as string[]),
      );
      setSportSuggestions(Array.from(new Set([...dbSports, ...SPORTS])).sort());

      if (ap) {
        setData((d) => ({
          ...d,
          country: pf?.country ?? "",
          sport: ap.sport ?? "",
          discipline: ap.discipline ?? "",
          professional_level: ap.professional_level ?? "",
          team_federation: ap.team_federation ?? "",
          rankings: ap.rankings ?? "",
          achievements: ap.achievements ?? "",
          certifications: ap.certifications ?? "",
          values: (ap.values ?? []).join(", "),
          causes: (ap.causes ?? []).join(", "),
          story: ap.story ?? "",
          personality: ap.personality ?? "",
          favorite_brands: (ap.favorite_brands ?? []).join(", "),
          favorite_products: ap.favorite_products ?? "",
          material_preferences: (ap.material_preferences ?? []).join(", "),
          brands_apparel: ((ap.brand_categories as Record<string, string> | null)?.apparel) ?? "",
          brands_footwear: ((ap.brand_categories as Record<string, string> | null)?.footwear) ?? "",
          brands_nutrition: ((ap.brand_categories as Record<string, string> | null)?.nutrition) ?? "",
          brands_recovery: ((ap.brand_categories as Record<string, string> | null)?.recovery) ?? "",
          brands_tech: ((ap.brand_categories as Record<string, string> | null)?.tech) ?? "",
          brands_equipment: ((ap.brand_categories as Record<string, string> | null)?.equipment) ?? "",
          size_top: ((ap.sizing as Record<string, string> | null)?.top) ?? "",
          size_bottom: ((ap.sizing as Record<string, string> | null)?.bottom) ?? "",
          size_shoe: ((ap.sizing as Record<string, string> | null)?.shoe) ?? "",
          size_wetsuit: ((ap.sizing as Record<string, string> | null)?.wetsuit) ?? "",
          instagram: (ap.social_links as Record<string, string> | null)?.instagram ?? "",
          tiktok: (ap.social_links as Record<string, string> | null)?.tiktok ?? "",
          youtube: (ap.social_links as Record<string, string> | null)?.youtube ?? "",
          linkedin: (ap.social_links as Record<string, string> | null)?.linkedin ?? "",
          followers: String((ap.audience_demographics as Record<string, unknown> | null)?.followers ?? ""),
          partnership_types: (ap.partnership_types ?? []).join(", "),
          pricing_min: ap.pricing_min?.toString() ?? "",
          pricing_max: ap.pricing_max?.toString() ?? "",
          availability: ap.availability ?? "",
        }));
      }
    })();
  }, [user]);

  const completeness = Math.round(
    (Object.values(data).filter((v) => v && v.trim().length > 0).length / Object.keys(data).length) * 100,
  );

  async function persist(markComplete = false) {
    if (!user) return;
    setSaving(true);
    try {
      const splitList = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
      await supabase.from("profiles").update({ country: data.country }).eq("id", user.id);
      await supabase.from("athlete_profiles").update({
        sport: data.sport, discipline: data.discipline,
        professional_level: data.professional_level, team_federation: data.team_federation,
        rankings: data.rankings, achievements: data.achievements, certifications: data.certifications,
        values: splitList(data.values), causes: splitList(data.causes), story: data.story,
        personality: data.personality,
        favorite_brands: splitList(data.favorite_brands),
        favorite_products: data.favorite_products,
        material_preferences: splitList(data.material_preferences),
        brand_categories: {
          apparel: data.brands_apparel, footwear: data.brands_footwear,
          nutrition: data.brands_nutrition, recovery: data.brands_recovery,
          tech: data.brands_tech, equipment: data.brands_equipment,
        },
        sizing: {
          top: data.size_top, bottom: data.size_bottom,
          shoe: data.size_shoe, wetsuit: data.size_wetsuit,
        },
        social_links: {
          instagram: data.instagram, tiktok: data.tiktok,
          youtube: data.youtube, linkedin: data.linkedin,
        },
        audience_demographics: { followers: Number(data.followers) || 0 },
        partnership_types: splitList(data.partnership_types),
        pricing_min: data.pricing_min ? Number(data.pricing_min) : null,
        pricing_max: data.pricing_max ? Number(data.pricing_max) : null,
        availability: data.availability,
        profile_completeness: completeness,
      }).eq("user_id", user.id);

      if (markComplete) {
        await supabase.from("profiles").update({ onboarding_completed: true }).eq("id", user.id);
        await refreshProfile();
        toast.success("Profile complete — welcome to Allyance.");
        navigate({ to: "/athlete/dashboard" });
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

  const upd = <K extends keyof FormState>(k: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setData((d) => ({ ...d, [k]: e.target.value }));

  return (
    <div className="min-h-screen bg-secondary">
      <OnboardingHeader />
      <div className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-xs uppercase tracking-[0.3em] text-plum">Athlete onboarding</p>
        <h1 className="mt-2 font-display text-4xl text-foreground">Tell us your story</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The richer your profile, the better the matches. Save anytime.
        </p>

        <div className="mt-8">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Step {step + 1} of {STEPS.length} · {STEPS[step]}</span>
            <span>{completeness}% complete</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
            <div className="h-full bg-gradient-gold transition-all" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-border bg-cream p-8 shadow-elegant">
          {step === 0 && (
            <Grid>
              <Combobox
                label="Country"
                value={data.country}
                onChange={upd("country")}
                options={COUNTRIES}
                listId="country-options"
                placeholder="Start typing — United States, Kenya, Japan…"
              />
              <Textarea label="Your story" value={data.story} onChange={upd("story")} placeholder="What drives you? What's your journey?" />
            </Grid>
          )}
          {step === 1 && (
            <Grid>
              <Combobox
                label="Sport"
                value={data.sport}
                onChange={(e) => setData((d) => ({ ...d, sport: e.target.value, discipline: "" }))}
                options={sportSuggestions}
                listId="sport-options"
                placeholder="Start typing — e.g. 'swi' → Swimming"
                hint="Pick from the list to unlock discipline suggestions."
              />
              <div className="md:col-span-2">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Discipline{disciplineOptions.length > 0 && " — pick all that apply"}
                </span>
                {disciplineOptions.length > 0 ? (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {disciplineOptions.map((opt) => {
                        const active = selectedDisciplines.includes(opt);
                        return (
                          <button
                            type="button"
                            key={opt}
                            onClick={() => toggleDiscipline(opt)}
                            className={`rounded-full border px-3.5 py-1.5 text-xs transition ${
                              active
                                ? "border-plum bg-plum text-cream shadow-sm"
                                : "border-border bg-background text-foreground hover:border-plum/60"
                            }`}
                          >
                            {active && <Check className="mr-1 inline h-3 w-3" />}
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    <input
                      value={data.discipline}
                      onChange={upd("discipline")}
                      placeholder="Or add a discipline not listed (comma-separated)"
                      className="mt-3 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-plum focus:outline-none"
                    />
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      Multiple disciplines welcome — many athletes compete across events.
                    </p>
                  </>
                ) : (
                  <>
                    <input
                      value={data.discipline}
                      onChange={upd("discipline")}
                      placeholder={data.sport ? "e.g. 400m hurdles, sprint relay" : "Pick a sport first to see suggestions"}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-plum focus:outline-none"
                    />
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      No preset disciplines for this sport yet — list your events separated by commas.
                    </p>
                  </>
                )}
              </div>
              <Select label="Professional level" value={data.professional_level} onChange={upd("professional_level")}
                options={["Amateur", "Semi-pro", "Professional", "National team", "Olympic / World"]} />
              <Input label="Team / Federation" value={data.team_federation} onChange={upd("team_federation")} placeholder="USA Swimming, FC Barcelona Femení…" />
              <Textarea label="Rankings" value={data.rankings} onChange={upd("rankings")} placeholder="World #14, National #2..." />
              <Textarea label="Achievements" value={data.achievements} onChange={upd("achievements")} placeholder="Olympic finalist 2024, NCAA Champion..." />
            </Grid>
          )}
          {step === 2 && (
            <Grid>
              <Textarea
                label="Certifications & credentials"
                value={data.certifications}
                onChange={upd("certifications")}
                placeholder="USATF certified, federation IDs, governing-body license #s…"
              />
              <div className="md:col-span-2">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Verification documents
                </span>
                <label
                  htmlFor="verification-upload"
                  className="group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-plum/30 bg-gradient-to-b from-plum/5 to-cream p-8 text-center transition hover:border-plum hover:bg-plum/10"
                >
                  <div className="rounded-full bg-plum/10 p-3 text-plum transition group-hover:bg-plum group-hover:text-cream">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  <p className="font-display text-base text-foreground">Upload certification or verification documents</p>
                  <p className="text-xs text-muted-foreground">
                    Drag &amp; drop or click to select. Reviewed privately by our verification team.
                  </p>
                  <span className="mt-1 inline-flex items-center gap-2 rounded-full border border-plum/30 bg-cream px-4 py-1.5 text-xs font-medium text-plum">
                    Choose files
                  </span>
                  <input
                    id="verification-upload"
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="sr-only"
                    onChange={(e) => {
                      const incoming = Array.from(e.target.files ?? []);
                      const valid = incoming.filter((f) => f.size <= 10 * 1024 * 1024);
                      if (valid.length < incoming.length) {
                        toast.error("Some files exceeded 10MB and were skipped.");
                      }
                      setVerificationFiles((prev) => [...prev, ...valid]);
                      e.target.value = "";
                    }}
                  />
                </label>
                <p className="mt-2 text-xs text-muted-foreground">
                  Accepted formats: JPG, PNG, PDF. You may upload multiple files. Maximum file size: 10MB per file.
                </p>
                {verificationFiles.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {verificationFiles.map((f, i) => (
                      <li
                        key={`${f.name}-${i}`}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 py-2 text-sm"
                      >
                        <span className="flex min-w-0 items-center gap-2 text-foreground">
                          <FileText className="h-4 w-4 shrink-0 text-plum" />
                          <span className="truncate">{f.name}</span>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {(f.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setVerificationFiles((prev) => prev.filter((_, idx) => idx !== i))}
                          className="rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                          aria-label={`Remove ${f.name}`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Grid>
          )}
          {step === 3 && (
            <Grid>
              <Input label="Your values (comma-separated)" value={data.values} onChange={upd("values")} placeholder="Sustainability, mental health, equity" />
              <Input label="Causes you champion" value={data.causes} onChange={upd("causes")} placeholder="Title IX, climate, youth access" />
              <Textarea
                label="Personality — how you show up"
                value={data.personality}
                onChange={upd("personality")}
                placeholder="Bold, analytical, playful, quietly competitive… how a brand should expect to work with you."
              />
            </Grid>
          )}
          {step === 4 && (
            <Grid>
              <div className="md:col-span-2 rounded-2xl border border-plum/15 bg-plum/5 p-5 text-sm text-foreground/80">
                <p className="font-display text-base text-foreground">Why we ask</p>
                <p className="mt-1 text-muted-foreground">
                  The brands and gear you already trust — plus the materials that affect your performance and your
                  sizing — make our matches dramatically more relevant. Brands ship product fit-first, not guess-first.
                </p>
              </div>
              <Input
                label="Brands you love overall (comma-separated)"
                value={data.favorite_brands}
                onChange={upd("favorite_brands")}
                placeholder="Speedo, On Running, Patagonia, Oakley"
              />
              <Textarea
                label="Favorite products / gear you currently use"
                value={data.favorite_products}
                onChange={upd("favorite_products")}
                placeholder="Arena Carbon Air2 suit, Nike Vaporfly 3, Hoka Speedgoat 5…"
              />
              <Combobox
                label="Materials & tech that matter to your performance"
                value={data.material_preferences}
                onChange={upd("material_preferences")}
                options={MATERIALS}
                listId="material-options"
                placeholder="PBT, carbon plate, ECONYL®, Merino wool…"
                hint="Comma-separated. Start typing to see suggestions."
              />

              <div className="md:col-span-2 mt-2">
                <p className="font-display text-base text-foreground">Favorite brands by product category</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  We match brands to the exact product fit you trust — not just the logo.
                </p>
              </div>
              <Input label="Apparel" value={data.brands_apparel} onChange={upd("brands_apparel")} placeholder="Lululemon, Patagonia" />
              <Input label="Footwear" value={data.brands_footwear} onChange={upd("brands_footwear")} placeholder="Nike, Hoka" />
              <Input label="Nutrition" value={data.brands_nutrition} onChange={upd("brands_nutrition")} placeholder="Maurten, Skratch" />
              <Input label="Recovery" value={data.brands_recovery} onChange={upd("brands_recovery")} placeholder="Therabody, Hyperice" />
              <Input label="Tech & wearables" value={data.brands_tech} onChange={upd("brands_tech")} placeholder="Garmin, Whoop, Oura" />
              <Input label="Sport-specific equipment" value={data.brands_equipment} onChange={upd("brands_equipment")} placeholder="Speedo, Wilson, Specialized…" />

              <div className="md:col-span-2 mt-2">
                <p className="font-display text-base text-foreground">Sizing</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Used only to ship product samples. Never shared publicly.
                </p>
              </div>
              <Input label="Top size" value={data.size_top} onChange={upd("size_top")} placeholder="S / M / 38 / 8" />
              <Input label="Bottom size" value={data.size_bottom} onChange={upd("size_bottom")} placeholder="28 / M / 6" />
              <Input label="Shoe size" value={data.size_shoe} onChange={upd("size_shoe")} placeholder="US 8 / EU 39" />
              <Input label="Wetsuit / specialty" value={data.size_wetsuit} onChange={upd("size_wetsuit")} placeholder="MT, women's L…" />
            </Grid>
          )}
          {step === 5 && (
            <Grid>
              <Input label="Instagram" value={data.instagram} onChange={upd("instagram")} placeholder="@yourhandle" />
              <Input label="TikTok" value={data.tiktok} onChange={upd("tiktok")} placeholder="@yourhandle" />
              <Input label="YouTube" value={data.youtube} onChange={upd("youtube")} placeholder="channel URL" />
              <Input label="LinkedIn" value={data.linkedin} onChange={upd("linkedin")} placeholder="linkedin.com/in/you" />
              <Input label="Total followers (all platforms)" type="number" value={data.followers} onChange={upd("followers")} placeholder="125000" />
            </Grid>
          )}
          {step === 6 && (
            <Grid>
              <div className="rounded-xl border border-dashed border-border bg-background p-6 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Media kit assets</p>
                <p className="mt-1">Upload photos, highlight reels and press clippings. We'll generate your shareable media kit automatically.</p>
              </div>
            </Grid>
          )}
          {step === 7 && (
            <Grid>
              <Input label="Partnership types (comma-separated)" value={data.partnership_types} onChange={upd("partnership_types")}
                placeholder="Sponsorship, ambassadorship, content, appearance" />
              <Input label="Minimum deal ($)" type="number" value={data.pricing_min} onChange={upd("pricing_min")} placeholder="2500" />
              <Input label="Maximum deal ($)" type="number" value={data.pricing_max} onChange={upd("pricing_max")} placeholder="50000" />
              <Select label="Availability" value={data.availability} onChange={upd("availability")}
                options={["Open to opportunities", "Selectively reviewing", "Booked but listening", "Not currently available"]} />
            </Grid>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="flex items-center gap-2 rounded-full border border-border bg-cream px-5 py-2.5 text-sm disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => persist(false)}
              disabled={saving}
              className="rounded-full border border-plum px-5 py-2.5 text-sm font-medium text-plum hover:bg-plum/5"
            >
              Save progress
            </button>
            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                className="flex items-center gap-2 rounded-full bg-plum-deep px-5 py-2.5 text-sm font-medium text-cream"
              >
                Next <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => persist(true)}
                disabled={saving}
                className="flex items-center gap-2 rounded-full bg-gradient-gold px-5 py-2.5 text-sm font-medium text-plum-deep shadow-gold"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Finish & enter Allyance
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

function Combobox({
  label, value, onChange, options, listId, placeholder, hint,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  options: string[];
  listId: string;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <label className="block md:col-span-2">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        type="text"
        value={value}
        onChange={onChange}
        list={listId}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-plum focus:outline-none"
      />
      <datalist id={listId}>
        {options.map((o) => <option key={o} value={o} />)}
      </datalist>
      {hint && <span className="mt-1.5 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}
