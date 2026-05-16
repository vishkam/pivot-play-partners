import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Trophy, Building2, ShieldCheck, Loader2, ArrowLeft, Sparkles } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { ensureDemoUser, type DemoRole } from "@/lib/demo.functions";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Try the Pegasus demo — Athlete, Brand & Admin dashboards" },
      { name: "description", content: "Instantly explore the Pegasus platform as an athlete, brand or admin. No signup required." },
    ],
  }),
  component: DemoPage,
});

const ROLES: { role: DemoRole; icon: typeof Trophy; title: string; tagline: string; bullets: string[]; dest: string; accent: string }[] = [
  {
    role: "athlete",
    icon: Trophy,
    title: "Explore as Athlete",
    tagline: "Maya Rivera · Swimmer · Verified",
    bullets: ["AI brand matches", "Proposals + contracts", "Earnings + rate card", "Growth strategy"],
    dest: "/athlete/dashboard",
    accent: "from-gold/30 to-gold/5",
  },
  {
    role: "brand",
    icon: Building2,
    title: "Explore as Brand",
    tagline: "Lumen Wellness · Premium recovery",
    bullets: ["Discover athletes", "Run campaigns", "Pipeline + contracts", "AI strategy"],
    dest: "/brand/dashboard",
    accent: "from-plum/30 to-plum/5",
  },
  {
    role: "admin",
    icon: ShieldCheck,
    title: "Explore as Admin",
    tagline: "Pegasus operator view",
    bullets: ["Verification queue", "Revenue + GMV", "Trust & disputes", "Marketplace health"],
    dest: "/admin/dashboard",
    accent: "from-cream/20 to-cream/5",
  },
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
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-cream/70 hover:text-gold">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
          <Link to="/auth" search={{ mode: "signin", redirect: "/dashboard" } as never}
            className="text-sm text-cream/70 hover:text-gold">Sign in →</Link>
        </div>

        <div className="mx-auto mt-12 max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/5 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-gold">
            <Sparkles className="h-3 w-3" /> Sandbox demo · no signup
          </span>
          <h1 className="mt-6 font-display text-5xl leading-tight text-balance sm:text-6xl">
            Step inside the <span className="italic text-gold">Pegasus</span> operating system.
          </h1>
          <p className="mt-5 text-lg text-cream/75">
            Pick a role to instantly enter a fully-seeded dashboard — matches, proposals, contracts and earnings already in flight.
          </p>
        </div>

        {error && (
          <div className="mx-auto mt-6 max-w-md rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {ROLES.map(({ role, icon: Icon, title, tagline, bullets, dest, accent }) => (
            <button
              key={role}
              onClick={() => enter(role, dest)}
              disabled={busy !== null}
              className={`group relative overflow-hidden rounded-3xl border border-cream/15 bg-plum-deep/40 p-7 text-left transition-all hover:border-gold/60 hover:shadow-elegant disabled:opacity-60`}
            >
              <div className={`absolute -right-12 -top-12 h-48 w-48 rounded-full bg-gradient-to-br ${accent} blur-3xl transition-opacity group-hover:opacity-90`} />
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-gold text-plum-deep shadow-gold">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 font-display text-2xl text-cream">{title}</h3>
                <p className="mt-1 text-sm text-gold">{tagline}</p>
                <ul className="mt-5 space-y-2 text-sm text-cream/75">
                  {bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-gold" /> {b}
                    </li>
                  ))}
                </ul>
                <span className="mt-7 inline-flex items-center gap-2 rounded-full bg-gradient-gold px-5 py-2.5 text-sm font-medium text-plum-deep shadow-gold">
                  {busy === role ? <><Loader2 className="h-4 w-4 animate-spin" /> Entering…</> : <>Enter dashboard →</>}
                </span>
              </div>
            </button>
          ))}
        </div>

        <p className="mt-12 text-center text-xs uppercase tracking-widest text-cream/50">
          Demo accounts are shared sandboxes · data may be modified by other visitors
        </p>
      </div>
    </div>
  );
}
