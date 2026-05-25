import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: meme } = await supabase
    .from("memes")
    .select("meme_output_url")
    .eq("slug", slug)
    .single();

  if (!meme) {
    return NextResponse.redirect("https://eminmeme.vercel.app/og-default.jpg");
  }

  // Redirect directly to the meme image — X crawler follows redirects fine
  return NextResponse.redirect(meme.meme_output_url, { status: 302 });
}