"use client";

import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <main className="page">
      <h1 className="title">Logout</h1>
      <button className="btn btn-down" onClick={signOut}>Sign out</button>
    </main>
  );
}
