import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { submitVote } from "@/app/actions";
import UploadCaptionPipeline from "@/components/UploadCaptionPipeline";

type Caption = {
  id: string;
  content: string;
};

export default async function ProtectedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("captions")
    .select("id, content")
    .limit(30);

  if (error) {
    return (
      <main className="page">
        <h1 className="title">Error loading captions</h1>
        <p>{error.message}</p>
      </main>
    );
  }

  const captions = (data ?? []) as Caption[];

  return (
    <main className="page">
      <h1 className="title">Protected Page</h1>
      <p className="subtitle">Logged in as: {user.email}</p>
      <a href="/logout">Logout</a>

      <UploadCaptionPipeline />

      <section style={{ maxWidth: 900, margin: "1rem auto" }}>
        <h2>Rate Captions (HW4)</h2>
        {captions.map((c) => (
          <article
            key={c.id}
            style={{
              background: "white",
              border: "1px solid #dbe3ef",
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <p>{c.content}</p>

            <div style={{ display: "flex", gap: 8 }}>
              <form action={submitVote}>
                <input type="hidden" name="caption_id" value={c.id} />
                <input type="hidden" name="vote_value" value="1" />
                <button type="submit" className="btn btn-up">Upvote</button>
              </form>

              <form action={submitVote}>
                <input type="hidden" name="caption_id" value={c.id} />
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

