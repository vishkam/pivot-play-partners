import { Link } from "@tanstack/react-router";

export function Navbar() {
  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Link to="/" className="flex items-center gap-2 text-cream">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-gold text-plum-deep font-display text-lg font-semibold">P</span>
          <span className="font-display text-xl tracking-tight">Pegasus</span>
        </Link>
        <nav className="hidden items-center gap-10 text-sm text-cream/80 md:flex">
          <a href="#mission" className="hover:text-gold transition-colors">Mission</a>
          <a href="#how" className="hover:text-gold transition-colors">How it works</a>
          <a href="#athletes" className="hover:text-gold transition-colors">For athletes</a>
          <a href="#brands" className="hover:text-gold transition-colors">For brands</a>
          <a href="#pricing" className="hover:text-gold transition-colors">Pricing</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            to="/demo"
            className="hidden rounded-full border border-gold/40 bg-gold/5 px-4 py-2 text-sm text-gold transition-colors hover:bg-gold/15 sm:inline-block"
          >
            Try demo
          </Link>
          <Link
            to="/auth"
            search={{ mode: "signin", redirect: "/dashboard" } as never}
            className="hidden rounded-full border border-cream/20 px-5 py-2 text-sm text-cream/90 transition-colors hover:border-gold hover:text-gold sm:inline-block"
          >
            Sign in
          </Link>
          <Link
            to="/auth"
            search={{ mode: "signup", role: "athlete", redirect: "/dashboard" } as never}
            className="rounded-full bg-gradient-gold px-5 py-2 text-sm font-medium text-plum-deep shadow-gold transition-transform hover:scale-[1.03]"
          >
            Get early access
          </Link>
        </div>
      </div>
    </header>
  );
}
