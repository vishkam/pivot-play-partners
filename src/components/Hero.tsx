import heroImg from "@/assets/hero-athlete.jpg";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-hero pt-32 pb-24 text-cream lg:pt-40 lg:pb-32 grain">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 lg:grid-cols-12 lg:px-10">
        <div className="lg:col-span-7">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/5 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-gold">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            The partnership infrastructure for women's sports
          </span>

          <h1 className="mt-8 font-display text-5xl leading-[1.02] text-balance sm:text-6xl lg:text-7xl xl:text-[5.5rem]">
            Where women athletes
            <span className="block italic text-gold">meet the brands</span>
            that believe in them.
          </h1>

          <p className="mt-8 max-w-xl text-lg text-cream/75 lg:text-xl">
            Allyance is the AI-powered marketplace pairing women athletes —
            from rising stars to Olympians — with values-aligned brands.
            Authentic partnerships. Fair pricing. Zero gatekeeping.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#cta"
              className="rounded-full bg-gradient-gold px-7 py-3.5 font-medium text-plum-deep shadow-gold transition-transform hover:scale-[1.03]"
            >
              Join as an athlete
            </a>
            <a
              href="#cta"
              className="rounded-full border border-cream/30 px-7 py-3.5 font-medium text-cream transition-colors hover:border-gold hover:text-gold"
            >
              Partner as a brand →
            </a>
          </div>

          <dl className="mt-14 grid max-w-lg grid-cols-3 gap-6 border-t border-cream/15 pt-8">
            {[
              ["97%", "of sponsorship $ goes to men"],
              ["12k+", "verified athletes waitlisted"],
              ["8min", "from brief to first match"],
            ].map(([n, l]) => (
              <div key={l}>
                <dt className="font-display text-3xl text-gold">{n}</dt>
                <dd className="mt-1 text-xs uppercase tracking-wider text-cream/60">{l}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative lg:col-span-5">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem] shadow-elegant ring-1 ring-gold/20">
            <img
              src={heroImg}
              alt="Woman athlete in motion"
              width={1280}
              height={1600}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-plum-deep/60 via-transparent to-transparent" />
          </div>

          {/* Floating match card */}
          <div className="absolute -bottom-6 -left-4 w-72 rounded-2xl bg-cream p-5 text-foreground shadow-elegant animate-float lg:-left-12">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-plum">Match score</span>
              <span className="rounded-full bg-gradient-gold px-2.5 py-0.5 text-xs font-semibold text-plum-deep">94%</span>
            </div>
            <p className="mt-3 font-display text-lg leading-snug">
              Maya R. × <span className="italic">Lumen Wellness</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Values · audience · budget — all aligned.
            </p>
            <div className="mt-3 flex gap-1">
              {[94, 88, 76, 91, 82].map((v, i) => (
                <div key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-gradient-gold" style={{ width: `${v}%` }} />
                </div>
              ))}
            </div>
          </div>

          <div className="absolute -top-4 -right-2 hidden w-56 rounded-2xl border border-gold/30 bg-plum-deep/80 p-4 text-cream backdrop-blur-md md:block">
            <p className="text-xs uppercase tracking-widest text-gold">AI proposal</p>
            <p className="mt-2 text-sm leading-snug">
              "Hi Maya — your story around recovery and clean nutrition aligns with our spring campaign…"
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
