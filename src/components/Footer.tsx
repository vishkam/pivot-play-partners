export function Footer() {
  return (
    <footer className="bg-plum-deep py-16 text-cream/70">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 px-6 md:grid-cols-4 lg:px-10">
        <div className="col-span-2">
          <div className="flex items-center gap-2 text-cream">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-gold font-display text-lg font-semibold text-plum-deep">
              P
            </span>
            <span className="font-display text-xl">Pegasus</span>
          </div>
          <p className="mt-4 max-w-sm text-sm">
            The partnership infrastructure layer for women's sports.
          </p>
        </div>
        <div>
          <h4 className="font-display text-cream">Platform</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><a href="#athletes" className="hover:text-gold">For athletes</a></li>
            <li><a href="#brands" className="hover:text-gold">For brands</a></li>
            <li><a href="#pricing" className="hover:text-gold">Pricing</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-cream">Company</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><a href="#mission" className="hover:text-gold">Mission</a></li>
            <li><a href="#cta" className="hover:text-gold">Contact</a></li>
            <li><a href="#cta" className="hover:text-gold">Press</a></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-12 flex max-w-7xl flex-col items-center justify-between gap-3 border-t border-cream/10 px-6 pt-8 text-xs uppercase tracking-widest text-cream/40 sm:flex-row lg:px-10">
        <span>© {new Date().getFullYear()} Pegasus — Built for women's sport.</span>
        <span>Made with intention.</span>
      </div>
    </footer>
  );
}
