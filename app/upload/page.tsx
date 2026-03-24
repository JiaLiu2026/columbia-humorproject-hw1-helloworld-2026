import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

'use client'


const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null)
    const [captions, setCaptions] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState('')

    async function handleUpload() {
        if (!file) return alert('Please select an image first!')
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return alert('Please login first!')
        const token = session.access_token
        setLoading(true)

        try {
            // Step 1: Get presigned URL
            setStatus('Getting upload URL...')
            const res1 = await fetch('https://api.almostcrackd.ai/pipeline/generate-presigned-url', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ contentType: file.type })
            })
            const { presignedUrl, cdnUrl } = await res1.json()

            // Step 2: Upload image
            setStatus('Uploading image...')
            await fetch(presignedUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file })

            // Step 3: Register image
            setStatus('Registering image...')
            const res3 = await fetch('https://api.almostcrackd.ai/pipeline/upload-image-from-url', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageUrl: cdnUrl, isCommonUse: false })
            })
            const { imageId } = await res3.json()

            // Step 4: Generate captions
            setStatus('Generating captions...')
            const res4 = await fetch('https://api.almostcrackd.ai/pipeline/generate-captions', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageId })
            })
            const captionData = await res4.json()
            setCaptions(Array.isArray(captionData) ? captionData : [captionData])
            setStatus('Done!')
        } catch (err: any) {
            setStatus('Error: ' + err.message)
        }
        setLoading(false)
    }

    return (
        <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
            <h1>Upload Image & Generate Captions</h1>
            <a href="/login">Login first if you haven't</a>
            <br /><br />
            <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
            <br /><br />
            <button onClick={handleUpload} disabled={loading} style={{ padding: '0.5rem 1rem' }}>
                {loading ? 'Processing...' : 'Upload & Generate Captions'}
            </button>
            <p>{status}</p>
            {captions.length > 0 && (
                <div>
                    <h2>Generated Captions:</h2>
                    <ul>
                        {captions.map((c: any, i) => <li key={i}>{c.content || JSON.stringify(c)}</li>)}
                    </ul>
                </div>
            )}
        </main>
    )
}