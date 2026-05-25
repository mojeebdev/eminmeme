import sharp from "sharp";
import path from "path";
import fs from "fs";
import satori from "satori";
import React from "react";

const W = 800;
const H = 800;

let cachedFont: ArrayBuffer | null = null;

async function getFont(): Promise<ArrayBuffer> {
  if (cachedFont) return cachedFont;

  // Try valid local TTF first
  const localPath = path.join(process.cwd(), "public", "meme-font.ttf");
  if (fs.existsSync(localPath)) {
    const buf = fs.readFileSync(localPath);
    const magic = buf.readUInt32BE(0);
    const isValidTTF =
      magic === 0x00010000 || // TTF
      magic === 0x74727565 || // 'true'
      magic === 0x4f54544f;   // 'OTTO' (OTF)
    if (isValidTTF) {
      console.log("[compositor] using local meme-font.ttf");
      cachedFont = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
      return cachedFont;
    }
  }

  // Fetch Anton (Impact-style) TTF from Google Fonts API
  console.log("[compositor] fetching font from Google Fonts...");
  const cssRes = await fetch(
    "https://fonts.googleapis.com/css2?family=Anton&display=swap",
    { headers: { "User-Agent": "Mozilla/5.0" } }
  );
  const css = await cssRes.text();
  const ttfMatch = css.match(/src: url\(([^)]+\.(?:ttf|woff2))\)/);

  if (ttfMatch) {
    const fontRes = await fetch(ttfMatch[1]);
    if (fontRes.ok) {
      cachedFont = await fontRes.arrayBuffer();
      console.log("[compositor] font fetched, size:", cachedFont.byteLength);
      return cachedFont;
    }
  }

  // Final fallback: fetch Roboto Bold TTF directly from gstatic
  const fallback = await fetch(
    "https://fonts.gstatic.com/s/roboto/v32/KFOlCnqEu92Fr1MmWUlvAx05IsDqlA.ttf"
  );
  if (!fallback.ok) throw new Error("All font fetches failed");
  cachedFont = await fallback.arrayBuffer();
  return cachedFont;
}

function wrapText(text: string, max = 16): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > max) {
      if (cur) lines.push(cur.trim());
      cur = w;
    } else {
      cur = (cur + " " + w).trim();
    }
  }
  if (cur) lines.push(cur.trim());
  return lines.slice(0, 3);
}

async function makeTextPng(text: string): Promise<Buffer> {
  const fontData = await getFont();
  const lines = wrapText(text);

  const element = React.createElement(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        width: W,
        padding: "12px 20px",
        gap: 6,
      },
    },
    ...lines.map((line, i) =>
      React.createElement(
        "div",
        {
          key: i,
          style: {
            fontFamily: "MemeFont",
            fontSize: 58,
            fontWeight: 400,
            color: "#FF394A",
            textShadow:
              "-4px -4px 0 #000, 4px -4px 0 #000, -4px 4px 0 #000, 4px 4px 0 #000, 0 4px 0 #000, 0 -4px 0 #000, -4px 0 0 #000, 4px 0 0 #000",
            textTransform: "uppercase" as const,
            letterSpacing: 3,
            textAlign: "center" as const,
            lineHeight: 1.2,
          },
        },
        line
      )
    )
  );

  const svg = await satori(element, {
    width: W,
    height: 400,
    fonts: [{ name: "MemeFont", data: fontData, weight: 400, style: "normal" as const }],
  });

  return sharp(Buffer.from(svg)).png().toBuffer();
}

export async function compositeMeme(
  topText: string,
  bottomText: string,
  uploadedImageBase64?: string,
  uploadedImageMimeType?: string
): Promise<Buffer> {
  const eminPath = path.join(process.cwd(), "public", "hotemin.jpg");

  let base: Buffer;
  if (fs.existsSync(eminPath)) {
    base = await sharp(fs.readFileSync(eminPath))
      .resize(W, H, { fit: "cover", position: "center" })
      .jpeg()
      .toBuffer();
  } else {
    console.warn("[compositor] hotemin.jpg missing — commit it to /public");
    base = await sharp({
      create: { width: W, height: H, channels: 3, background: { r: 20, g: 10, b: 40 } },
    }).jpeg().toBuffer();
  }

  const steps: sharp.OverlayOptions[] = [];

  
  if (uploadedImageBase64 && uploadedImageMimeType) {
    try {
      const size = 160;
      const pad = 16;
      const mask = Buffer.from(
        `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/></svg>`
      );
      const circle = await sharp(Buffer.from(uploadedImageBase64, "base64"))
        .resize(size, size, { fit: "cover", position: "center" })
        .composite([{ input: mask, blend: "dest-in" }])
        .png()
        .toBuffer();
      steps.push({ input: circle, top: pad, left: W - size - pad, blend: "over" });
    } catch (e) {
      console.warn("[compositor] user overlay failed:", e);
    }
  }

  // Top text
  try {
    const topPng = await makeTextPng(topText);
    steps.push({ input: topPng, top: 16, left: 0, blend: "over" });
  } catch (e) {
    console.warn("[compositor] top text failed:", e);
  }

  // Bottom text
  try {
    const botPng = await makeTextPng(bottomText);
    const bh = (await sharp(botPng).metadata()).height ?? 100;
    steps.push({ input: botPng, top: H - bh - 16, left: 0, blend: "over" });
  } catch (e) {
    console.warn("[compositor] bottom text failed:", e);
  }

  return sharp(base).composite(steps).jpeg({ quality: 92 }).toBuffer();
}