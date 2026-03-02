"use client";

import { useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { createClient } from "@/lib/supabase-browser";

type Item = {
  id: string;
  content: string | null;
  image_id: string | null;
  imageUrl: string | null;
};

type Fly = "none" | "up" | "down";

export default function VoteFeed({ captions }: { captions: Item[] }) {
  const supabase = useMemo(() => createClient(), []);
  const [idx, setIdx] = useState(0);
  const [fly, setFly] = useState<Fly>("none");
  const [busy, setBusy] = useState(false);

  const current = captions[idx];

  async function insertVote(captionId: string, vote: 1 | -1) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const tries = [
      { caption_id: captionId, profile_id: user.id, vote_value: vote },
      { caption_id: captionId, user_id: user.id, vote_value: vote },
      { caption_id: captionId, profile_id: user.id, vote: vote },
      { caption_id: captionId, user_id: user.id, vote: vote },
    ];

    for (const payload of tries) {
      const { error } = await supabase.from("caption_votes").insert(payload as never);
      if (!error) break;
    }
  }

  async function onVote(v: 1 | -1) {
    if (!current || busy) return;
    setBusy(true);

    if (v === 1) confetti({ particleCount: 120, spread: 80, origin: { y: 0.72 } });
    setFly(v === 1 ? "up" : "down");

    // Fire-and-forget to avoid blocking animation
    insertVote(current.id, v);

    setTimeout(() => {
      setFly("none");
      setIdx((i) => i + 1);
      setBusy(false);
    }, 700);
  }

  if (!current) return <p className="done">No more captions.</p>;

  const imageSrc =
    current.imageUrl ??
    (current.image_id
      ? `https://qihsgnfjqmkjmoowyfbn.supabase.co/storage/v1/object/public/images/${current.image_id}`
      : null);

  return (
    <section className="vote-shell">
      <article className={`vote-card ${fly === "up" ? "fly-up" : ""} ${fly === "down" ? "fly-down" : ""}`}>
        {imageSrc ? (
          <img src={imageSrc} alt="caption image" className="vote-image" />
        ) : (
          <div
            style={{
              height: 320,
              borderRadius: 12,
              background: "#f3f4f6",
              display: "grid",
              placeItems: "center",
              color: "#6b7280",
            }}
          >
            No image URL found (image_id: {current.image_id ?? "none"})
          </div>
        )}

        <p className="vote-caption">{current.content ?? "(no content)"}</p>
      </article>

      <div className="vote-actions">
        <button disabled={busy} className="btn btn-down" onClick={() => onVote(-1)}>
          Downvote
        </button>
        <button disabled={busy} className="btn btn-up" onClick={() => onVote(1)}>
          Upvote
        </button>
      </div>
    </section>
  );
}

