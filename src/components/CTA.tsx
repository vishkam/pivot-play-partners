export function CTA() {
  return (
    <section id="cta" className="relative overflow-hidden bg-gradient-hero py-28 text-cream lg:py-36 grain">
      <div className="mx-auto max-w-4xl px-6 text-center lg:px-10">
        <h2 className="font-display text-5xl leading-[1.05] text-balance sm:text-6xl lg:text-7xl">
          Let AI build smarter
          <span className="block italic text-gold">partnerships, together.</span>
        </h2>
        <p className="mx-auto mt-8 max-w-xl text-lg text-cream/75">
          Join the founding cohort. Athletes get lifetime free access to their AI sponsorship team.
          Brands get first pick of a verified, intelligently ranked roster.
        </p>

        <form className="mx-auto mt-10 flex max-w-lg flex-col gap-3 sm:flex-row">
          <input
            type="email"
            required
            placeholder="you@brand.com"
            className="flex-1 rounded-full border border-cream/20 bg-cream/5 px-6 py-3.5 text-cream placeholder:text-cream/40 focus:border-gold focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-full bg-gradient-gold px-7 py-3.5 font-medium text-plum-deep shadow-gold transition-transform hover:scale-[1.03]"
          >
            Request access
          </button>
        </form>
        <p className="mt-4 text-xs uppercase tracking-widest text-cream/50">
          No spam. Founding cohort opens Q1 2026.
        </p>
      </div>
    </section>
  );
}
