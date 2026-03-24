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
    <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Segoe UI, sans-serif' }}>
      <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(233,69,96,0.3)', borderRadius: '24px', padding: '3rem', textAlign: 'center', maxWidth: '400px', width: '100%' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😂</div>
        <h1 style={{ color: '#e94560', fontSize: '2rem', marginBottom: '0.5rem' }}>Caption Rater</h1>
        <p style={{ color: '#a8a8b3', marginBottom: '2rem' }}>Sign in to vote and upload images</p>
        <button onClick={signInWithGoogle} style={{ background: 'white', color: '#333', border: 'none', padding: '0.8rem 2rem', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>
          Sign in with Google
        </button>
        <p style={{ color: '#555', marginTop: '1.5rem', fontSize: '0.9rem' }}>
          <a href="/" style={{ color: '#e94560', textDecoration: 'none' }}>Back to captions</a>
        </p>
      </div>
    </main>
  );
}
