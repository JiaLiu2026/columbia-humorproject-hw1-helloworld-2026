"use client";

import { createClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  async function signInWithGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <main className="page">
      <h1 className="title">Login</h1>
      <button className="btn btn-up" onClick={signInWithGoogle}>
        Sign in with Google
      </button>
    </main>
  );
}
