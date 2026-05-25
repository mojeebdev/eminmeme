import sharp from "sharp";
import path from "path";
import fs from "fs";
import satori from "satori";
import React from "react";

const W = 800;
const H = 800;

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

async function makeTextSvg(text: string): Promise<Buffer> {
  const fontPath = path.join(process.cwd(), "public", "impact.ttf");
  const fontData = fs.readFileSync(fontPath);
  const lines = wrapText(text);

  const element = React.createElement(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        width: W,
        padding: "16px 20px",
        gap: 4,
      },
    },
    ...lines.map((line, i) =>
      React.createElement(
        "div",
        {
          key: i,
          style: {
            fontFamily: "Impact",
            fontSize: 60,
            fontWeight: 900,
            color: "white",
            textShadow:
              "-4px -4px 0 black, 4px -4px 0 black, -4px 4px 0 black, 4px 4px 0 black, -4px 0 0 black, 4px 0 0 black, 0 -4px 0 black, 0 4px 0 black",
            textTransform: "uppercase" as const,
            letterSpacing: 2,
            textAlign: "center" as const,
          },
        },
        line
      )
    )
  );

  const svg = await satori(element, {
    width: W,
    height: H,
    fonts: [{ name: "Impact", data: fontData, weight: 900, style: "normal" as const }],
  });

  return Buffer.from(svg);
}

export async function compositeMeme(
  topText: string,
  bottomText: string,
  uploadedImageBase64?: string,
  uploadedImageMimeType?: string
): Promise<Buffer> {
  const enimPath = path.join(process.cwd(), "public", "hotenim.jpg");

  let base: Buffer;
  if (fs.existsSync(enimPath)) {
    base = await sharp(fs.readFileSync(enimPath))
      .resize(W, H, { fit: "cover", position: "center" })
      .jpeg()
      .toBuffer();
  } else {
    console.warn("[compositor] hotenim.jpg missing");
    base = await sharp({
      create: { width: W, height: H, channels: 3, background: { r: 180, g: 30, b: 30 } },
    })
      .jpeg()
      .toBuffer();
  }

  const steps: sharp.OverlayOptions[] = [];

  // User image circular overlay
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
    const topSvg = await makeTextSvg(topText);
    const topPng = await sharp(Buffer.from(topSvg)).png().toBuffer();
    steps.push({ input: topPng, top: 16, left: 0, blend: "over" });
  } catch (e) {
    console.warn("[compositor] top text failed:", e);
  }

  // Bottom text
  try {
    const botSvg = await makeTextSvg(bottomText);
    const botPng = await sharp(Buffer.from(botSvg)).png().toBuffer();
    const bh = (await sharp(botPng).metadata()).height ?? 90;
    steps.push({ input: botPng, top: H - bh - 16, left: 0, blend: "over" });
  } catch (e) {
    console.warn("[compositor] bottom text failed:", e);
  }

  return sharp(base).composite(steps).jpeg({ quality: 92 }).toBuffer();
}
