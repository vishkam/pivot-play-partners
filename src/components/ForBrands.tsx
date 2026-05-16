const features = [
  { t: "Campaign builder", d: "Define values, audience, budget, and goals. Get matches in minutes." },
  { t: "AI proposal generator", d: "Personalized first-touch outreach in your brand voice." },
  { t: "Compatibility scoring", d: "Reputation, brand-safety, and audience overlap — quantified." },
  { t: "Contract workflow", d: "Plain-language contracts, e-signatures, milestone tracking." },
  { t: "Performance analytics", d: "Reach, engagement, sentiment, and ROI in one dashboard." },
  { t: "Saved athlete lists", d: "Build long-term rosters and scale repeat partnerships." },
];

export function ForBrands() {
  return (
    <section id="brands" className="bg-background py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="max-w-2xl">
          <span className="text-xs uppercase tracking-[0.3em] text-plum">For brands</span>
          <h2 className="mt-4 font-display text-4xl text-balance sm:text-5xl lg:text-6xl">
            Find the athletes who already
            <span className="italic text-plum"> live your brand.</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Replace cold outreach, agency markups, and gut-feel decisions with values-first matching,
            verified athletes, and end-to-end campaign tooling.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={f.t}
              className="group relative overflow-hidden rounded-2xl border border-border bg-cream p-7 transition-all hover:border-gold hover:shadow-elegant"
            >
              <span className="font-display text-sm text-plum/40">0{i + 1}</span>
              <h3 className="mt-3 font-display text-2xl">{f.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.d}</p>
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-gold opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
