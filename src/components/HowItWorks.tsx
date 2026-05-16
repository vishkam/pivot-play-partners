const steps = [
  {
    n: "01",
    title: "Profile & verify",
    body: "Athletes build a media kit in minutes. Brands set campaign goals, values, and budget. Every account is human-verified.",
  },
  {
    n: "02",
    title: "AI compatibility match",
    body: "Our engine scores partnerships across values (40%), audience, budget, sport fit, and campaign type — with plain-English explanations.",
  },
  {
    n: "03",
    title: "Outreach & proposals",
    body: "AI drafts the first message and a tailored proposal. Athletes review, edit, and respond — no agents required.",
  },
  {
    n: "04",
    title: "Contract, deliver, get paid",
    body: "Simplified contracts, milestone tracking, and protected payouts. Reputation compounds with every campaign.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="bg-secondary py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-col items-end justify-between gap-6 md:flex-row md:items-end">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-plum">How it works</span>
            <h2 className="mt-4 font-display text-4xl text-balance sm:text-5xl lg:text-6xl">
              From discovery to deal,
              <span className="block italic text-plum">in days — not quarters.</span>
            </h2>
          </div>
          <p className="max-w-sm text-muted-foreground">
            A workflow designed for the realities of modern sport — fast, transparent, and built around the athlete.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-3xl bg-border md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div
              key={s.n}
              className="group relative bg-cream p-8 transition-colors hover:bg-background lg:p-10"
            >
              <span className="font-display text-5xl text-plum/20 transition-colors group-hover:text-gold">
                {s.n}
              </span>
              <h3 className="mt-6 font-display text-2xl">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
