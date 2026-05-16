import { useEffect, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth, type AppRole } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

interface RequireAuthProps {
  children: ReactNode;
  /** If set, only these roles can access the page. */
  roles?: AppRole[];
  /** If true, force user through onboarding before showing protected content. */
  requireOnboarding?: boolean;
}

export function RequireAuth({ children, roles, requireOnboarding }: RequireAuthProps) {
  const { user, profile, role, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/auth", search: { redirect: pathname } as never });
      return;
    }
    if (!profile) return; // wait for profile to load

    if (roles && role && !roles.includes(role)) {
      navigate({ to: "/dashboard" });
      return;
    }

    if (requireOnboarding && !profile.onboarding_completed) {
      if (role === "athlete" && pathname !== "/athlete/onboarding") {
        navigate({ to: "/athlete/onboarding" });
      } else if (role === "brand" && pathname !== "/brand/onboarding") {
        navigate({ to: "/brand/onboarding" });
      }
    }
  }, [loading, user, profile, role, roles, requireOnboarding, navigate, pathname]);

  if (loading || !user || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-plum" />
      </div>
    );
  }

  return <>{children}</>;
}
