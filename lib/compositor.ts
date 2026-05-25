import sharp from "sharp";
import path from "path";
import fs from "fs";
import { createCanvas, loadImage } from "@napi-rs/canvas";

const W = 800;
const H = 800;

function wrapText(ctx: any, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 3);
}

function drawMemeText(
  ctx: any,
  text: string,
  position: "top" | "bottom",
  canvasW: number,
  canvasH: number
) {
  const fontSize = 58;
  const lineH = fontSize * 1.25;
  const padding = 24;
  const maxWidth = canvasW - 80;

  ctx.font = `900 ${fontSize}px Impact, Arial Black, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = position === "top" ? "top" : "bottom";

  const lines = wrapText(ctx, text, maxWidth);

  lines.forEach((line, i) => {
    const y =
      position === "top"
        ? padding + i * lineH
        : canvasH - padding - (lines.length - 1 - i) * lineH;

    ctx.strokeStyle = "black";
    ctx.lineWidth = 8;
    ctx.lineJoin = "round";
    ctx.strokeText(line, canvasW / 2, y);

    ctx.fillStyle = "white";
    ctx.fillText(line, canvasW / 2, y);
  });
}

export async function compositeMeme(
  topText: string,
  bottomText: string,
  uploadedImageBase64?: string,
  uploadedImageMimeType?: string
): Promise<Buffer> {
  const eminPath = path.join(process.cwd(), "public", "hotemin.jpg");
  let baseJpeg: Buffer;

  if (fs.existsSync(eminPath)) {
    baseJpeg = await sharp(fs.readFileSync(eminPath))
      .resize(W, H, { fit: "cover", position: "center" })
      .jpeg()
      .toBuffer();
  } else {
    console.warn("[compositor] hotemin.jpg missing from public/");
    baseJpeg = await sharp({
      create: { width: W, height: H, channels: 3, background: { r: 180, g: 30, b: 30 } },
    }).jpeg().toBuffer();
  }

  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  const baseImg = await loadImage(baseJpeg);
  ctx.drawImage(baseImg, 0, 0, W, H);

  if (uploadedImageBase64 && uploadedImageMimeType) {
    try {
      const size = 160;
      const pad = 16;
      const userResized = await sharp(Buffer.from(uploadedImageBase64, "base64"))
        .resize(size, size, { fit: "cover", position: "center" })
        .png()
        .toBuffer();
      const userImg = await loadImage(userResized);

      ctx.save();
      ctx.beginPath();
      ctx.arc(W - pad - size / 2, pad + size / 2, size / 2, Math.PI * 2, 0);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(userImg, W - pad - size, pad, size, size);
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.arc(W - pad - size / 2, pad + size / 2, size / 2, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    } catch (e) {
      console.warn("[compositor] user overlay failed:", e);
    }
  }

  drawMemeText(ctx, topText, "top", W, H);
  drawMemeText(ctx, bottomText, "bottom", W, H);

  const pngBuffer = canvas.toBuffer("image/png");
  return sharp(pngBuffer).jpeg({ quality: 92 }).toBuffer();
}
