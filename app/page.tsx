import { createClient } from "@supabase/supabase-js";
import VoteButton from "@/components/VoteButton";
import Link from "next/link";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function Home() {
  const { data: captions } = await supabase
    .from("captions")
    .select("id, content")
    .not("content", "is", null)
    .limit(10);

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(160deg, #0d0f17 0%, #131729 40%, #1a1040 100%)",
        padding: "2.5rem 1.5rem 4rem",
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: "560px", margin: "0 auto" }}>
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.5rem",
          }}
        >
          <h1
            style={{
              background: "linear-gradient(135deg, #ff6b8a, #ffa14e)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              margin: 0,
            }}
          >
            Caption Rater
          </h1>
          <div style={{ display: "flex", gap: "0.6rem" }}>
            <Link
              href="/upload"
              style={{
                background: "linear-gradient(135deg, #ff6b8a, #e94560)",
                color: "white",
                padding: "0.5rem 1rem",
                borderRadius: "999px",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "0.85rem",
                transition: "transform 0.15s",
              }}
            >
              Upload
            </Link>
            <Link
              href="/login"
              style={{
                background: "rgba(255,255,255,0.06)",
                color: "#c8cad4",
                padding: "0.5rem 1rem",
                borderRadius: "999px",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "0.85rem",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              Login
            </Link>
          </div>
        </div>
        <p
          style={{
            color: "#8b8fa3",
            marginBottom: "2rem",
            fontSize: "0.95rem",
          }}
        >
          Rate these captions — login to vote!
        </p>

        {/* ── Caption Cards ── */}
        {captions?.map((caption: any) => (
          <div
            key={caption.id}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "20px",
              padding: "1.5rem",
              marginBottom: "1rem",
              backdropFilter: "blur(18px)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              transition: "box-shadow 0.3s",
            }}
          >
            <p
              style={{
                color: "#f0f0f5",
                fontSize: "1.1rem",
                lineHeight: "1.6",
                marginBottom: "1.25rem",
                fontWeight: 500,
                textAlign: "center",
              }}
            >
              &ldquo;{caption.content}&rdquo;
            </p>
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                justifyContent: "center",
              }}
            >
              <VoteButton
                captionId={caption.id}
                value={1}
                label="Funny!"
                type="up"
              />
              <VoteButton
                captionId={caption.id}
                value={-1}
                label="Skip"
                type="down"
              />
            </div>
          </div>
        ))}

        {(!captions || captions.length === 0) && (
          <p
            style={{
              textAlign: "center",
              color: "#555",
              padding: "3rem 0",
              fontSize: "1rem",
            }}
          >
            No captions yet. Be the first to upload one!
          </p>
        )}
      </div>
    </main>
  );
}
