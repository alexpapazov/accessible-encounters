"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";

export default function SiteHeader() {
  const { enabled, loading, user, signOut } = useAuth();

  return (
    <header className="border-b border-[#EFE2D2] bg-[#FBF5EE]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-sm font-semibold text-[#3A2B26] hover:text-[#8A5A44]">
          Accessible clinical encounters
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-[#8A5A44] hover:underline">
            Encounters
          </Link>
          {enabled && (
            <Link href="/dashboard" className="text-[#8A5A44] hover:underline">
              Dashboard
            </Link>
          )}
          <Link href="/settings" className="text-[#8A5A44] hover:underline">
            Settings
          </Link>
          {enabled &&
            !loading &&
            (user ? (
              <button
                onClick={signOut}
                className="rounded-full border border-[#E7D6C4] px-3 py-1 text-[#3A2B26] transition-colors hover:bg-white"
                title={user.email ?? undefined}
              >
                Sign out
              </button>
            ) : (
              <Link
                href="/signin"
                className="rounded-full bg-[#E88C6E] px-3 py-1 font-medium text-white transition-colors hover:bg-[#D97B5D]"
              >
                Sign in
              </Link>
            ))}
        </nav>
      </div>
    </header>
  );
}
