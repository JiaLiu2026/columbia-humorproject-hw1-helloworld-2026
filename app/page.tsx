import { createClient } from '@supabase/supabase-js'
import VoteButton from '@/components/VoteButton'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function Home() {
  const { data: captions } = await supabase
    .from('captions')
    .select('id, content')
    .not('content', 'is', null)
    .limit(10)

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Rate These Captions</h1>
      <a href="/login">Login to vote</a>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {captions?.map((caption: any) => (
          <li key={caption.id} style={{ margin: '1rem 0', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
            <p>{caption.content}</p>
            <VoteButton captionId={caption.id} value={1} label="👍 Upvote" />
            <VoteButton captionId={caption.id} value={-1} label="👎 Downvote" />
          </li>
        ))}
      </ul>
    </main>
  )
}
