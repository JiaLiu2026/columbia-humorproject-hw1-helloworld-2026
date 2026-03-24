'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [captions, setCaptions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null
    setFile(f)
    if (f) setPreview(URL.createObjectURL(f))
  }

  async function handleUpload() {
    if (!file) return alert('Please select an image first!')
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return alert('Please login first!')
    const token = session.access_token
    setLoading(true)
    setCaptions([])

    try {
      setStatus('🔗 Getting upload URL...')
      const res1 = await fetch('https://api.almostcrackd.ai/pipeline/generate-presigned-url', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType: file.type })
      })
      const { presignedUrl, cdnUrl } = await res1.json()

      setStatus('📤 Uploading image...')
      await fetch(presignedUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file })

      setStatus('📝 Registering image...')
      const res3 = await fetch('https://api.almostcrackd.ai/pipeline/upload-image-from-url', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: cdnUrl, isCommonUse: false })
      })
      const { imageId } = await res3.json()

      setStatus('🤖 Generating captions...')
      const res4 = await fetch('https://api.almostcrackd.ai/pipeline/generate-captions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId })
      })
      const captionData = await res4.json()
      setCaptions(Array.isArray(captionData) ? captionData : [captionData])
      setStatus('✅ Done!')
    } catch (err: any) {
      setStatus('❌ Error: ' + err.message)
    }
    setLoading(false)
  }

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', padding: '2rem', fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#e94560', fontSize: '2rem', margin: 0 }}>📸 Upload Image</h1>
          <Link href="/" style={{ color: '#a8a8b3', textDecoration: 'none' }}>← Back</Link>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(233,69,96,0.3)', borderRadius: '16px', padding: '2rem', marginBottom: '1.5rem' }}>
          <p style={{ color: '#a8a8b3', marginBottom: '1rem' }}>Upload a photo and we'll generate funny captions for it!</p>
          
          <label style={{ display: 'block', background: 'rgba(233,69,96,0.1)', border: '2px dashed rgba(233,69,96,0.5)', borderRadius: '12px', padding: '2rem', textAlign: 'center', cursor: 'pointer', color: '#a8a8b3', marginBottom: '1rem' }}>
            {preview ? (
              <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }} />
            ) : (
              <span>📁 Click to select an image</span>
            )}
            <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
          </label>

          <button onClick={handleUpload} disabled={loading || !file} style={{ background: loading ? '#555' : 'linear-gradient(135deg, #e94560, #c1121f)', color: 'white', border: 'none', padding: '0.8rem 2rem', borderRadius: '50px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '1rem', width: '100%' }}>
            {loading ? status : '🚀 Generate Captions'}
          </button>

          {status && !loading && <p style={{ color: '#a8a8b3', marginTop: '1rem', textAlign: 'center' }}>{status}</p>}
        </div>

        {captions.length > 0 && (
          <div>
            <h2 style={{ color: '#e94560', marginBottom: '1rem' }}>✨ Generated Captions</h2>
            {captions.map((c: any, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(233,69,96,0.3)', borderRadius: '12px', padding: '1.2rem', marginBottom: '0.8rem' }}>
                <p style={{ color: '#ffffff', margin: 0 }}>{c.content || JSON.stringify(c)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}