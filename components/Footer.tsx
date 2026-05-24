import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border)",
        padding: "40px 0",
        marginTop: "32px",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "24px",
          }}
        >
          {/* Left — branding */}
          <div>
            <p
              style={{
                fontFamily: "var(--font-playfair)",
                fontStyle: "italic",
                fontSize: "13px",
                color: "var(--muted)",
                marginBottom: "6px",
              }}
            >
              enim is hot bozo · enim is him
            </p>
            <p style={{ fontSize: "12px", color: "var(--muted)" }}>
              Built by{" "}
              <a
                href="https://blindspotlab.xyz"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--gold-dim)", textDecoration: "none" }}
              >
                @mojeebeth
              </a>{" "}
              of{" "}
              <a
                href="https://blindspotlab.xyz"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--gold-dim)", textDecoration: "none" }}
              >
                BlindspotLab
              </a>
            </p>
          </div>

          {/* Right — Avalanche credit */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              opacity: 0.7,
            }}
          >
            <span
              style={{
                fontSize: "11px",
                color: "var(--muted)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Powered by
            </span>
            <Image
              src="/avalanche-avax-logo.png"
              alt="Avalanche"
              width={80}
              height={24}
              style={{ objectFit: "contain", filter: "grayscale(0.3)" }}
            />
          </div>
        </div>

        <div
          style={{
            marginTop: "24px",
            paddingTop: "24px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <p style={{ fontSize: "11px", color: "var(--muted)" }}>
            © {new Date().getFullYear()} Enim Meme Generator. All memes belong to
            the culture.
          </p>
          <a
            href="https://x.com/HotEminSummer"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: "11px",
              color: "var(--gold-dim)",
              textDecoration: "none",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Follow @HotEminSummer →
          </a>
        </div>
      </div>
    </footer>
  );
}
