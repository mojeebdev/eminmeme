import sharp from "sharp";
import path from "path";
import fs from "fs";

const W = 800;
const H = 800;

function escapeXml(t: string) {
  return t
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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

function getFontB64(): string {
  const fontPath = path.join(process.cwd(), "public", "impact.ttf");
  return fs.readFileSync(fontPath).toString("base64");
}

function buildSvgText(
  topText: string,
  bottomText: string,
  w: number,
  h: number,
  fontB64: string
): Buffer {
  const fontSize = 60;
  const lineH = fontSize * 1.3;
  const pad = 24;
  const stroke = 7;

  const topLines = wrapText(topText);
  const bottomLines = wrapText(bottomText);

  const topElements = topLines
    .map((line, i) => {
      const y = pad + fontSize + i * lineH;
      return `<text x="${w / 2}" y="${y}"
        font-family="ImpactMeme" font-size="${fontSize}" font-weight="400"
        text-anchor="middle" dominant-baseline="auto"
        stroke="black" stroke-width="${stroke}" stroke-linejoin="round" paint-order="stroke fill"
        fill="white">${escapeXml(line)}</text>`;
    })
    .join("\n");

  const bottomElements = bottomLines
    .map((line, i) => {
      const y = h - pad - (bottomLines.length - 1 - i) * lineH;
      return `<text x="${w / 2}" y="${y}"
        font-family="ImpactMeme" font-size="${fontSize}" font-weight="400"
        text-anchor="middle" dominant-baseline="auto"
        stroke="black" stroke-width="${stroke}" stroke-linejoin="round" paint-order="stroke fill"
        fill="white">${escapeXml(line)}</text>`;
    })
    .join("\n");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <defs>
      <style>
        @font-face {
          font-family: 'ImpactMeme';
          src: url('data:font/truetype;base64,${fontB64}') format('truetype');
          font-weight: 400;
        }
      </style>
    </defs>
    ${topElements}
    ${bottomElements}
  </svg>`;

  return Buffer.from(svg);
}

export async function compositeMeme(
  topText: string,
  bottomText: string,
  uploadedImageBase64?: string,
  uploadedImageMimeType?: string
): Promise<Buffer> {
  // 1. Load base image
  const eminPath = path.join(process.cwd(), "public", "hotemin.jpg");
  let base: Buffer;

  if (fs.existsSync(eminPath)) {
    base = await sharp(fs.readFileSync(eminPath))
      .resize(W, H, { fit: "cover", position: "center" })
      .jpeg()
      .toBuffer();
  } else {
    console.warn("[compositor] hotemin.jpg missing");
    base = await sharp({
      create: { width: W, height: H, channels: 3, background: { r: 180, g: 30, b: 30 } },
    }).jpeg().toBuffer();
  }

  const steps: sharp.OverlayOptions[] = [];

  
  
  if (uploadedImageBase64 && uploadedImageMimeType) {
    try {
      const size = 160;
      const pad = 16;
      const mask = Buffer.from(
        `<svg width="${size}" height="${size}">
          <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/>
        </svg>`
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

  
  
  const fontB64 = getFontB64();
  const textSvg = buildSvgText(topText, bottomText, W, H, fontB64);
  steps.push({ input: textSvg, top: 0, left: 0, blend: "over" });

  return sharp(base).composite(steps).jpeg({ quality: 92 }).toBuffer();
}
