import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function Home() {
  const { data, error } = await supabase
    .from('universities')
    .select('*')
    .limit(20)

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Universities</h1>
      {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
      {data && data.length === 0 && <p>No data found</p>}
      <ul>
        {data?.map((item: any) => (
          <li key={item.id}>{JSON.stringify(item)}</li>
        ))}
      </ul>
    </main>
  )
}
