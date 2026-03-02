"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export async function submitVote(formData: FormData) {
  try {
    const captionId = formData.get("caption_id");
    const voteValueRaw = formData.get("vote_value");
    const voteValue = Number(voteValueRaw);

    if (!captionId || Number.isNaN(voteValue)) return;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // Try common schema #1
    let result = await supabase.from("caption_votes").insert({
      caption_id: captionId,
      profile_id: user.id,
      vote_value: voteValue,
    });

    // Try common schema #2 if first fails
    if (result.error) {
      result = await supabase.from("caption_votes").insert({
        caption_id: captionId,
        user_id: user.id,
        vote: voteValue,
      });
    }

    if (result.error) {
      console.error("Vote insert failed:", result.error.message);
      return;
    }

    revalidatePath("/protected");
  } catch (err) {
    console.error("submitVote crashed:", err);
  }
}

