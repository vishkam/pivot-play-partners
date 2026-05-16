import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Sparkles } from "lucide-react";

export function DemoBanner() {
  const { profile } = useAuth();
  const isDemo = profile?.email?.endsWith("@pegasus.app");
  if (!isDemo) return null;
  return (
    <div className="flex items-center justify-between gap-3 border-b border-gold/30 bg-gradient-to-r from-plum-deep to-plum px-4 py-2 text-xs text-cream lg:px-10">
      <span className="inline-flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-gold" />
        <span className="uppercase tracking-widest text-gold">Demo mode</span>
        <span className="hidden text-cream/70 sm:inline">— exploring as {profile?.full_name}</span>
      </span>
      <Link to="/demo" className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 font-medium text-gold hover:bg-gold/20">
        Switch role
      </Link>
    </div>
  );
}
