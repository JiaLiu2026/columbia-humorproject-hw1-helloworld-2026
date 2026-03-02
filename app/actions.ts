"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export async function submitVote(formData: FormData) {
  const captionId = formData.get("caption_id");
  const voteValue = formData.get("vote_value");

  if (!captionId || !voteValue) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // HW4 requires logged-in users only
  if (!user) {
    throw new Error("You must be logged in to vote.");
  }

  // Adjust column names ONLY if your DB uses different names.
  const { error } = await supabase.from("caption_votes").insert({
    caption_id: captionId,
    profile_id: user.id,
    vote_value: Number(voteValue), // 1 or -1
  });

  if (error) throw new Error(error.message);

  revalidatePath("/protected");
}
