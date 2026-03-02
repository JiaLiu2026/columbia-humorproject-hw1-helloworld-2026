"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";

const API_BASE = "https://api.almostcrackd.ai";
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
];

export default function UploadCaptionPipeline() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [captions, setCaptions] = useState<any[]>([]);
  const [imageId, setImageId] = useState("");

  async function runPipeline() {
    setError("");
    setCaptions([]);
    setImageId("");

    if (!file) return setError("Please choose an image.");
    if (!ALLOWED_TYPES.includes(file.type)) return setError("Unsupported image type.");

    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("No auth token. Please log in again.");

      const authHeaders = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Step 1
      const step1 = await fetch(`${API_BASE}/pipeline/generate-presigned-url`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ contentType: file.type }),
      });
      if (!step1.ok) throw new Error(`Step 1 failed: ${step1.status}`);
      const { presignedUrl, cdnUrl } = await step1.json();

      // Step 2
      const step2 = await fetch(presignedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!step2.ok) throw new Error(`Step 2 failed: ${step2.status}`);

      // Step 3
      const step3 = await fetch(`${API_BASE}/pipeline/upload-image-from-url`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ imageUrl: cdnUrl, isCommonUse: false }),
      });
      if (!step3.ok) throw new Error(`Step 3 failed: ${step3.status}`);
      const step3Json = await step3.json();
      setImageId(step3Json.imageId);

      // Step 4
      const step4 = await fetch(`${API_BASE}/pipeline/generate-captions`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ imageId: step3Json.imageId }),
      });
      if (!step4.ok) throw new Error(`Step 4 failed: ${step4.status}`);
      const step4Json = await step4.json();

      setCaptions(Array.isArray(step4Json) ? step4Json : step4Json.captions ?? [step4Json]);
    } catch (e: any) {
      setError(e.message || "Pipeline failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={{ maxWidth: 900, margin: "1rem auto", background: "white", padding: 16, borderRadius: 12 }}>
      <h2>HW5: Upload Image + Generate Captions</h2>
      <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      <button onClick={runPipeline} disabled={loading} style={{ marginLeft: 8 }}>
        {loading ? "Running..." : "Run Pipeline"}
      </button>

      {error && <p style={{ color: "crimson" }}>{error}</p>}
      {imageId && <p><strong>imageId:</strong> {imageId}</p>}

      {captions.length > 0 && (
        <div>
          <h3>Generated Captions</h3>
          <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(captions, null, 2)}</pre>
        </div>
      )}
    </section>
  );
}
