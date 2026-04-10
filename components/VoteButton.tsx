"use client";

import { createClient } from "@supabase/supabase-js";
import confetti from "canvas-confetti";
import { useState } from "react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function VoteButton({
  captionId,
  value,
  label,
  type,
}: {
  captionId: string;
  value: number;
  label: string;
  type: "up" | "down";
}) {
  const [burst, setBurst] = useState(false);
  const [voted, setVoted] = useState(false);

  async function handleVote() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      alert("Please login to vote!");
      window.location.href = "/login";
      return;
    }

    if (type === "up") {
      confetti({
        particleCount: 160,
        spread: 90,
        origin: { y: 0.6 },
        colors: ["#ff6b8a", "#ffa14e", "#43aa8b", "#90be6d", "#6c63ff"],
      });
    } else {
      setBurst(true);
      setTimeout(() => setBurst(false), 600);
    }

    setVoted(true);

    const { error } = await supabase.from("caption_votes").insert({
      caption_id: captionId,
      user_id: user.id,
      profile_id: user.id,
      value: value,
    });

    if (error) {
      alert("Error voting: " + error.message);
      setVoted(false);
    }
  }

  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.45rem",
    color: "white",
    border: "none",
    padding: "0.75rem 1.8rem",
    borderRadius: "999px",
    cursor: voted ? "default" : "pointer",
    fontWeight: 700,
    fontSize: "1rem",
    letterSpacing: "0.01em",
    transition: "transform 0.15s, box-shadow 0.25s, opacity 0.2s",
    opacity: voted ? 0.5 : 1,
  };

  const upStyle: React.CSSProperties = {
    ...baseStyle,
    background: "linear-gradient(135deg, #43aa8b, #90be6d)",
    boxShadow: "0 4px 18px rgba(67, 170, 139, 0.35)",
  };

  const downStyle: React.CSSProperties = {
    ...baseStyle,
    background: burst
      ? "linear-gradient(135deg, #888, #555)"
      : "linear-gradient(135deg, #e94560, #c1121f)",
    boxShadow: "0 4px 18px rgba(233, 69, 96, 0.3)",
    transform: burst ? "scale(0.9)" : "scale(1)",
  };

  return (
    <button
      onClick={handleVote}
      disabled={voted}
      style={type === "up" ? upStyle : downStyle}
      onMouseEnter={(e) => {
        if (!voted)
          (e.currentTarget as HTMLButtonElement).style.transform =
            "scale(1.06)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
      }}
    >
      <span style={{ fontSize: "1.15rem" }}>
        {type === "up" ? "\u{1F44D}" : burst ? "\u{1F4A5}" : "\u{1F44E}"}
      </span>
      {voted ? "Voted" : label}
    </button>
  );
}
