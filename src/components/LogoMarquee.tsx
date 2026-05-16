const logos = [
  "LUMEN", "ORLA", "ATELIER", "NORTH&CO", "FERAL", "MAISON RUE",
  "KINFOLK", "HALO", "EVERSO", "AURA", "RIVET", "STILLE",
];

export function LogoMarquee() {
  return (
    <section className="border-y border-border bg-cream py-10">
      <p className="text-center text-xs uppercase tracking-[0.3em] text-muted-foreground">
        Trusted by values-led brands building authentic partnerships
      </p>
      <div className="mt-8 overflow-hidden">
        <div className="flex w-max animate-marquee gap-16 px-8">
          {[...logos, ...logos].map((l, i) => (
            <span key={i} className="font-display text-2xl tracking-[0.2em] text-plum/60 whitespace-nowrap">
              {l}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
