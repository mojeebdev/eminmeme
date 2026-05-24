import sharp from "sharp";
import path from "path";
import fs from "fs";

const W = 800;
const H = 800;

function escapeXml(t: string) {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function wrapText(text: string, max = 18): string[] {
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
  return lines;
}

async function makeTextImage(text: string, width: number, fontSize: number): Promise<Buffer> {
  const lines = wrapText(text, 18);
  const lineH = Math.round(fontSize * 1.3);
  const totalH = lines.length * lineH + 20;
  const stroke = Math.round(fontSize * 0.12);

  const textElements = lines
    .map(
      (line, i) =>
        `<text
          x="${width / 2}"
          y="${fontSize + i * lineH}"
          font-size="${fontSize}"
          font-weight="bold"
          font-family="Arial Black, Arial, sans-serif"
          text-anchor="middle"
          fill="white"
          stroke="black"
          stroke-width="${stroke}"
          stroke-linejoin="round"
          paint-order="stroke fill"
        >${escapeXml(line)}</text>`
    )
    .join("\n");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${totalH}">
    ${textElements}
  </svg>`;

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
    // RED fallback — means hotemin.jpg is missing from /public
    base = await sharp({
      create: { width: W, height: H, channels: 3, background: { r: 180, g: 30, b: 30 } },
    }).jpeg().toBuffer();
  }

  const compositeSteps: sharp.OverlayOptions[] = [];

  if (uploadedImageBase64 && uploadedImageMimeType) {
    try {
      const size = 160;
      const pad = 16;
      const mask = Buffer.from(
        `<svg width="${size}" height="${size}"><circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="white"/></svg>`
      );
      const circle = await sharp(Buffer.from(uploadedImageBase64, "base64"))
        .resize(size, size, { fit: "cover", position: "center" })
        .composite([{ input: mask, blend: "dest-in" }])
        .png()
        .toBuffer();
      compositeSteps.push({ input: circle, top: pad, left: W - size - pad, blend: "over" });
    } catch (e) {
      console.warn("[compositor] user image overlay failed:", e);
    }
  }

  try {
    const topImg = await makeTextImage(topText, W, 56);
    compositeSteps.push({ input: topImg, top: 20, left: 0, blend: "over" });
  } catch (e) {
    console.warn("[compositor] top text failed:", e);
  }

  try {
    const bottomImg = await makeTextImage(bottomText, W, 56);
    const meta = await sharp(bottomImg).metadata();
    const bottomH = meta.height ?? 80;
    compositeSteps.push({ input: bottomImg, top: H - bottomH - 20, left: 0, blend: "over" });
  } catch (e) {
    console.warn("[compositor] bottom text failed:", e);
  }

  return sharp(base).composite(compositeSteps).jpeg({ quality: 92 }).toBuffer();
}