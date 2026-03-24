'use client'
import { createClient } from '@supabase/supabase-js'


const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function VoteButton({ captionId, value, label }: { captionId: string; value: number; label: string }) {
    async function handleVote() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            alert('Please login to vote!')
            window.location.href = '/login'
            return
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
        } else {
            alert('Vote submitted!')
        }
    }

    return (
        <button onClick={handleVote} style={{ marginRight: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>
            {label}
        </button>
    )
}