"use client";

import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header
      style={{
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(12px)",
        backgroundColor: "rgba(13, 10, 26, 0.85)",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "60px",
        }}
      >
        {/* Logo + name */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
          }}
        >
          <Image
            src="/favicon-32x32.png"
            alt="Emin"
            width={28}
            height={28}
            style={{ borderRadius: "4px" }}
          />
          <span
            style={{
              fontFamily: "var(--font-playfair)",
              fontWeight: 700,
              fontSize: "18px",
              color: "var(--cream)",
              letterSpacing: "-0.01em",
            }}
          >
            Emin{" "}
            <span style={{ color: "var(--gold)", fontStyle: "italic" }}>
              Meme
            </span>
          </span>
        </Link>

        {/* Right links */}
        <nav style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <a
            href="https://x.com/HotEminSummer"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost"
            style={{ fontSize: "11px", padding: "6px 12px" }}
          >
            Follow $HOTEMIN
          </a>
          <a
            href="#generate"
            className="btn-primary"
            style={{ fontSize: "11px", padding: "8px 16px" }}
          >
            Make Meme
          </a>
        </nav>
      </div>
    </header>
  );
}

