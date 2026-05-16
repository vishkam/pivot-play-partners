import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

interface Notif {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
  kind: string;
}

export function NotificationBell() {
  const { user } = useAuth();
  const [items, setItems] = useState<Notif[]>([]);
  const [open, setOpen] = useState(false);

  async function load() {
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    setItems((data ?? []) as Notif[]);
  }

  useEffect(() => {
    load();
    if (!user) return;
    const ch = supabase
      .channel(`notif-${user.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  async function markAll() {
    if (!user) return;
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", user.id).is("read_at", null);
    load();
  }

  const unread = items.filter((i) => !i.read_at).length;

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen((o) => !o); if (!open) markAll(); }}
        className="relative rounded-full border border-border bg-cream p-2 text-plum hover:bg-plum/5"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gradient-gold px-1 text-[10px] font-semibold text-plum-deep">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-background shadow-elegant">
          <div className="border-b border-border bg-cream px-4 py-3 text-xs font-semibold uppercase tracking-wider text-plum">
            Notifications
          </div>
          <ul className="max-h-96 divide-y divide-border overflow-y-auto">
            {items.length === 0 && (
              <li className="px-4 py-8 text-center text-xs text-muted-foreground">All quiet for now.</li>
            )}
            {items.map((n) => (
              <li key={n.id} className="px-4 py-3 text-sm hover:bg-secondary">
                {n.link ? (
                  <Link to={n.link} onClick={() => setOpen(false)} className="block">
                    <p className="font-medium text-foreground">{n.title}</p>
                    {n.body && <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>}
                  </Link>
                ) : (
                  <>
                    <p className="font-medium text-foreground">{n.title}</p>
                    {n.body && <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>}
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Helper to write a notification from anywhere.
export async function notify(userId: string, kind: string, title: string, body?: string, link?: string) {
  await supabase.from("notifications").insert({ user_id: userId, kind, title, body: body ?? null, link: link ?? null });
}
