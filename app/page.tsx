import { supabase } from "@/lib/supabase";

export default async function HomePage() {
  const { data, error } = await supabase.from("captions").select("*").limit(20);

  if (error) {
    return (
      <main className="page">
        <h1 className="title">Supabase Error</h1>
        <p>{error.message}</p>
      </main>
    );
  }

  return (
    <main className="page">
      <h1 className="title">Caption List (HW2)</h1>
      <p className="subtitle">Loaded from Supabase</p>

      <section style={{ maxWidth: 900, margin: "0 auto" }}>
        {data?.map((row: any) => (
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
            <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(row, null, 2)}</pre>
          </article>
        ))}
      </section>
    </main>
  );
}
