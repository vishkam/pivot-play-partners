import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Sparkles,
  Inbox,
  FileText,
  Wallet,
  BarChart3,
  Settings,
  Users,
  Megaphone,
  Bookmark,
  ShieldCheck,
  AlertTriangle,
  LineChart,
  LogOut,
} from "lucide-react";
import { useAuth, type AppRole } from "@/hooks/use-auth";

interface NavItem {
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
}

const ATHLETE_NAV: NavItem[] = [
  { label: "Overview", to: "/athlete/dashboard", icon: LayoutDashboard },
  { label: "Brand matches", to: "/athlete/dashboard", icon: Sparkles },
  { label: "Inbox", to: "/athlete/dashboard", icon: Inbox },
  { label: "Contracts", to: "/athlete/dashboard", icon: FileText },
  { label: "Earnings", to: "/athlete/dashboard", icon: Wallet },
  { label: "Analytics", to: "/athlete/dashboard", icon: BarChart3 },
  { label: "Settings", to: "/athlete/dashboard", icon: Settings },
];

const BRAND_NAV: NavItem[] = [
  { label: "Overview", to: "/brand/dashboard", icon: LayoutDashboard },
  { label: "Campaigns", to: "/brand/dashboard", icon: Megaphone },
  { label: "Athlete matches", to: "/brand/dashboard", icon: Users },
  { label: "Saved athletes", to: "/brand/dashboard", icon: Bookmark },
  { label: "Proposals", to: "/brand/dashboard", icon: Inbox },
  { label: "Analytics", to: "/brand/dashboard", icon: BarChart3 },
  { label: "Settings", to: "/brand/dashboard", icon: Settings },
];

const ADMIN_NAV: NavItem[] = [
  { label: "Overview", to: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Verification", to: "/admin/dashboard", icon: ShieldCheck },
  { label: "Users", to: "/admin/dashboard", icon: Users },
  { label: "Fraud monitor", to: "/admin/dashboard", icon: AlertTriangle },
  { label: "Revenue", to: "/admin/dashboard", icon: LineChart },
  { label: "Settings", to: "/admin/dashboard", icon: Settings },
];

const NAV_BY_ROLE: Record<AppRole, NavItem[]> = {
  athlete: ATHLETE_NAV,
  brand: BRAND_NAV,
  admin: ADMIN_NAV,
};

export function AppSidebar() {
  const { profile, role, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const items = role ? NAV_BY_ROLE[role] : [];
  const initials = (profile?.full_name || profile?.email || "U")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="hidden h-screen w-64 flex-col border-r border-border bg-plum-deep text-cream lg:flex">
      <div className="flex items-center gap-2 px-6 py-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-gold text-plum-deep font-display text-lg font-semibold">
            A
          </span>
          <span className="font-display text-xl">Allyance</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-2">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-cream/40">
          {role ? role.charAt(0).toUpperCase() + role.slice(1) : ""} workspace
        </p>
        <ul className="space-y-1">
          {items.map((it, idx) => {
            const Icon = it.icon;
            const active = idx === 0 && pathname === it.to;
            return (
              <li key={it.label}>
                <Link
                  to={it.to}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    active
                      ? "bg-gold/10 text-gold"
                      : "text-cream/70 hover:bg-cream/5 hover:text-cream"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {it.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-cream/10 p-4">
        <div className="flex items-center gap-3 rounded-lg bg-cream/5 p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-gold text-xs font-semibold text-plum-deep">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-cream">{profile?.full_name || "Member"}</p>
            <p className="truncate text-xs text-cream/50">{profile?.email}</p>
          </div>
          <button
            onClick={async () => {
              await signOut();
              navigate({ to: "/" });
            }}
            className="rounded-md p-1.5 text-cream/60 hover:bg-cream/10 hover:text-gold"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export function MobileTopbar() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-between border-b border-border bg-plum-deep px-4 py-3 text-cream lg:hidden">
      <Link to="/" className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-gold text-plum-deep font-display text-sm font-semibold">
          A
        </span>
        <span className="font-display">Allyance</span>
      </Link>
      <div className="flex items-center gap-3">
        <span className="text-xs text-cream/60">{profile?.email}</span>
        <button
          onClick={async () => { await signOut(); navigate({ to: "/" }); }}
          className="text-cream/70 hover:text-gold"
          aria-label="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
