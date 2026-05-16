import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Trophy, Building2, ShieldCheck, Loader2, ArrowLeft, Sparkles,
  Brain, FileSignature, TrendingUp, Scale, Users, Megaphone,
  Wallet, BarChart3, CheckCircle2, ArrowRight, Play, Star,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { ensureDemoUser, type DemoRole } from "@/lib/demo.functions";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Pegasus Demo Hub — Explore the platform in seconds" },
      { name: "description", content: "One-click access to the Athlete, Brand and Admin dashboards. Experience Pegasus, the AI-powered sponsorship operating system for women's sports." },
      { property: "og:title", content: "Pegasus Demo Hub — Explore the platform in seconds" },
      { property: "og:description", content: "Experience the AI-powered sponsorship operating system for women athletes. Athlete · Brand · Admin demos." },
      { property: "og:url", content: "https://pivot-play-partners.lovable.app/demo" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "canonical", href: "https://pivot-play-partners.lovable.app/demo" },
    ],
  }),
  component: DemoPage,
});

const ROLES: {
  role: DemoRole; icon: typeof Trophy; title: string; persona: string;
  tagline: string; bullets: string[]; dest: string; accent: string;
  sampleStats: { label: string; value: string }[];
}[] = [
  {
    role: "athlete",
    icon: Trophy,
    title: "Athlete demo",
    persona: "Maya Rivera",
    tagline: "Pro Swimmer · USA · Verified",
    bullets: ["AI brand matches", "Proposals + contracts", "Earnings + rate card", "Growth strategy"],
    dest: "/athlete/dashboard",
    accent: "from-gold/40 via-gold/10 to-transparent",
    sampleStats: [
      { label: "Match score", value: "94%" },
      { label: "Active deals", value: "3" },
      { label: "YTD earnings", value: "$28k" },
    ],
  },
  {
    role: "brand",
    icon: Building2,
    title: "Brand demo",
    persona: "Lumen Wellness",
    tagline: "Premium recovery · $5–25M ARR",
    bullets: ["Discover athletes", "Run campaigns", "Pipeline + contracts", "AI strategy"],
    dest: "/brand/dashboard",
    accent: "from-plum/50 via-plum/15 to-transparent",
    sampleStats: [
      { label: "Active campaigns", value: "4" },
      { label: "Matched athletes", value: "127" },
      { label: "Budget deployed", value: "$210k" },
    ],
  },
  {
    role: "admin",
    icon: ShieldCheck,
    title: "Admin demo",
    persona: "Pegasus operator",
    tagline: "Marketplace · trust · revenue",
    bullets: ["Verification queue", "Revenue + GMV", "Trust & disputes", "Marketplace health"],
    dest: "/admin/dashboard",
    accent: "from-cream/30 via-cream/10 to-transparent",
    sampleStats: [
      { label: "Athletes", value: "12.4k" },
      { label: "GMV", value: "$4.2M" },
      { label: "Trust score", value: "98%" },
    ],
  },
];

const JOURNEYS: { title: string; role: DemoRole; steps: string[]; icon: typeof Trophy }[] = [
  { title: "Athlete journey", role: "athlete", icon: Trophy,
    steps: ["Landing", "Profile", "AI match", "Proposal", "Contract", "Earnings"] },
  { title: "Brand journey", role: "brand", icon: Building2,
    steps: ["Campaign", "Discover", "AI proposal", "Contract", "Launch", "ROI"] },
  { title: "Admin journey", role: "admin", icon: ShieldCheck,
    steps: ["Verify", "Marketplace", "Trust", "Revenue"] },
];

const AI_FEATURES = [
  { icon: Brain, title: "AI Matching", body: "Multi-vector scoring across values, audience, sport, budget and brand fit." },
  { icon: Sparkles, title: "AI Proposals", body: "Generates a tailored, on-brand pitch in seconds with terms ready to sign." },
  { icon: Scale, title: "AI Legal Support", body: "Drafts contracts with usage rights, exclusivity, escrow and ethical clauses." },
  { icon: TrendingUp, title: "Growth Strategy", body: "Post-deal playbook: content cadence, audience growth and rate-card increases." },
];

const METRICS = [
  { label: "Verified athletes", value: "12,400+" },
  { label: "Active brands", value: "640" },
  { label: "Deals closed", value: "1,860" },
  { label: "GMV facilitated", value: "$4.2M" },
  { label: "Match satisfaction", value: "94%" },
  { label: "Avg athlete earnings", value: "$11,300" },
];

function DemoPage() {
  const ensure = useServerFn(ensureDemoUser);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState<DemoRole | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function enter(role: DemoRole, dest: string) {
    setBusy(role);
    setError(null);
    try {
      const creds = await ensure({ data: { role } });
      const { error: signErr } = await signIn(creds.email, creds.password);
      if (signErr) throw new Error(signErr);
      navigate({ to: dest });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not enter demo");
      setBusy(null);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-hero text-cream grain">
      {/* Top bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Link to="/" className="inline-flex items-center gap-2 text-cream/70 hover:text-gold">
          <ArrowLeft className="h-4 w-4" /> Pegasus
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <a href="#roles" className="text-cream/70 hover:text-gold">Roles</a>
          <a href="#flows" className="hidden text-cream/70 hover:text-gold sm:inline">Flows</a>
          <a href="#metrics" className="hidden text-cream/70 hover:text-gold sm:inline">Metrics</a>
          <Link to="/auth" search={{ mode: "signin", redirect: "/dashboard" } as never}
            className="text-cream/70 hover:text-gold">Sign in →</Link>
        </div>
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pb-10 pt-6 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/5 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-gold">
            <Play className="h-3 w-3" /> Live sandbox · no signup
          </span>
          <h1 className="mt-6 font-display text-5xl leading-[1.05] text-balance sm:text-6xl lg:text-7xl">
            Explore <span className="italic text-gold">Pegasus</span> in action.
          </h1>
          <p className="mt-5 text-lg text-cream/75">
            Experience the AI-powered sponsorship operating system for women athletes —
            matches, proposals, contracts and earnings, already in flight.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {ROLES.map((r) => (
              <button
                key={r.role}
                onClick={() => enter(r.role, r.dest)}
                disabled={busy !== null}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-gold px-5 py-2.5 text-sm font-medium text-plum-deep shadow-gold transition-transform hover:scale-[1.03] disabled:opacity-60"
              >
                {busy === r.role ? <Loader2 className="h-4 w-4 animate-spin" /> : <r.icon className="h-4 w-4" />}
                Explore {r.role} dashboard
              </button>
            ))}
          </div>
          {error && (
            <p className="mx-auto mt-5 max-w-md rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          )}
        </div>
      </section>

      {/* Role overview cards */}
      <section id="roles" className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
        <SectionHead eyebrow="Pick a role" title="Three personas. One operating system." />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {ROLES.map(({ role, icon: Icon, title, persona, tagline, bullets, dest, accent, sampleStats }) => (
            <div key={role} className="group relative flex flex-col overflow-hidden rounded-3xl border border-cream/15 bg-plum-deep/40 p-7 transition-all hover:border-gold/60 hover:shadow-elegant">
              <div className={`pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br ${accent} blur-3xl`} />
              <div className="relative flex flex-1 flex-col">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-gold text-plum-deep shadow-gold">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 font-display text-2xl text-cream">{title}</h3>
                <p className="mt-1 text-sm text-gold">{persona}</p>
                <p className="text-xs uppercase tracking-widest text-cream/50">{tagline}</p>

                <ul className="mt-5 space-y-2 text-sm text-cream/75">
                  {bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-gold" /> {b}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 grid grid-cols-3 gap-3 rounded-2xl border border-cream/10 bg-plum-deep/40 p-4">
                  {sampleStats.map((s) => (
                    <div key={s.label}>
                      <div className="font-display text-lg text-gold">{s.value}</div>
                      <div className="text-[10px] uppercase tracking-widest text-cream/50">{s.label}</div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => enter(role, dest)}
                  disabled={busy !== null}
                  className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-gold px-5 py-2.5 text-sm font-medium text-plum-deep shadow-gold transition-transform hover:scale-[1.02] disabled:opacity-60"
                >
                  {busy === role ? <><Loader2 className="h-4 w-4 animate-spin" /> Entering…</> : <>Enter dashboard <ArrowRight className="h-4 w-4" /></>}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Guided flows */}
      <section id="flows" className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
        <SectionHead eyebrow="Guided product flows" title="See how a deal actually closes on Pegasus." />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {JOURNEYS.map(({ title, role, steps, icon: Icon }) => (
            <div key={title} className="rounded-3xl border border-cream/15 bg-plum-deep/40 p-7">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="font-display text-xl text-cream">{title}</h3>
              </div>
              <ol className="mt-6 space-y-3">
                {steps.map((s, i) => (
                  <li key={s} className="flex items-center gap-3 text-sm">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-gold/40 bg-gold/5 text-xs font-semibold text-gold">{i + 1}</span>
                    <span className="text-cream/85">{s}</span>
                    {i < steps.length - 1 && <span className="ml-auto text-cream/30">→</span>}
                  </li>
                ))}
              </ol>
              <button
                onClick={() => enter(role, ROLES.find((r) => r.role === role)!.dest)}
                disabled={busy !== null}
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-gold hover:underline"
              >
                Walk through this flow <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Metrics */}
      <section id="metrics" className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
        <SectionHead eyebrow="Live platform metrics" title="A marketplace that's already moving." />
        <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-cream/15 bg-cream/10 md:grid-cols-3 lg:grid-cols-6">
          {METRICS.map((m) => (
            <div key={m.label} className="bg-plum-deep p-6 text-center">
              <div className="font-display text-3xl text-gold">{m.value}</div>
              <div className="mt-1 text-[10px] uppercase tracking-widest text-cream/55">{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* AI features */}
      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
        <SectionHead eyebrow="AI infrastructure" title="Your 24/7 sponsorship team — built in." />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {AI_FEATURES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-cream/15 bg-plum-deep/50 p-6">
              <Icon className="h-6 w-6 text-gold" />
              <h4 className="mt-4 font-display text-lg text-cream">{title}</h4>
              <p className="mt-2 text-sm leading-relaxed text-cream/70">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-6 lg:px-10">
        <div className="rounded-3xl border border-gold/30 bg-gradient-to-r from-plum-deep via-plum to-plum-deep p-10 text-center shadow-elegant">
          <Star className="mx-auto h-6 w-6 text-gold" />
          <h3 className="mt-4 font-display text-3xl text-cream sm:text-4xl">
            Ready to walk through the full product?
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-cream/70">
            Pick a role — every dashboard is pre-seeded with realistic matches, messages and deals so you can experience the platform end-to-end.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            {ROLES.map((r) => (
              <button
                key={r.role}
                onClick={() => enter(r.role, r.dest)}
                disabled={busy !== null}
                className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-5 py-2.5 text-sm text-gold hover:bg-gold/20 disabled:opacity-60"
              >
                <r.icon className="h-4 w-4" /> {r.persona}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-8 text-center text-xs uppercase tracking-widest text-cream/40">
          Demo accounts are shared sandboxes · data may be modified by other visitors
        </p>
      </section>
    </div>
  );
}

function SectionHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className="text-xs uppercase tracking-[0.25em] text-gold">{eyebrow}</span>
      <h2 className="mt-3 font-display text-3xl text-cream sm:text-4xl">{title}</h2>
    </div>
  );
}
