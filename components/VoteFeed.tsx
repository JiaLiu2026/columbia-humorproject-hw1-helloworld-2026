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
  const [copied, setCopied] = useState(false);

  const current = captions[idx];

  async function insertVote(captionId: string, vote: 1 | -1) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const tries = [
      { caption_id: captionId, profile_id: user.id, vote_value: vote },
      { caption_id: captionId, user_id: user.id, vote_value: vote },
      { caption_id: captionId, profile_id: user.id, vote: vote },
      { caption_id: captionId, user_id: user.id, vote: vote },
    ];

    for (const payload of tries) {
      const { error } = await supabase
        .from("caption_votes")
        .insert(payload as never);
      if (!error) break;
    }
  }

  async function onVote(v: 1 | -1) {
    if (!current || busy) return;
    setBusy(true);

    if (v === 1) {
      confetti({
        particleCount: 160,
        spread: 90,
        origin: { y: 0.65 },
        colors: ["#ff6b8a", "#ffa14e", "#43aa8b", "#90be6d", "#6c63ff"],
      });
    }
    setFly(v === 1 ? "up" : "down");

    insertVote(current.id, v);

    setTimeout(() => {
      setFly("none");
      setCopied(false);
      setIdx((i) => i + 1);
      setBusy(false);
    }, 700);
  }

  function handleCopyLink() {
    if (!current) return;
    const url = `${window.location.origin}/?caption=${current.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleShareTwitter() {
    if (!current) return;
    const text = encodeURIComponent(
      `Check out this caption: "${current.content ?? ""}" `
    );
    const url = encodeURIComponent(
      `${window.location.origin}/?caption=${current.id}`
    );
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      "_blank"
    );
  }

  if (!current)
    return (
      <p className="done">
        <span className="done-emoji">&#127881;</span>
        You've rated all the captions!
      </p>
    );

  const imageSrc =
    current.imageUrl ??
    (current.image_id
      ? `https://qihsgnfjqmkjmoowyfbn.supabase.co/storage/v1/object/public/images/${current.image_id}`
      : null);

  const cardClass = [
    "vote-card",
    fly === "up" ? "fly-up" : "",
    fly === "down" ? "fly-down" : "",
    fly === "none" ? "card-enter" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className="vote-shell">
      <article className={cardClass} key={idx}>
        {imageSrc ? (
          <img src={imageSrc} alt="caption image" className="vote-image" />
        ) : (
          <div className="image-placeholder">
            No image available
          </div>
        )}

        <p className="vote-caption">
          &ldquo;{current.content ?? "(no content)"}&rdquo;
        </p>

        {/* ── Large, prominent vote buttons ── */}
        <div className="vote-actions">
          <button
            disabled={busy}
            className="btn btn-down"
            onClick={() => onVote(-1)}
          >
            <span style={{ fontSize: "1.25rem" }}>&#x1F44E;</span> Skip
          </button>
          <button
            disabled={busy}
            className="btn btn-up"
            onClick={() => onVote(1)}
          >
            <span style={{ fontSize: "1.25rem" }}>&#x1F44D;</span> Funny!
          </button>
        </div>

        {/* ── Social sharing row ── */}
        <div className="share-row">
          <button
            className={`share-btn ${copied ? "copied" : ""}`}
            onClick={handleCopyLink}
          >
            {copied ? "\u2713 Copied" : "\u{1F517} Copy Link"}
          </button>
          <button className="share-btn" onClick={handleShareTwitter}>
            &#x1D54F; Share
          </button>
        </div>
      </article>

      <p className="card-counter">
        {idx + 1} / {captions.length}
      </p>
    </section>
  );
}
