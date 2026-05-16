import type { MatchScore } from "@/lib/matching";

export function MatchExplanation({ match }: { match: MatchScore }) {
  const bars: { label: string; value: number; weight: string }[] = [
    { label: "Values alignment", value: match.values_score, weight: "35%" },
    { label: "Audience fit", value: match.audience_score, weight: "20%" },
    { label: "Sport / category", value: match.sport_score, weight: "15%" },
    { label: "Budget", value: match.budget_score, weight: "15%" },
    { label: "Campaign objective", value: match.campaign_score, weight: "10%" },
    { label: "Location", value: match.location_score, weight: "5%" },
  ];
  return (
    <div className="rounded-2xl border border-border bg-cream p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg">Why this match</h3>
        <span className="rounded-full bg-gradient-gold px-3 py-1 text-xs font-semibold text-plum-deep">
          {match.score} · {match.category}
        </span>
      </div>
      <p className="mt-3 text-sm text-foreground/85">{match.explanation}</p>

      <div className="mt-5 space-y-2.5">
        {bars.map((b) => (
          <div key={b.label}>
            <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-muted-foreground">
              <span>
                {b.label} <span className="text-plum/60">{b.weight}</span>
              </span>
              <span className="font-medium text-foreground">{b.value}</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-border">
              <div className="h-full bg-gradient-gold" style={{ width: `${b.value}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Info label="Recommended partnership" value={match.recommended_partnership} />
        <Info label="Estimated pricing band" value={match.pricing_band} />
        <Info label="Suggested next action" value={match.suggested_action} />
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-background p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
