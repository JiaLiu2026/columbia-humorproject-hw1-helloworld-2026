import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import VoteFeed from "@/components/VoteFeed";

type CaptionRow = {
  id: string;
  content: string | null;
  image_id: string | null;
};

type ImageRow = Record<string, any>;

function pickUrl(row: ImageRow): string | null {
  return row.image_url ?? row.cdn_url ?? row.url ?? row.public_url ?? null;
}

export default async function ProtectedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: captions, error: capErr } = await supabase
    .from("captions")
    .select("id, content, image_id")
    .limit(100);

  if (capErr) {
    return (
      <main className="page">
        <h1 className="title">Protected Page</h1>
        <p style={{ color: "crimson" }}>{capErr.message}</p>
      </main>
    );
  }

  // Try common image table name.
  const { data: images } = await supabase.from("images").select("*").limit(500);

  const imageById = new Map<string, string>();
  (images ?? []).forEach((r: ImageRow) => {
    const id = String(r.id ?? "");
    const url = pickUrl(r);
    if (id && url) imageById.set(id, url);
  });

  const feedItems = ((captions ?? []) as CaptionRow[]).map((c) => ({
    id: c.id,
    content: c.content,
    image_id: c.image_id,
    imageUrl: c.image_id ? imageById.get(c.image_id) ?? null : null,
  }));

  return (
    <main className="page">
      <h1 className="title">Protected Page</h1>
      <p className="subtitle">Logged in as: {user.email}</p>
      <a href="/logout">Logout</a>
       <VoteFeed captions={feedItems} />
    </main>
  );
}
