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

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://eminmeme.vercel.app";
  const ogUrl = meme.meme_output_url;

  return {
    title: `${meme.prompt.slice(0, 60)} — Emin Meme Generator`,
    description: meme.meme_caption,
    openGraph: {
      title: "I just meme'd Emin on Emin Meme Generator 🔥",
      description: `${meme.meme_caption} #HOTEMIN $HOTEMIN @HotEminSummer`,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
      url: `${SITE_URL}/meme/${meme.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: "I just meme'd Emin 🔥",
      description: `${meme.meme_caption} #HOTEMIN $HOTEMIN`,
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

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://eminmeme.vercel.app";
  const memeUrl = `${SITE_URL}/meme/${meme.slug}`;
  const shareText = `${meme.meme_caption}\n\nMeme it: https://eminmeme.vercel.app`;

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

        <div className="meme-page-grid">

          {/* Meme image */}
          <div
            style={{
              borderRadius: "24px",
              overflow: "hidden",
              border: "1.5px solid var(--border-hover)",
              background: "var(--bg-card)",
              boxShadow: "0 0 40px rgba(196,165,90,0.1)",
              width: "100%",
              paddingBottom: "100%",
              position: "relative",
            }}
          >
            <Image
              src={meme.meme_output_url}
              alt={meme.prompt}
              fill
              style={{
                objectFit: "cover",
                position: "absolute",
                top: 0,
                left: 0,
              }}
              priority
              unoptimized
            />
          </div>

          {/* Info + share */}
          <div>
            <span className="tag" style={{ marginBottom: "20px", display: "inline-block" }}>
              emin is him
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
                  style={{
                    fontSize: "13px",
                    color: "var(--gold-dim)",
                    textDecoration: "none",
                    fontWeight: 700,
                  }}
                >
                  by @{meme.x_handle}
                </a>
              )}
            </div>

            <ShareButtons
              memeUrl={memeUrl}
              shareText={shareText}
              memeOutputUrl={meme.meme_output_url}
              memeCaption={meme.meme_caption}
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
            emin is him. are you?
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