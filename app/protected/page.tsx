import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import UploadCaptionPipeline from "@/components/UploadCaptionPipeline";

export default async function ProtectedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data, error } = await supabase.from("captions").select("*").limit(30);

  if (error) {
    return (
      <main className="page">
        <h1 className="title">Protected Page</h1>
        <p>Logged in as: {user.email}</p>
        <p style={{ color: "crimson" }}>Captions load error: {error.message}</p>
        <UploadCaptionPipeline />
      </main>
    );
  }

  return (
    <main className="page">
      <h1 className="title">Protected Page</h1>
      <p className="subtitle">Logged in as: {user.email}</p>
      <a href="/logout">Logout</a>

      <UploadCaptionPipeline />

      <section style={{ maxWidth: 900, margin: "1rem auto" }}>
        <h2>Rate Captions (HW4)</h2>
        {(data ?? []).map((row: any) => (
          <article
            key={row.id ?? JSON.stringify(row)}
            style={{ background: "white", border: "1px solid #dbe3ef", borderRadius: 12, padding: 16, marginBottom: 16 }}
          >
            <p>{row.content ?? row.caption_text ?? "(no text column found)"}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

