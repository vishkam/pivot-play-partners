import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { useAuth, type AppRole } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : "/dashboard",
    role: (search.role === "brand" || search.role === "athlete") ? search.role : undefined,
    mode: search.mode === "signin" ? "signin" : "signup",
  }),
  head: () => ({
    meta: [
      { title: "Sign in or join — Pegasus" },
      { name: "description", content: "Join Pegasus as an athlete or brand and start building authentic, values-aligned partnerships." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode: initialMode, role: initialRole, redirect } = Route.useSearch();
  const navigate = useNavigate();
  const { user, profile, loading, signIn, signUp, signInWithGoogle } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [role, setRole] = useState<AppRole>(initialRole ?? "athlete");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user && profile) {
      if (!profile.onboarding_completed) {
        if (profile.primary_role === "athlete") navigate({ to: "/athlete/onboarding" });
        else if (profile.primary_role === "brand") navigate({ to: "/brand/onboarding" });
        else navigate({ to: redirect });
      } else {
        navigate({ to: redirect });
      }
    }
  }, [loading, user, profile, navigate, redirect]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "signup") {
        const { error } = await signUp(email, password, fullName, role);
        if (error) toast.error(error);
        else toast.success("Welcome to Pegasus — let's build your profile.");
      } else {
        const { error } = await signIn(email, password);
        if (error) toast.error(error);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Left: storytelling panel */}
      <div className="relative hidden overflow-hidden bg-gradient-hero p-12 text-cream lg:flex lg:flex-col lg:justify-between grain">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-gold text-plum-deep font-display text-lg font-semibold">A</span>
          <span className="font-display text-xl">Pegasus</span>
        </Link>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gold">For athletes & brands</p>
          <h2 className="mt-4 font-display text-5xl leading-[1.05] text-balance">
            Build the partnership economy
            <span className="block italic text-gold">women athletes deserve.</span>
          </h2>
          <p className="mt-6 max-w-md text-cream/70">
            Verified profiles. Transparent matching. Fair contracts. The infrastructure layer for women's sports.
          </p>
        </div>
        <p className="text-xs uppercase tracking-widest text-cream/40">© Pegasus — Founding cohort 2026</p>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center bg-background px-6 py-12 lg:px-16">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 inline-flex items-center gap-2 text-foreground lg:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-gold text-plum-deep font-display font-semibold">A</span>
            <span className="font-display text-lg">Pegasus</span>
          </Link>

          <h1 className="font-display text-3xl">
            {mode === "signup" ? "Join Pegasus" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signup"
              ? "Free for athletes — always. Brands start with a 14-day trial."
              : "Sign in to your Pegasus workspace."}
          </p>

          {mode === "signup" && (
            <div className="mt-6 grid grid-cols-2 gap-2">
              {(["athlete", "brand"] as AppRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`rounded-xl border-2 p-4 text-left transition-all ${
                    role === r
                      ? "border-plum bg-plum/5 shadow-elegant"
                      : "border-border bg-cream hover:border-plum/40"
                  }`}
                >
                  <p className="font-display text-base">I am an {r === "athlete" ? "Athlete" : "Brand"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {r === "athlete" ? "Get matched with values-led brands." : "Discover & partner with athletes."}
                  </p>
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <Field label="Full name">
                <input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="auth-input"
                  placeholder="Maya Rivera"
                />
              </Field>
            )}
            <Field label="Email">
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
                placeholder="you@email.com"
              />
            </Field>
            <Field
              label="Password"
              right={
                mode === "signin" ? (
                  <Link to="/forgot-password" className="text-xs text-plum hover:underline">
                    Forgot?
                  </Link>
                ) : null
              }
            >
              <input
                required
                type="password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
                placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
              />
            </Field>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-plum-deep px-6 py-3 font-medium text-cream transition-transform hover:scale-[1.01] disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "signup" ? `Create ${role} account` : "Sign in"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            onClick={signInWithGoogle}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-cream px-6 py-3 text-sm font-medium hover:border-plum"
          >
            <GoogleIcon /> Continue with Google
          </button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signup" ? "Already have an account?" : "New to Pegasus?"}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
              className="font-medium text-plum hover:underline"
            >
              {mode === "signup" ? "Sign in" : "Create one"}
            </button>
          </p>
        </div>
      </div>

      <style>{`
        .auth-input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid var(--color-border);
          background: var(--color-cream);
          padding: 0.75rem 1rem;
          font-size: 0.9rem;
          color: var(--color-foreground);
          outline: none;
          transition: border-color 0.15s;
        }
        .auth-input:focus { border-color: var(--color-plum); }
      `}</style>
    </div>
  );
}

function Field({ label, right, children }: { label: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        {right}
      </div>
      {children}
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.55c2.08-1.92 3.29-4.74 3.29-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.55-2.76c-.98.66-2.24 1.06-3.73 1.06-2.87 0-5.3-1.94-6.17-4.55H2.18v2.86A11 11 0 0 0 12 23z"/>
      <path fill="#FBBC05" d="M5.83 14.09a6.6 6.6 0 0 1 0-4.18V7.05H2.18a11 11 0 0 0 0 9.9l3.65-2.86z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.65 2.86C6.7 7.32 9.13 5.38 12 5.38z"/>
    </svg>
  );
}
