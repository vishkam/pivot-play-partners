import { ShieldCheck, Star, AlertTriangle, Sparkles } from "lucide-react";

interface Props {
  type: "verified" | "top_partner" | "fraud_risk" | "new" | "pending";
  size?: "sm" | "md";
}

const MAP = {
  verified: { Icon: ShieldCheck, label: "Verified", cls: "bg-gold/15 text-plum-deep" },
  top_partner: { Icon: Star, label: "Top partner", cls: "bg-plum/10 text-plum" },
  fraud_risk: { Icon: AlertTriangle, label: "Flagged", cls: "bg-destructive/10 text-destructive" },
  new: { Icon: Sparkles, label: "New", cls: "bg-cream text-plum border border-border" },
  pending: { Icon: ShieldCheck, label: "Pending review", cls: "bg-muted text-muted-foreground" },
} as const;

export function TrustBadge({ type, size = "sm" }: Props) {
  const { Icon, label, cls } = MAP[type];
  const sz = size === "sm" ? "text-[10px] px-2 py-0.5 gap-1" : "text-xs px-3 py-1 gap-1.5";
  return (
    <span className={`inline-flex items-center rounded-full font-medium uppercase tracking-wider ${cls} ${sz}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
