const tiers = [
  {
    name: "Athlete",
    price: "Free",
    sub: "Forever, for every athlete.",
    features: [
      "Verified profile & media kit",
      "Unlimited brand matches",
      "AI proposal assistance",
      "Earnings & contract tracking",
      "10% commission on closed deals",
    ],
    cta: "Join as athlete",
    featured: false,
  },
  {
    name: "Brand · Studio",
    price: "$499",
    sub: "/month · for growing brands",
    features: [
      "5 active campaigns",
      "AI matching + scoring",
      "Outreach & contract suite",
      "Analytics dashboard",
      "Email support",
    ],
    cta: "Start a campaign",
    featured: true,
  },
  {
    name: "Brand · Atelier",
    price: "Custom",
    sub: "For agencies & enterprise",
    features: [
      "Unlimited campaigns & seats",
      "Roster & talent CRM",
      "Custom matching weights",
      "Dedicated partnerships lead",
      "API & data exports",
    ],
    cta: "Talk to sales",
    featured: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="bg-secondary py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-plum">Pricing</span>
          <h2 className="mt-4 font-display text-4xl text-balance sm:text-5xl lg:text-6xl">
            Free for athletes. <span className="italic text-plum">Always.</span>
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`relative flex flex-col rounded-3xl p-8 lg:p-10 ${
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
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-5xl">{t.price}</span>
              </div>
              <p className={`mt-1 text-sm ${t.featured ? "text-cream/70" : "text-muted-foreground"}`}>
                {t.sub}
              </p>

              <ul className="mt-8 flex-1 space-y-3 text-sm">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <span className={`mt-1 h-1.5 w-1.5 flex-none rounded-full ${t.featured ? "bg-gold" : "bg-plum"}`} />
                    <span className={t.featured ? "text-cream/85" : ""}>{f}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#cta"
                className={`mt-10 block rounded-full px-6 py-3 text-center text-sm font-medium transition-transform hover:scale-[1.02] ${
                  t.featured
                    ? "bg-gradient-gold text-plum-deep shadow-gold"
                    : "bg-plum-deep text-cream"
                }`}
              >
                {t.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
