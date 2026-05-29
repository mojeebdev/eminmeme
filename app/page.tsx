"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { GenerateResponse } from "@/types";
import MemeWall from "@/components/MemeWall";
import GeneratorForm from "@/components/GeneratorForm";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const wallRef = useRef<{ refresh: () => void }>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleGenerated = useCallback((res: GenerateResponse) => {
    setResult(res);
    wallRef.current?.refresh();
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }, []);

  return (
    <main>
      <Header />

      {/* Hero */}
      <section style={{ padding: "80px 0 64px", textAlign: "center", position: "relative" }}>
        <div className="container">
          <p className="label" style={{ marginBottom: "20px", color: "var(--gold-dim)" }}>
            emin is hot bozo · emin is him · $HOTEMIN
          </p>
          <h1
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "clamp(42px, 7vw, 80px)",
              fontWeight: 900,
              lineHeight: 1.0,
              color: "var(--cream)",
              marginBottom: "20px",
              letterSpacing: "-0.02em",
            }}
          >
            Emin Meme
            <br />
            <span style={{ color: "var(--gold)", fontStyle: "italic" }}>Generator</span>
          </h1>
          <p
            style={{
              fontFamily: "var(--font-lato)",
              fontSize: "17px",
              color: "var(--muted)",
              maxWidth: "480px",
              margin: "0 auto 40px",
              lineHeight: 1.6,
            }}
          >
            Upload your photo, describe the vibe — Emin takes over.
            <br />
            No sign up. Pure chaos.
          </p>
          <a href="#generate" className="btn-primary" style={{ display: "inline-flex" }}>
            Make a Meme →
          </a>
        </div>
      </section>

      <hr className="divider" />

      {/* Generator */}
      <section id="generate" style={{ padding: "64px 0" }}>
        <div className="container" style={{ maxWidth: "720px" }}>
          <GeneratorForm
            onLoading={setLoading}
            onGenerated={handleGenerated}
            loading={loading}
          />

          {/* Result */}
          {result && (
            <div ref={resultRef} className="fade-up" style={{ marginTop: "40px" }}>
              {/* Rounded square frame — image fits inside, no crop */}
              <div
                style={{
                  borderRadius: "32px",
                  overflow: "hidden",
                  border: "2px solid var(--border-hover)",
                  background: "var(--bg-card)",
                  boxShadow: "0 0 60px rgba(196,165,90,0.12)",
                  width: "100%",
                  aspectRatio: "1 / 1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  src={result.meme_output_url}
                  alt="Generated meme"
                  width={800}
                  height={800}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    display: "block",
                  }}
                  priority
                  unoptimized
                />
              </div>

              {/* Caption + actions below the frame */}
              <div style={{ padding: "20px 4px" }}>
                <p
                  style={{
                    fontFamily: "var(--font-lato)",
                    fontSize: "14px",
                    color: "var(--muted)",
                    marginBottom: "20px",
                    fontStyle: "italic",
                    lineHeight: 1.6,
                  }}
                >
                  {result.meme_caption}
                </p>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <Link
                    href={`/meme/${result.slug}`}
                    className="btn-primary"
                    style={{ fontSize: "13px", padding: "12px 24px" }}
                  >
                    View & Share
                  </Link>
                  <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                      `${result.meme_caption}\n\nMeme it: https://eminmeme.vercel.app`
                     )}&url=${encodeURIComponent("https://x.com/mojeebeth/status/2058868165132660840")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost"
                    >
                     Post to X →
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <hr className="divider" />

      {/* Meme Wall */}
      <section style={{ padding: "64px 0" }}>
        <div className="container">
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              marginBottom: "40px",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-playfair)",
                fontSize: "clamp(28px, 4vw, 40px)",
                fontWeight: 700,
                color: "var(--cream)",
              }}
            >
              The Meme Wall
            </h2>
            <span className="tag">Live</span>
          </div>
          <MemeWall ref={wallRef} />
        </div>
      </section>

      <Footer />
    </main>
  );
}
