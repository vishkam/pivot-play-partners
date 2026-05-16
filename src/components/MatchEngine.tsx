import card1 from "@/assets/athlete-card-1.jpg";
import card2 from "@/assets/athlete-card-2.jpg";
import card3 from "@/assets/athlete-card-3.jpg";

const athletes = [
  { img: card1, name: "Amara K.", sport: "Track & Field", country: "Kenya", score: 96, tags: ["Sustainability", "Youth"] },
  { img: card2, name: "Léa M.", sport: "Tennis", country: "France", score: 91, tags: ["Wellness", "Mentorship"] },
  { img: card3, name: "Sienna O.", sport: "Cycling", country: "USA", score: 88, tags: ["Climate", "Equity"] },
];

export function MatchEngine() {
  return (
    <section id="athletes" className="relative overflow-hidden bg-plum-deep py-28 text-cream lg:py-36 grain">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-5">
            <span className="text-xs uppercase tracking-[0.3em] text-gold">The match engine</span>
            <h2 className="mt-4 font-display text-4xl text-balance sm:text-5xl lg:text-6xl">
              Compatibility, <span className="italic text-gold">explained.</span>
            </h2>
            <p className="mt-6 text-cream/75 lg:text-lg">
              Every match comes with a transparent score and a plain-English breakdown —
              so brands know <em>why</em>, and athletes know they're being seen for who they are,
              not just their follower count.
            </p>

            <ul className="mt-8 space-y-3">
              {[
                ["Values alignment", "40%"],
                ["Audience overlap", "20%"],
                ["Budget compatibility", "15%"],
                ["Sport & category fit", "15%"],
                ["Campaign type fit", "10%"],
              ].map(([k, v]) => (
                <li key={k} className="flex items-center justify-between border-b border-cream/10 pb-3">
                  <span className="text-cream/80">{k}</span>
                  <span className="font-display text-gold">{v}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {athletes.map((a, i) => (
                <article
                  key={a.name}
                  className="group relative overflow-hidden rounded-2xl bg-cream text-foreground shadow-elegant transition-transform hover:-translate-y-1"
                  style={{ transform: `translateY(${i % 2 === 0 ? "0" : "2rem"})` }}
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img
                      src={a.img}
                      alt={a.name}
                      width={800}
                      height={1000}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="absolute right-3 top-3 rounded-full bg-gradient-gold px-2.5 py-1 text-xs font-semibold text-plum-deep">
                      {a.score}% match
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-lg leading-tight">{a.name}</h3>
                    <p className="text-xs text-muted-foreground">{a.sport} · {a.country}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {a.tags.map((t) => (
                        <span key={t} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-wider text-plum">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
