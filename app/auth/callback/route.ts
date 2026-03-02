import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

async function handleAuthCallback(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const origin = url.origin;

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}/protected`);
}

export async function GET(request: Request) {
  return handleAuthCallback(request);
}

export async function POST(request: Request) {
  return handleAuthCallback(request);
}
