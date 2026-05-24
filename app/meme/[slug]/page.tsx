import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ShareButtons from "@/components/ShareButtons";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const { data: meme } = await supabase
    .from("memes")
    .select("slug, prompt, meme_caption, meme_output_url")
    .eq("slug", slug)
    .single();

  if (!meme) return { title: "Meme Not Found" };

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://enimmeme.vercel.app";
  const ogUrl = `${SITE_URL}/api/og/${meme.slug}`;

  return {
    title: `${meme.prompt.slice(0, 60)} — Enim Meme Generator`,
    description: meme.meme_caption,
    openGraph: {
      title: "I just meme'd Enim on Enim Meme Generator 🔥",
      description: `${meme.meme_caption} #HOTENIM $HOTENIM @HotEminSummer`,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
      url: `${SITE_URL}/meme/${meme.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: "I just meme'd Enim 🔥",
      description: `${meme.meme_caption} #HOTENIM $HOTENIM`,
      images: [ogUrl],
      site: "@HotEminSummer",
    },
  };
}

export default async function MemePage({ params }: Props) {
  const { slug } = await params;

  const { data: meme } = await supabase
    .from("memes")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!meme) notFound();

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://enimmeme.vercel.app";
  const memeUrl = `${SITE_URL}/meme/${meme.slug}`;
  const shareText = `I just meme'd Enim on Enim Meme Generator 🔥\n\n${meme.meme_caption}\n\n$HOTENIM @HotEminSummer`;

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <main>
      <Header />

      <div className="container" style={{ maxWidth: "900px", padding: "64px 24px" }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "12px",
            color: "var(--muted)",
            textDecoration: "none",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: "40px",
          }}
        >
          ← Back to Wall
        </Link>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "48px",
            alignItems: "start",
          }}
        >
          <div
            style={{
              borderRadius: "32px",
              overflow: "hidden",
              border: "2px solid var(--border-hover)",
              background: "var(--bg-card)",
              boxShadow: "0 0 60px rgba(196,165,90,0.12)",
              aspectRatio: "1 / 1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              src={meme.meme_output_url}
              alt={meme.prompt}
              width={800}
              height={800}
              style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
              priority
              unoptimized
            />
          </div>

          <div>
            <span className="tag" style={{ marginBottom: "20px", display: "inline-block" }}>
              enim is him
            </span>

            <h1
              style={{
                fontFamily: "var(--font-playfair)",
                fontSize: "clamp(20px, 3vw, 30px)",
                fontWeight: 700,
                color: "var(--cream)",
                lineHeight: 1.2,
                marginBottom: "12px",
              }}
            >
              {meme.top_text}
            </h1>

            {meme.bottom_text && (
              <p
                style={{
                  fontFamily: "var(--font-playfair)",
                  fontStyle: "italic",
                  fontSize: "17px",
                  color: "var(--gold)",
                  marginBottom: "24px",
                }}
              >
                {meme.bottom_text}
              </p>
            )}

            <p
              style={{
                fontSize: "14px",
                color: "var(--muted)",
                lineHeight: 1.6,
                marginBottom: "24px",
                padding: "16px",
                background: "var(--bg-elevated)",
                borderLeft: "2px solid var(--gold)",
              }}
            >
              {meme.meme_caption}
            </p>

            <div style={{ marginBottom: "32px" }}>
              <p style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "6px" }}>
                {formatDate(meme.created_at)}
              </p>
              {meme.x_handle && (
                <a
                  href={`https://x.com/${meme.x_handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: "13px", color: "var(--gold-dim)", textDecoration: "none", fontWeight: 700 }}
                >
                  by @{meme.x_handle}
                </a>
              )}
            </div>

            <ShareButtons
              memeUrl={memeUrl}
              shareText={shareText}
              memeOutputUrl={meme.meme_output_url}
            />
          </div>
        </div>

        <div
          style={{
            marginTop: "64px",
            padding: "40px",
            border: "1px solid var(--border)",
            borderRadius: "24px",
            textAlign: "center",
            background: "var(--bg-card)",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-playfair)",
              fontStyle: "italic",
              fontSize: "22px",
              color: "var(--cream)",
              marginBottom: "16px",
            }}
          >
            enim is him. are you?
          </p>
          <Link href="/#generate" className="btn-primary">
            Make Your Meme →
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
