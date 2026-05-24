import { NextRequest, NextResponse } from "next/server";
import { generateMemeCaptions } from "@/lib/gemini";
import { compositeMeme } from "@/lib/compositor";
import { generateSlug } from "@/lib/slug";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  
  try {
    const body = await req.json();
    const { prompt, xHandle, imageBase64, imageMimeType } = body;

    if (!prompt || prompt.trim().length < 3) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // 1. Generate captions via Gemini
    const { top_text, bottom_text, caption } = await generateMemeCaptions(
      prompt,
      imageBase64,
      imageMimeType
    );

    // 2. Composite meme image
    const memeBuffer = await compositeMeme(top_text, bottom_text, imageBase64, imageMimeType);

    // 3. Upload to Supabase Storage
    const slug = generateSlug();
    const fileName = `${slug}.jpg`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("memes")
      .upload(fileName, memeBuffer, {
        contentType: "image/jpeg",
        cacheControl: "31536000",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabaseAdmin.storage.from("memes").getPublicUrl(fileName);
    const memeOutputUrl = urlData.publicUrl;

    // 4. Store uploaded user image if provided
    let userImageUrl: string | null = null;
    if (imageBase64 && imageMimeType) {
      const ext = imageMimeType.split("/")[1] || "jpg";
      const userFileName = `user-${slug}.${ext}`;
      const userBuffer = Buffer.from(imageBase64, "base64");
      await supabaseAdmin.storage.from("memes").upload(userFileName, userBuffer, {
        contentType: imageMimeType,
        cacheControl: "31536000",
        upsert: false,
      });
      const { data: userUrlData } = supabaseAdmin.storage
        .from("memes")
        .getPublicUrl(userFileName);
      userImageUrl = userUrlData.publicUrl;
    }

    // 5. Insert into DB
    const { error: dbError } = await supabaseAdmin.from("memes").insert({
      slug,
      prompt: prompt.trim(),
      x_handle: xHandle?.replace("@", "").trim() || null,
      image_url: userImageUrl,
      meme_output_url: memeOutputUrl,
      meme_caption: caption,
      top_text,
      bottom_text,
    });

    if (dbError) throw dbError;

    return NextResponse.json({ slug, meme_output_url: memeOutputUrl, meme_caption: caption });
  } catch (err) {
    console.error("[generate]", err);
    return NextResponse.json({ error: "Generation failed. Try again." }, { status: 500 });
  }
}
