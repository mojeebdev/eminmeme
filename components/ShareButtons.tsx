"use client";

import { useState } from "react";

interface Props {
  memeUrl: string;
  shareText: string;
  memeOutputUrl: string;
  memeCaption?: string;
}

export default function ShareButtons({ memeUrl, shareText, memeOutputUrl, memeCaption }: Props) {
  const [copied, setCopied] = useState(false);

  const tweetText = `${memeCaption || shareText}\n\nMeme it: https://eminmeme.vercel.app`;
  const quoteUrl = "https://x.com/mojeebeth/status/2058868165132660840";
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(quoteUrl)}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(memeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    const res = await fetch(memeOutputUrl);
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "emin-meme.jpg";
    a.click();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <a
        href={tweetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary"
        style={{ textAlign: "center", fontSize: "13px", padding: "13px 24px" }}
      >
        Post to X →
      </a>

      <div style={{ display: "flex", gap: "10px" }}>
        <button
          className="btn-ghost"
          onClick={handleCopy}
          style={{ flex: 1, justifyContent: "center" }}
        >
          {copied ? "Copied!" : "Copy Link"}
        </button>
        <button
          className="btn-ghost"
          onClick={handleDownload}
          style={{ flex: 1, justifyContent: "center" }}
        >
          Download
        </button>
      </div>
    </div>
  );
}
