import { Activity, CheckCircle2, MessageSquare, FileSignature } from "lucide-react";

const feed = [
  { icon: CheckCircle2, who: "Amara K. × Lumen Wellness", what: "Deal closed · $18,500", t: "2m ago" },
  { icon: MessageSquare, who: "Sienna O.", what: "AI proposal sent to Orla Outdoor", t: "11m ago" },
  { icon: FileSignature, who: "Léa M. × North&Co", what: "Contract countersigned", t: "27m ago" },
  { icon: CheckCircle2, who: "Priya R.", what: "Verified · Olympian (Boxing)", t: "44m ago" },
  { icon: MessageSquare, who: "Halo Hydration", what: "Matched with 14 climbers", t: "1h ago" },
  { icon: FileSignature, who: "Maya R. × Aura Recovery", what: "Milestone payout released · $4,200", t: "2h ago" },
];

const insights = [
  "Your audience responds best to narrative recovery content.",
  "Raise your rate card by ~12% — comparable athletes earn $16k.",
  "Your next strongest category is sustainable activewear.",
  "This athlete performs best in long-term ambassador roles.",
];

export function PlatformActivity() {
  return (
    <section className="bg-background py-28 lg:py-36">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 lg:grid-cols-12 lg:gap-16 lg:px-10">
        <div className="lg:col-span-5">
          <span className="text-xs uppercase tracking-[0.3em] text-plum">Live on Pegasus</span>
          <h2 className="mt-4 font-display text-4xl text-balance sm:text-5xl lg:text-6xl">
            Real partnerships,
            <span className="block italic text-plum">closing right now.</span>
          </h2>
          <p className="mt-6 text-muted-foreground lg:text-lg">
            From verified profiles to countersigned contracts, every action on
            Pegasus generates data that compounds into smarter recommendations
            for the next deal.
          </p>

          <div className="mt-8 rounded-2xl border border-border bg-cream p-6 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-plum">
              <Activity className="h-3.5 w-3.5" /> Sample AI insights
            </div>
            <ul className="mt-4 space-y-3">
              {insights.map((i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-gold" />
                  <span className="text-foreground/80 italic">"{i}"</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="rounded-3xl border border-border bg-cream shadow-elegant">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <span className="font-display text-lg">Platform activity</span>
              <span className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-plum">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" /> Live
              </span>
            </div>
            <ul className="divide-y divide-border">
              {feed.map((f, i) => (
                <li key={i} className="flex items-center gap-4 px-6 py-4">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-plum/10 text-plum">
                    <f.icon className="h-4 w-4" />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{f.who}</p>
                    <p className="text-xs text-muted-foreground">{f.what}</p>
                  </div>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">{f.t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
