import type { ReactNode } from "react";
import { AppSidebar, MobileTopbar, MobileBottomNav } from "./AppSidebar";
import { DemoBanner } from "./DemoBanner";
import { NotificationBell } from "@/components/NotificationBell";

interface DashboardShellProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function DashboardShell({ title, subtitle, actions, children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen w-full bg-secondary">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopbar />
        <DemoBanner />
        <header className="border-b border-border bg-cream px-6 py-6 lg:px-10 lg:py-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-display text-3xl text-foreground sm:text-4xl">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {actions}
              <NotificationBell />
            </div>
          </div>
        </header>
        <main className="flex-1 px-6 py-8 pb-24 lg:px-10 lg:pb-8">{children}</main>
        <MobileBottomNav />
      </div>
    </div>
  );
}

