import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/dashboard")({
  component: DashboardRedirect,
});

function DashboardRedirect() {
  const { loading, user, profile, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/auth" }); return; }
    if (!profile) return;

    if (!profile.onboarding_completed) {
      if (role === "athlete") navigate({ to: "/athlete/onboarding" });
      else if (role === "brand") navigate({ to: "/brand/onboarding" });
      else if (role === "admin") navigate({ to: "/admin/dashboard" });
      return;
    }
    if (role === "athlete") navigate({ to: "/athlete/dashboard" });
    else if (role === "brand") navigate({ to: "/brand/dashboard" });
    else if (role === "admin") navigate({ to: "/admin/dashboard" });
  }, [loading, user, profile, role, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="h-6 w-6 animate-spin text-plum" />
    </div>
  );
}
