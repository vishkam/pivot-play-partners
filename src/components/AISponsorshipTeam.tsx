import { Briefcase, Scale, GraduationCap, Megaphone, Bot } from "lucide-react";

const roles = [
  { icon: Briefcase, title: "AI Agent", body: "Sources brand opportunities, ranks fit, and books meetings — without 20% commissions." },
  { icon: Bot, title: "Business Strategist", body: "Recommends pricing, deal structure, and which categories to expand into next." },
  { icon: Scale, title: "Legal Assistant", body: "Drafts contracts, flags risky clauses, and protects rights and royalties." },
  { icon: GraduationCap, title: "Career Advisor", body: "Builds long-term brand equity — not just one-off posts. Plans 12-month trajectories." },
  { icon: Megaphone, title: "Growth Marketer", body: "Tells you what content converts, when to post, and how to scale partnerships." },
];

export function AISponsorshipTeam() {
  return (
    <section className="relative overflow-hidden bg-plum-deep py-28 text-cream lg:py-36 grain">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="max-w-2xl">
          <span className="text-xs uppercase tracking-[0.3em] text-gold">Your AI sponsorship team</span>
          <h2 className="mt-4 font-display text-4xl text-balance sm:text-5xl lg:text-6xl">
            Five experts.
            <span className="block italic text-gold">One intelligent platform.</span>
          </h2>
          <p className="mt-6 text-cream/75 lg:text-lg">
            What used to take an agency, a lawyer, a publicist and a strategist now lives
            inside Pegasus — working 24/7 for every athlete on the platform.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {roles.map((r) => (
            <div
              key={r.title}
              className="group rounded-2xl border border-cream/10 bg-cream/[0.04] p-6 backdrop-blur-sm transition-colors hover:border-gold/40 hover:bg-cream/[0.07]"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gold/15 text-gold transition-transform group-hover:scale-110">
                <r.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-display text-xl">{r.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-cream/70">{r.body}</p>
            </div>
          ))}
        </div>

        <p className="mt-10 max-w-2xl text-sm text-cream/60">
          Pegasus charges a small platform fee on closed deals — never a 20%
          agent commission. Athletes keep more of what they earn.
        </p>
      </div>
    </section>
  );
}
