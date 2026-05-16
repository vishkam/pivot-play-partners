import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";

export function OnboardingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 text-foreground">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-gold text-plum-deep font-display text-base font-semibold">
            A
          </span>
          <span className="font-display text-lg tracking-tight">Allyance</span>
        </Link>
        <Link
          to="/"
          className="flex items-center gap-1.5 rounded-full border border-border bg-cream px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-plum hover:text-plum"
          aria-label="Exit onboarding and return to homepage"
        >
          <X className="h-3.5 w-3.5" /> Exit to home
        </Link>
      </div>
    </header>
  );
}
