import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset password — Pegasus" }] }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const { resetPasswordForEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const { error } = await resetPasswordForEmail(email);
    if (error) toast.error(error);
    else setSent(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md rounded-3xl bg-cream p-10 shadow-elegant">
        <Link to="/" className="font-display text-2xl text-plum">Pegasus</Link>
        <h1 className="mt-6 font-display text-3xl">Reset your password</h1>
        {sent ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Check your inbox for a reset link. It expires in 1 hour.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              required
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-plum"
            />
            <button className="w-full rounded-full bg-plum-deep px-6 py-3 font-medium text-cream">
              Send reset link
            </button>
          </form>
        )}
        <Link to="/auth" className="mt-6 inline-block text-sm text-plum hover:underline">
          ← Back to sign in
        </Link>
      </div>
    </div>
  );
}
