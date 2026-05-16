const faqs = [
  { q: "Who can join as an athlete?", a: "Any woman athlete competing at a national, semi-pro, professional, college, or Olympic level — across all sports and geographies. Verification is free." },
  { q: "How does Pegasus differ from an influencer marketplace?", a: "We're built on competitive performance and values, not follower counts. Our matching engine prioritizes alignment, audience quality, and long-term fit over reach." },
  { q: "What does it cost athletes?", a: "Nothing to join, build a profile, or receive matches. Pegasus takes a 10% commission only on successfully closed partnerships." },
  { q: "How is matching done?", a: "A weighted model: 40% values, 20% audience, 15% budget, 15% sport fit, 10% campaign type. Every score includes a plain-English explanation." },
  { q: "Are contracts and payments handled in-platform?", a: "Yes — simplified contracts, e-signatures, milestone tracking, and protected payouts are all native." },
];

export function FAQ() {
  return (
    <section className="bg-background py-28 lg:py-36">
      <div className="mx-auto max-w-4xl px-6 lg:px-10">
        <span className="text-xs uppercase tracking-[0.3em] text-plum">FAQ</span>
        <h2 className="mt-4 font-display text-4xl text-balance sm:text-5xl">
          Questions, answered.
        </h2>

        <div className="mt-12 divide-y divide-border border-y border-border">
          {faqs.map((f) => (
            <details key={f.q} className="group py-6">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6">
                <span className="font-display text-xl">{f.q}</span>
                <span className="mt-1 flex h-7 w-7 flex-none items-center justify-center rounded-full border border-border text-plum transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-4 max-w-2xl text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
