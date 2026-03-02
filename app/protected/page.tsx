import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";

export default async function ProtectedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <main className="page">
      <h1 className="title">Protected Page</h1>
      <p className="subtitle">Logged in as: {user.email}</p>
      <a href="/logout">Logout</a>
    </main>
  );
}
