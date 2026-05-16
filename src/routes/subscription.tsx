import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Sparkles, Crown, Zap } from "lucide-react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/subscription")({
  component: () => (
    <RequireAuth>
      <SubscriptionPage />
    </RequireAuth>
  ),
});

function SubscriptionPage() {
  const { role } = useAuth();
  const isAthlete = role === "athlete";
  return (
    <DashboardShell
      title="Subscription"
      subtitle={isAthlete ? "Unlock Premium to amplify your reach." : "Choose the plan that scales with your campaigns."}
    >
      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-border bg-cream p-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-gold text-plum-deep">
          <Sparkles className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">Current plan · <span className="text-plum">Free</span></p>
          <p className="text-xs text-muted-foreground">Billing is in beta. Upgrade requests are held for early-access pricing.</p>
        </div>
      </div>

      {isAthlete ? <AthletePlans /> : <BrandPlans />}

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Need something custom? <Link to="/messages" className="text-plum hover:underline">Talk to our team</Link>.
      </p>
    </DashboardShell>
  );
}

function AthletePlans() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <PlanCard
        name="Free" price="$0" sub="Everything to land your first deal"
        features={["Verified profile", "Standard matching", "Messaging + contracts", "Payment processing", "10% platform fee on deals"]}
        cta="Current plan" disabled
      />
      <PlanCard
        featured icon={Crown} name="Premium" price="$15" sub="/month · or $120/year"
        features={["Priority placement in brand search", "Who viewed your profile", "Early access to campaigns", "AI strategy & rate-card coach", "Premium verified badge"]}
        cta="Upgrade to Premium"
      />
    </div>
  );
}

function BrandPlans() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      <PlanCard name="Trial" price="Free" sub="14 days"
        features={["1 active campaign", "5 athlete invites", "Standard matching"]} cta="Current plan" disabled />
      <PlanCard name="Starter" price="$499" sub="/month"
        features={["3 active campaigns", "Unlimited invites", "AI matching", "Basic analytics"]} cta="Upgrade" />
      <PlanCard featured icon={Zap} name="Growth" price="$1,499" sub="/month"
        features={["Unlimited campaigns", "AI proposals", "Advanced ROI analytics", "Pipeline & CRM", "Priority support"]} cta="Upgrade" />
      <PlanCard name="Enterprise" price="Custom" sub="Agencies & portfolios"
        features={["Multi-brand portfolio", "API access", "Custom matching", "White-glove lead", "SSO + SLA"]} cta="Talk to sales" />
    </div>
  );
}

function PlanCard({
  name, price, sub, features, cta, featured, disabled, icon: Icon,
}: {
  name: string; price: string; sub: string; features: string[]; cta: string;
  featured?: boolean; disabled?: boolean; icon?: typeof Crown;
}) {
  return (
    <div className={`flex flex-col rounded-2xl p-6 ${
      featured ? "bg-gradient-hero text-cream shadow-elegant ring-1 ring-gold/40" : "border border-border bg-cream text-foreground"
    }`}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className={`h-4 w-4 ${featured ? "text-gold" : "text-plum"}`} />}
        <h3 className="font-display text-xl">{name}</h3>
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="font-display text-3xl">{price}</span>
      </div>
      <p className={`text-xs ${featured ? "text-cream/70" : "text-muted-foreground"}`}>{sub}</p>
      <ul className="mt-4 flex-1 space-y-2 text-sm">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check className={`mt-0.5 h-3.5 w-3.5 flex-none ${featured ? "text-gold" : "text-plum"}`} />
            <span className={featured ? "text-cream/85" : ""}>{f}</span>
          </li>
        ))}
      </ul>
      <button
        disabled={disabled}
        onClick={() => toast.success(`We'll be in touch about the ${name} plan ✨`)}
        className={`mt-5 rounded-full px-4 py-2.5 text-sm font-medium transition disabled:cursor-default disabled:opacity-60 ${
          featured ? "bg-gradient-gold text-plum-deep shadow-gold hover:scale-[1.02]" :
          disabled ? "bg-muted text-muted-foreground" :
          "bg-plum-deep text-cream hover:bg-plum"
        }`}
      >
        {cta}
      </button>
    </div>
  );
}
