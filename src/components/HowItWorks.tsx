import { Brain, Sparkles, FileSignature, TrendingUp } from "lucide-react";

const pillars = [
  {
    icon: Brain,
    tag: "AI matching engine",
    title: "Values-first matchmaking.",
    body: "Brand DNA analysis, audience overlap, and opportunity ranking — every match comes with a transparent score and plain-English explanation.",
    points: ["Values-first matching", "Brand DNA analysis", "Audience fit modeling", "Smart opportunity ranking"],
  },
  {
    icon: Sparkles,
    tag: "AI proposal generator",
    title: "Personalized outreach in seconds.",
    body: "Tailored proposals, athlete-specific pricing guidance, and negotiation support written in your brand voice — ready to send or refine.",
    points: ["Custom campaign briefs", "Pricing intelligence", "Negotiation copilot", "Outreach templates"],
  },
  {
    icon: FileSignature,
    tag: "Legal + contract support",
    title: "Contracts simplified, payments protected.",
    body: "Plain-English contract templates, rights management, e-signatures, escrow and milestone-based payouts — built in, not bolted on.",
    points: ["Contract templates", "AI red-flag detection", "Rights management", "Escrow + milestone payouts"],
  },
  {
    icon: TrendingUp,
    tag: "Social growth strategy",
    title: "AI that compounds your career.",
    body: "Content recommendations, audience insights and partnership scaling strategies — your sponsorships keep getting smarter over time.",
    points: ["Content strategy", "Platform growth", "Brand amplification", "Partnership scaling"],
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="bg-secondary py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-col items-end justify-between gap-6 md:flex-row md:items-end">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-plum">The Pegasus AI stack</span>
            <h2 className="mt-4 font-display text-4xl text-balance sm:text-5xl lg:text-6xl">
              Four AI partnership managers,
              <span className="block italic text-plum">one infrastructure layer.</span>
            </h2>
          </div>
          <p className="max-w-sm text-muted-foreground">
            Pegasus replaces the agent, the lawyer and the strategist with an
            intelligent system that learns from every deal closed on the platform.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-3xl bg-border md:grid-cols-2">
          {pillars.map((p) => (
            <div key={p.tag} className="group relative bg-cream p-8 transition-colors hover:bg-background lg:p-10">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-plum/10 text-plum transition-colors group-hover:bg-gold/20 group-hover:text-plum-deep">
                  <p.icon className="h-5 w-5" />
                </span>
                <span className="text-[11px] uppercase tracking-[0.2em] text-plum/70">{p.tag}</span>
              </div>
              <h3 className="mt-5 font-display text-2xl lg:text-3xl">{p.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              <ul className="mt-5 grid grid-cols-2 gap-2">
                {p.points.map((pt) => (
                  <li key={pt} className="flex items-center gap-2 text-xs text-foreground/80">
                    <span className="h-1 w-1 rounded-full bg-gold" /> {pt}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
