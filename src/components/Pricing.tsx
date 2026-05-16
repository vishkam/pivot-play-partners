import { Link } from "@tanstack/react-router";

const athleteTiers = [
  {
    name: "Athlete · Free",
    price: "$0",
    sub: "Everything you need to land your first deal.",
    features: [
      "Verified profile & media kit",
      "Standard discovery & matching",
      "Messaging, contracts & payments",
      "Earnings tracking",
      "10% platform fee on closed deals",
    ],
    cta: "Join free",
    featured: false,
  },
  {
    name: "Athlete · Premium",
    price: "$15",
    sub: "/month · or $120/year",
    features: [
      "Priority placement in brand search",
      "Who-viewed-your-profile analytics",
      "Early access to new campaigns",
      "AI strategy & rate-card coaching",
      "Verified Premium badge",
    ],
    cta: "Go Premium",
    featured: true,
  },
];

const brandTiers = [
  {
    name: "Trial",
    price: "Free",
    sub: "14 days · 2 campaigns",
    features: ["Browse verified athletes", "1 active campaign", "5 athlete invites", "Standard matching"],
  },
  {
    name: "Starter",
    price: "$499",
    sub: "/month",
    features: ["3 active campaigns", "Unlimited invites", "AI matching & scoring", "Basic analytics"],
  },
  {
    name: "Growth",
    price: "$1,499",
    sub: "/month · most popular",
    features: ["Unlimited campaigns", "AI proposal generator", "Advanced ROI analytics", "CRM & pipeline", "Priority support"],
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    sub: "Agencies & portfolios",
    features: ["Multi-brand portfolio mgmt", "API access", "Custom matching weights", "White-glove partnerships lead", "SLA + SSO"],
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="bg-secondary py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-plum">Pricing</span>
          <h2 className="mt-4 font-display text-4xl text-balance sm:text-5xl lg:text-6xl">
            Free to start. <span className="italic text-plum">Premium when you're ready.</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Pegasus is free for every athlete. Brands pick the plan that matches their scale.
          </p>
        </div>

        <div className="mt-14">
          <h3 className="text-center text-xs uppercase tracking-[0.3em] text-muted-foreground">For athletes</h3>
          <div className="mx-auto mt-6 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
            {athleteTiers.map((t) => (
              <Tier key={t.name} t={t} />
            ))}
          </div>
        </div>

        <div className="mt-20">
          <h3 className="text-center text-xs uppercase tracking-[0.3em] text-muted-foreground">For brands</h3>
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {brandTiers.map((t) => (
              <Tier key={t.name} t={{ ...t, cta: t.name === "Enterprise" ? "Talk to sales" : "Start campaign" }} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Tier({ t }: { t: { name: string; price: string; sub: string; features: string[]; featured?: boolean; cta?: string } }) {
  return (
    <div
      className={`relative flex flex-col rounded-3xl p-8 ${
        t.featured
          ? "bg-gradient-hero text-cream shadow-elegant ring-1 ring-gold/40"
          : "bg-cream text-foreground border border-border"
      }`}
    >
      {t.featured && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-gold px-3 py-1 text-xs font-semibold text-plum-deep">
          Most popular
        </span>
      )}
      <h3 className="font-display text-2xl">{t.name}</h3>
      <div className="mt-5 flex items-baseline gap-1">
        <span className="font-display text-4xl">{t.price}</span>
      </div>
      <p className={`mt-1 text-sm ${t.featured ? "text-cream/70" : "text-muted-foreground"}`}>{t.sub}</p>
      <ul className="mt-6 flex-1 space-y-3 text-sm">
        {t.features.map((f) => (
          <li key={f} className="flex items-start gap-3">
            <span className={`mt-1 h-1.5 w-1.5 flex-none rounded-full ${t.featured ? "bg-gold" : "bg-plum"}`} />
            <span className={t.featured ? "text-cream/85" : ""}>{f}</span>
          </li>
        ))}
      </ul>
      <Link
        to="/auth"
        search={{ mode: "signup", redirect: "/subscription" } as never}
        className={`mt-8 block rounded-full px-6 py-3 text-center text-sm font-medium transition-transform hover:scale-[1.02] ${
          t.featured ? "bg-gradient-gold text-plum-deep shadow-gold" : "bg-plum-deep text-cream"
        }`}
      >
        {t.cta ?? "Get started"}
      </Link>
    </div>
  );
}
