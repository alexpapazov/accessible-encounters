"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function SignInPage() {
  const { enabled, user, signInWithGoogle, signInWithMagicLink } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (user) {
    router.replace("/dashboard");
    return null;
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-semibold text-[#3A2B26]">Sign in</h1>
      <p className="mt-2 leading-relaxed text-[#5A4A40]">
        Signing in lets the simulator save your attempts, so you can review your
        decisions, track patterns, and explore other outcomes.
      </p>

      {!enabled ? (
        <div className="mt-6 rounded-xl border border-[#E7D6C4] bg-[#FBF3E9] p-4 text-sm leading-relaxed text-[#5A4A40]">
          Accounts aren&rsquo;t configured on this deployment yet — every encounter is
          still fully playable without one.{" "}
          <Link href="/" className="text-[#8A5A44] underline">
            Back to encounters
          </Link>
        </div>
      ) : sent ? (
        <div className="mt-6 rounded-xl border border-[#4FA39C] bg-[#EDF6F5] p-4 leading-relaxed text-[#2E4B48]">
          Check your email — we sent a sign-in link to <strong>{email}</strong>.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <button
            onClick={signInWithGoogle}
            className="w-full rounded-xl border border-[#E7D6C4] bg-white px-4 py-3 font-medium text-[#3A2B26] transition-colors hover:bg-[#FDF6F0]"
          >
            Continue with Google
          </button>
          <div className="flex items-center gap-3 text-xs text-[#7A6A5E]">
            <div className="h-px flex-1 bg-[#E7D6C4]" />
            or
            <div className="h-px flex-1 bg-[#E7D6C4]" />
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setError(null);
              const res = await signInWithMagicLink(email);
              if (res.error) setError(res.error);
              else setSent(true);
            }}
            className="space-y-3"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-[#E7D6C4] bg-white px-4 py-3 text-[#3A2B26] outline-none focus:border-[#E88C6E]"
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-[#E88C6E] px-4 py-3 font-medium text-white transition-colors hover:bg-[#D97B5D]"
            >
              Email me a sign-in link
            </button>
          </form>
          {error && <p className="text-sm text-[#A34A2E]">{error}</p>}
          <p className="text-xs leading-relaxed text-[#7A6A5E]">
            No password, no profile forms — just a way to keep your learning
            history yours.
          </p>
        </div>
      )}
    </div>
  );
}
