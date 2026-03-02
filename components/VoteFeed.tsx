"use client";

import { useState } from "react";
import confetti from "canvas-confetti";

type Caption = {
  id: number;
  caption_text: string;
  image_url: string;
};

type Fly = "none" | "up" | "down";

export default function VoteFeed({ captions }: { captions: Caption[] }) {
  const [index, setIndex] = useState(0);
  const [fly, setFly] = useState<Fly>("none");
  const [busy, setBusy] = useState(false);

  const current = captions[index];

  async function handleVote(voteValue: 1 | -1) {
    if (!current || busy) return;
    setBusy(true);

    const nextFly: Fly = voteValue === 1 ? "up" : "down";
    setFly(nextFly);

    if (voteValue === 1) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.7 },
      });
    }

    setTimeout(() => {
      setFly("none");
      setIndex((i) => i + 1);
      setBusy(false);
    }, 700);
  }

  if (!current) {
    return <p className="done">No more captions. You finished this batch.</p>;
  }

  return (
    <section className="vote-shell">
      <article className={`vote-card ${fly === "up" ? "fly-up" : ""} ${fly === "down" ? "fly-down" : ""}`}>
        <img src={current.image_url} alt="Caption image" className="vote-image" />
        <p className="vote-caption">{current.caption_text}</p>
      </article>

      <div className="vote-actions">
        <button disabled={busy} className="btn btn-down" onClick={() => handleVote(-1)}>
          Downvote
        </button>
        <button disabled={busy} className="btn btn-up" onClick={() => handleVote(1)}>
          Upvote
        </button>
      </div>
    </section>
  );
}
