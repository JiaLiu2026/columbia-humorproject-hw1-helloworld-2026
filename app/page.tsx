import { createClient } from '@supabase/supabase-js'
import VoteButton from '@/components/VoteButton'
import Link from 'next/link'

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
    <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', padding: '2rem', fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#e94560', fontSize: '2rem', margin: 0 }}>😂 Caption Rater</h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/upload" style={{ background: '#e94560', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>📸 Upload</Link>
            <Link href="/login" style={{ background: '#0f3460', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', border: '1px solid #e94560' }}>🔐 Login</Link>
          </div>
        </div>
        <p style={{ color: '#a8a8b3', marginBottom: '2rem', fontSize: '1.1rem' }}>Rate these captions — login to vote!</p>
        {captions?.map((caption: any) => (
          <div key={caption.id} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(233,69,96,0.3)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1rem', backdropFilter: 'blur(10px)' }}>
            <p style={{ color: '#ffffff', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '1rem' }}>{caption.content}</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <VoteButton captionId={caption.id} value={1} label="👍 Upvote" type="up" />
              <VoteButton captionId={caption.id} value={-1} label="👎 Downvote" type="down" />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
