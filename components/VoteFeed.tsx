"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { createClient } from "@/lib/supabase-browser";

type Item = {
  id: string;
  content: string | null;
  image_id: string | null;
  imageUrl: string | null;
};

type Fly = "none" | "up" | "down";

/* ── Balloon pop: spawn falling balloon fragments ─────── */
function spawnBalloonPop() {
  // Burst of red/pink "popped balloon" particles that fall down
  confetti({
    particleCount: 60,
    startVelocity: 25,
    spread: 160,
    origin: { x: 0.5, y: 0.5 },
    gravity: 1.8,
    ticks: 120,
    colors: ["#e94560", "#ff6b8a", "#c1121f", "#ff8fa3", "#800020"],
    shapes: ["circle"],
    scalar: 1.1,
  });
  // A second burst slightly delayed for a layered effect
  setTimeout(() => {
    confetti({
      particleCount: 30,
      startVelocity: 15,
      spread: 120,
      origin: { x: 0.5, y: 0.55 },
      gravity: 2.2,
      ticks: 100,
      colors: ["#e94560", "#ff6b8a", "#ffa0b4"],
      shapes: ["circle"],
      scalar: 0.7,
    });
  }, 80);
}

export default function VoteFeed({ captions }: { captions: Item[] }) {
  const supabase = useMemo(() => createClient(), []);
  const [idx, setIdx] = useState(0);
  const [fly, setFly] = useState<Fly>("none");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({ liked: 0, skipped: 0 });

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
      setStats((s) => ({ ...s, liked: s.liked + 1 }));
    } else {
      spawnBalloonPop();
      setStats((s) => ({ ...s, skipped: s.skipped + 1 }));
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

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft" || e.key === "a") onVote(-1);
      if (e.key === "ArrowRight" || e.key === "d") onVote(1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const total = captions.length;
  const progress = total > 0 ? ((idx) / total) * 100 : 0;

  if (!current)
    return (
      <div className="done-wrapper">
        <div className="done-card">
          <span className="done-emoji">&#127881;</span>
          <p className="done-title">All done!</p>
          <p className="done-sub">
            You rated {total} caption{total !== 1 ? "s" : ""}
          </p>
          <div className="done-stats">
            <span className="stat-chip stat-liked">
              &#x1F44D; {stats.liked} liked
            </span>
            <span className="stat-chip stat-skipped">
              &#x1F44E; {stats.skipped} skipped
            </span>
          </div>
        </div>
      </div>
    );

  const imageSrc =
    current.imageUrl ??
    (current.image_id
      ? `https://qihsgnfjqmkjmoowyfbn.supabase.co/storage/v1/object/public/images/${current.image_id}`
      : null);

  const cardClass = [
    "vote-card",
    fly === "up" ? "fly-up" : "",
    fly === "down" ? "fly-down balloon-pop" : "",
    fly === "none" ? "card-enter" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="vote-layout">
      {/* ── Left sidebar: session stats ── */}
      <aside className="vote-sidebar sidebar-left">
        <div className="sidebar-box">
          <p className="sidebar-label">Session</p>
          <div className="sidebar-stat">
            <span className="stat-num">{stats.liked}</span>
            <span className="stat-tag tag-green">Liked</span>
          </div>
          <div className="sidebar-stat">
            <span className="stat-num">{stats.skipped}</span>
            <span className="stat-tag tag-red">Skipped</span>
          </div>
        </div>
        <div className="sidebar-box">
          <p className="sidebar-label">Progress</p>
          <div className="progress-ring-wrapper">
            <svg className="progress-ring" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" className="progress-track" />
              <circle
                cx="40"
                cy="40"
                r="34"
                className="progress-fill"
                style={{
                  strokeDasharray: `${2 * Math.PI * 34}`,
                  strokeDashoffset: `${2 * Math.PI * 34 * (1 - progress / 100)}`,
                }}
              />
            </svg>
            <span className="progress-text">{idx}/{total}</span>
          </div>
        </div>
      </aside>

      {/* ── Center: main card ── */}
      <section className="vote-shell">
        {/* Progress bar */}
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <article className={cardClass} key={idx}>
          {imageSrc ? (
            <img src={imageSrc} alt="caption image" className="vote-image" />
          ) : (
            <div className="image-placeholder">No image available</div>
          )}

          <p className="vote-caption">
            &ldquo;{current.content ?? "(no content)"}&rdquo;
          </p>

          <div className="vote-actions">
            <button
              disabled={busy}
              className="btn btn-down"
              onClick={() => onVote(-1)}
            >
              <span className="btn-icon">&#x1F388;</span> Pop
            </button>
            <button
              disabled={busy}
              className="btn btn-up"
              onClick={() => onVote(1)}
            >
              <span className="btn-icon">&#x1F44D;</span> Funny!
            </button>
          </div>

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
          {idx + 1} of {total} &middot; Use arrow keys to vote
        </p>
      </section>

      {/* ── Right sidebar: tips / keyboard hints ── */}
      <aside className="vote-sidebar sidebar-right">
        <div className="sidebar-box">
          <p className="sidebar-label">Shortcuts</p>
          <div className="shortcut-row">
            <kbd className="kbd">&larr;</kbd>
            <span>Pop / skip</span>
          </div>
          <div className="shortcut-row">
            <kbd className="kbd">&rarr;</kbd>
            <span>Funny!</span>
          </div>
        </div>
        <div className="sidebar-box sidebar-tip">
          <p className="sidebar-label">Tip</p>
          <p className="tip-text">
            Share your favorites with friends using the share buttons below each caption.
          </p>
        </div>
      </aside>
    </div>
  );
}
