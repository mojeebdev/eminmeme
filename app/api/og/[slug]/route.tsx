import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "edge";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const { data: meme } = await supabase
    .from("memes")
    .select("meme_output_url, meme_caption, slug")
    .eq("slug", slug)
    .single();

  if (!meme) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            background: "#0D0A1A",
            width: "1200px",
            height: "630px",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 48,
            fontFamily: "serif",
          }}
        >
          Enim Meme Generator
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          background: "#0D0A1A",
          width: "1200px",
          height: "630px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <img
          src={meme.meme_output_url}
          style={{ width: "630px", height: "630px", objectFit: "cover" }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "48px 40px",
            flex: 1,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div
              style={{
                fontSize: "13px",
                letterSpacing: "0.2em",
                color: "#C4A55A",
                textTransform: "uppercase",
              }}
            >
              Enim Meme Generator
            </div>
            <div
              style={{
                fontSize: "22px",
                color: "#F5EDD8",
                lineHeight: 1.5,
                fontFamily: "serif",
                fontStyle: "italic",
              }}
            >
              {meme.meme_caption.slice(0, 120)}
              {meme.meme_caption.length > 120 ? "…" : ""}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ fontSize: "13px", color: "#6B5E8A" }}>
              enim is hot bozo · enim is him
            </div>
            <div style={{ fontSize: "13px", color: "#C4A55A" }}>
              enimmeme.vercel.app
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
