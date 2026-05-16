export function Mission() {
  const stats = [
    ["12,400+", "Verified athletes"],
    ["860+", "Brand partners"],
    ["3,200+", "Deals closed"],
    ["$4.2M", "Athlete earnings"],
    ["94%", "Match satisfaction"],
    ["72hrs", "Avg. brief → proposal"],
  ];

  return (
    <section id="mission" className="bg-background py-28 lg:py-36">
      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        <div className="text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-plum">Our mission</span>
          <h2 className="mt-6 font-display text-4xl leading-tight text-balance sm:text-5xl lg:text-6xl">
            Women's sports get <span className="italic text-plum">3%</span> of sponsorship dollars.
            <span className="block mt-3">Pegasus is rewriting that math — with AI.</span>
          </h2>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground">
            From a national fencer in Lyon to an Olympic climber in Tokyo, every
            athlete on Pegasus gets the same intelligent agent, lawyer and growth
            strategist — without traditional agency fees.
          </p>
        </div>

        <dl className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-border md:grid-cols-3 lg:grid-cols-6">
          {stats.map(([n, l]) => (
            <div key={l} className="bg-cream p-6 text-center">
              <dt className="font-display text-2xl text-plum-deep lg:text-3xl">{n}</dt>
              <dd className="mt-2 text-[11px] uppercase tracking-wider text-muted-foreground">{l}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
