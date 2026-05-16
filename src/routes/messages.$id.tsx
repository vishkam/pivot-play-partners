import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send, Loader2, ArrowLeft, FileText, Check } from "lucide-react";
import { toast } from "sonner";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { notify } from "@/components/NotificationBell";
import { buildPlainSummary, calcPayout } from "@/lib/contract-template";

export const Route = createFileRoute("/messages/$id")({
  component: () => (
    <RequireAuth roles={["athlete", "brand", "admin"]}>
      <Thread />
    </RequireAuth>
  ),
});

interface Msg {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  created_at: string;
  system_event: string | null;
}

interface Proposal {
  id: string;
  athlete_id: string;
  brand_id: string;
  campaign_id: string | null;
  status: string;
  proposed_amount: number | null;
  partnership_type: string | null;
  timeline: string | null;
  deliverables: string | null;
}

function Thread() {
  const { id } = Route.useParams();
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [cpName, setCpName] = useState("Member");
  const [athleteName, setAthleteName] = useState("Athlete");
  const [brandName, setBrandName] = useState("Brand");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function load() {
    if (!user) return;
    const { data: p } = await supabase.from("proposals").select("*").eq("id", id).maybeSingle();
    if (!p) return;
    setProposal(p as Proposal);
    const cpId = role === "athlete" ? p.brand_id : p.athlete_id;
    const [{ data: bp }, { data: ap }] = await Promise.all([
      supabase.from("brand_profiles").select("brand_name").eq("user_id", p.brand_id).maybeSingle(),
      supabase.from("profiles").select("full_name").eq("id", p.athlete_id).maybeSingle(),
    ]);
    setBrandName(bp?.brand_name || "Brand");
    setAthleteName(ap?.full_name || "Athlete");
    setCpName(role === "athlete" ? bp?.brand_name || "Brand" : ap?.full_name || "Athlete");
    const { data: m } = await supabase.from("messages").select("*").eq("proposal_id", id).order("created_at", { ascending: true });
    setMsgs((m ?? []) as Msg[]);
    await supabase.from("messages").update({ read_at: new Date().toISOString() }).eq("proposal_id", id).eq("recipient_id", user.id).is("read_at", null);
    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }), 50);
  }

  useEffect(() => {
    load();
    const ch = supabase
      .channel(`msg-${id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `proposal_id=eq.${id}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [id, user]);

  async function send() {
    if (!user || !proposal || !body.trim()) return;
    setSending(true);
    const recipient_id = user.id === proposal.brand_id ? proposal.athlete_id : proposal.brand_id;
    const { error } = await supabase.from("messages").insert({
      sender_id: user.id,
      recipient_id,
      proposal_id: proposal.id,
      body: body.trim(),
    });
    setSending(false);
    if (error) { toast.error(error.message); return; }
    setBody("");
    notify(recipient_id, "message", "New message", `${role === "brand" ? brandName : athleteName} sent a message`, `/messages/${proposal.id}`);
    load();
  }

  async function draftContract() {
    if (!user || !proposal || role !== "brand") return;
    setDrafting(true);
    const amount = proposal.proposed_amount ?? 0;
    const { fee, payout } = calcPayout(amount, 10);
    const summary = buildPlainSummary({
      brandName, athleteName,
      partnershipType: proposal.partnership_type,
      compensation: amount,
      timeline: proposal.timeline,
      deliverables: proposal.deliverables,
    });
    const { data, error } = await supabase.from("contracts").insert({
      proposal_id: proposal.id,
      campaign_id: proposal.campaign_id,
      athlete_id: proposal.athlete_id,
      brand_id: proposal.brand_id,
      title: `${brandName} × ${athleteName}`,
      deliverables: proposal.deliverables,
      compensation_amount: amount,
      platform_fee_pct: 10,
      timeline: proposal.timeline,
      plain_summary: summary,
      status: "pending_signature",
    }).select("id").single();
    setDrafting(false);
    if (error || !data) { toast.error(error?.message || "Couldn't draft"); return; }
    void fee; void payout;
    notify(proposal.athlete_id, "contract", "Contract ready to review", `${brandName} drafted a partnership agreement`, `/contracts/${data.id}`);
    toast.success("Contract drafted");
    navigate({ to: "/contracts/$id", params: { id: data.id } });
  }

  return (
    <DashboardShell
      title={cpName}
      subtitle={proposal ? `Proposal · ${proposal.status} · $${(proposal.proposed_amount ?? 0).toLocaleString()}` : "Loading…"}
      actions={
        <>
          <Link to="/messages" className="inline-flex items-center gap-2 rounded-full border border-border bg-cream px-4 py-2 text-xs text-plum hover:bg-plum/5">
            <ArrowLeft className="h-3.5 w-3.5" /> All threads
          </Link>
          {role === "brand" && proposal?.status !== "completed" && (
            <button
              onClick={draftContract}
              disabled={drafting}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-gold px-4 py-2 text-xs font-medium text-plum-deep shadow-gold disabled:opacity-50"
            >
              {drafting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
              Draft contract
            </button>
          )}
        </>
      }
    >
      <div className="flex h-[calc(100vh-220px)] flex-col overflow-hidden rounded-2xl border border-border bg-cream">
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-6">
          {msgs.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">No messages yet — say hello.</p>
          )}
          {msgs.map((m) => {
            const mine = m.sender_id === user?.id;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                  mine ? "bg-plum-deep text-cream" : "bg-background text-foreground border border-border"
                }`}>
                  {m.system_event && (
                    <p className="mb-1 text-[10px] uppercase tracking-wider opacity-70 flex items-center gap-1">
                      <Check className="h-3 w-3" /> {m.system_event}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap">{m.body}</p>
                  <p className={`mt-1 text-[10px] ${mine ? "text-cream/60" : "text-muted-foreground"}`}>
                    {new Date(m.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); send(); }}
          className="flex items-end gap-2 border-t border-border bg-background p-4"
        >
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={2}
            placeholder="Write a message, counter-offer, or clarifying question…"
            className="flex-1 resize-none rounded-xl border border-border bg-cream px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-plum"
          />
          <button
            type="submit"
            disabled={sending || !body.trim()}
            className="inline-flex items-center gap-1.5 rounded-full bg-plum-deep px-4 py-2.5 text-sm font-medium text-cream disabled:opacity-50"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send
          </button>
        </form>
      </div>
    </DashboardShell>
  );
}
