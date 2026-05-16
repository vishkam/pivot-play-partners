import { Link } from "@tanstack/react-router";
import { ShieldCheck, Bookmark, BookmarkCheck, Send } from "lucide-react";
import type { MatchScore } from "@/lib/matching";

export interface AthleteCardData {
  user_id: string;
  full_name: string | null;
  country: string | null;
  sport: string | null;
  values: string[] | null;
  verification_status: string | null;
  audienceSummary?: string;
}

interface Props {
  athlete: AthleteCardData;
  match?: MatchScore;
  saved?: boolean;
  onToggleSave?: () => void;
  onSendProposal?: () => void;
}

export function AthleteCard({ athlete, match, saved, onToggleSave, onSendProposal }: Props) {
  const initials = (athlete.full_name ?? "A")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
  return (
    <article className="flex flex-col rounded-2xl border border-border bg-cream p-5 shadow-sm transition hover:shadow-elegant">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-gold font-display text-lg text-plum-deep">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-lg text-foreground truncate">{athlete.full_name}</h3>
            {match && (
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${
                  match.category === "Strong Match"
                    ? "bg-gradient-gold text-plum-deep"
                    : match.category === "Good Match"
                      ? "bg-plum/10 text-plum"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {match.score}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {athlete.sport}
            {athlete.country ? ` · ${athlete.country}` : ""}
          </p>
          {athlete.verification_status === "verified" && (
            <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-plum">
              <ShieldCheck className="h-3 w-3" /> Verified
            </span>
          )}
        </div>
      </div>

      {athlete.values?.length ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {athlete.values.slice(0, 4).map((v) => (
            <span key={v} className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] text-foreground/80">
              {v}
            </span>
          ))}
        </div>
      ) : null}

      {athlete.audienceSummary && (
        <p className="mt-3 text-xs text-muted-foreground">{athlete.audienceSummary}</p>
      )}

      {match && (
        <>
          <p className="mt-3 line-clamp-3 text-sm text-foreground/85">{match.explanation}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Pricing band <span className="font-medium text-foreground">{match.pricing_band}</span>
          </p>
        </>
      )}

      <div className="mt-4 flex items-center gap-2">
        <Link
          to="/brand/athletes/$id"
          params={{ id: athlete.user_id }}
          className="flex-1 rounded-full border border-plum px-3 py-2 text-center text-xs font-medium text-plum hover:bg-plum/5"
        >
          View profile
        </Link>
        {onToggleSave && (
          <button
            onClick={onToggleSave}
            className="rounded-full border border-border bg-background p-2 text-plum hover:bg-plum/5"
            aria-label={saved ? "Remove from shortlist" : "Save to shortlist"}
          >
            {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          </button>
        )}
        {onSendProposal && (
          <button
            onClick={onSendProposal}
            className="inline-flex items-center gap-1 rounded-full bg-plum-deep px-3 py-2 text-xs font-medium text-cream hover:opacity-90"
          >
            <Send className="h-3.5 w-3.5" /> Propose
          </button>
        )}
      </div>
    </article>
  );
}
