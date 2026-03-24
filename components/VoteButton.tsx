'use client'

import { createClient } from '@supabase/supabase-js'
import confetti from 'canvas-confetti'
import { useState } from 'react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function VoteButton({ captionId, value, label, type }: { captionId: string, value: number, label: string, type: 'up' | 'down' }) {
  const [burst, setBurst] = useState(false)

  async function handleVote() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('Please login to vote!')
      window.location.href = '/login'
      return
    }

    if (type === 'up') {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#e94560', '#f9c74f', '#90be6d', '#43aa8b', '#577590']
      })
    } else {
      setBurst(true)
      setTimeout(() => setBurst(false), 600)
    }

    const { error } = await supabase
      .from('caption_votes')
      .insert({
        caption_id: captionId,
        user_id: user.id,
        profile_id: user.id,
        value: value,
      })

    if (error) {
      alert('Error voting: ' + error.message)
    }
  }

  const upStyle = {
    background: 'linear-gradient(135deg, #43aa8b, #90be6d)',
    color: 'white',
    border: 'none',
    padding: '0.6rem 1.4rem',
    borderRadius: '50px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1rem',
    transition: 'transform 0.1s',
  }

  const downStyle = {
    background: burst ? 'linear-gradient(135deg, #888, #555)' : 'linear-gradient(135deg, #e94560, #c1121f)',
    color: 'white',
    border: 'none',
    padding: '0.6rem 1.4rem',
    borderRadius: '50px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1rem',
    transform: burst ? 'scale(0.85)' : 'scale(1)',
    transition: 'all 0.15s',
  }

  return (
    <button onClick={handleVote} style={type === 'up' ? upStyle : downStyle}>
      {burst ? '💥' : label}
    </button>
  )
}