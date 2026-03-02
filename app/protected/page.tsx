import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { submitVote } from "@/app/actions";
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
        <p className="subtitle">Logged in as: {user.email}</p>
        <p style={{ color: "crimson" }}>Error: {error.message}</p>
      </main>
    );
  }

  const captions = data ?? [];

  return (
    <main className="page">
      <h1 className="title">Protected Page</h1>
      <p className="subtitle">Logged in as: {user.email}</p>
      <a href="/logout">Logout</a>

      <UploadCaptionPipeline />

      <section style={{ maxWidth: 900, margin: "1rem auto" }}>
        <h2>Rate Captions (HW4)</h2>

        {captions.map((row: any) => (
          <article
            key={row.id ?? JSON.stringify(row)}
            style={{
              background: "white",
              border: "1px solid #dbe3ef",
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
            }}
          >
            {row.image_url && (
              <img
                src={row.image_url}
                alt="caption image"
                style={{ width: "100%", maxHeight: 360, objectFit: "cover", borderRadius: 8, marginBottom: 12 }}
              />
            )}

            <p style={{ marginBottom: 12 }}>
              {row.content ?? row.caption_text ?? "(no text column found)"}
            </p>

            <div style={{ display: "flex", gap: 8 }}>
              <form action={submitVote}>
                <input type="hidden" name="caption_id" value={row.id} />
                <input type="hidden" name="vote_value" value="1" />
                <button type="submit" className="btn btn-up">Upvote</button>
              </form>

              <form action={submitVote}>
                <input type="hidden" name="caption_id" value={row.id} />
                <input type="hidden" name="vote_value" value="-1" />
                <button type="submit" className="btn btn-down">Downvote</button>
              </form>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

