import { supabase } from "../../lib/supabaseClient";

export default async function ListPage() {
  const { data, error } = await supabase
    .from("bug_reports")
    .select("*")
    .limit(50);

  return (
    <main style={{ padding: 24 }}>
      <h1>Supabase List</h1>

      {error ? (
        <p>Supabase error: {error.message}</p>
      ) : !data || data.length === 0 ? (
        <p>No rows found.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {data.map((row: any, idx: number) => (
            <div
              key={row.id ?? idx}
              style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}
            >
              <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                {JSON.stringify(row, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
