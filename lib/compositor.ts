import sharp from "sharp";
import path from "path";
import fs from "fs";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 800;
const PADDING = 28;

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapText(text: string, maxCharsPerLine = 20): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > maxCharsPerLine) {
      if (current) lines.push(current.trim());
      current = word;
    } else {
      current = (current + " " + word).trim();
    }
  }
  if (current) lines.push(current.trim());
  return lines;
}

function buildTextSvg(
  topLines: string[],
  bottomLines: string[],
  w: number,
  h: number
): Buffer {
  const fontSize = 54;
  const lineH = fontSize * 1.25;
  const stroke = 7;

  const topBlocks = topLines
    .map((line, i) => {
      const y = PADDING + fontSize + i * lineH;
      return `<text
        x="${w / 2}" y="${y}"
        font-family="Arial Black, Impact, sans-serif"
        font-size="${fontSize}"
        font-weight="900"
        text-anchor="middle"
        dominant-baseline="auto"
        fill="white"
        stroke="black"
        stroke-width="${stroke}"
        stroke-linejoin="round"
        paint-order="stroke fill"
        letter-spacing="1"
      >${escapeXml(line)}</text>`;
    })
    .join("\n");

  const bottomBlocks = bottomLines
    .map((line, i) => {
      const y = h - PADDING - (bottomLines.length - 1 - i) * lineH;
      return `<text
        x="${w / 2}" y="${y}"
        font-family="Arial Black, Impact, sans-serif"
        font-size="${fontSize}"
        font-weight="900"
        text-anchor="middle"
        dominant-baseline="auto"
        fill="white"
        stroke="black"
        stroke-width="${stroke}"
        stroke-linejoin="round"
        paint-order="stroke fill"
        letter-spacing="1"
      >${escapeXml(line)}</text>`;
    })
    .join("\n");

  const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    ${topBlocks}
    ${bottomBlocks}
  </svg>`;

  return Buffer.from(svg);
}

export async function compositeMeme(
  topText: string,
  bottomText: string,
  uploadedImageBase64?: string,
  uploadedImageMimeType?: string
): Promise<Buffer> {
  const enimPath = path.join(process.cwd(), "public", "hotenim.jpg");
  let baseBuffer: Buffer;

  if (fs.existsSync(enimPath)) {
    baseBuffer = fs.readFileSync(enimPath);
  } else {
    baseBuffer = await sharp({
      create: {
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        channels: 3,
        background: { r: 15, g: 8, b: 35 },
      },
    })
      .jpeg()
      .toBuffer();
  }

  const base = await sharp(baseBuffer)
    .resize(CANVAS_WIDTH, CANVAS_HEIGHT, { fit: "cover", position: "center" })
    .toBuffer();

  const compositeSteps: sharp.OverlayOptions[] = [];

  if (uploadedImageBase64 && uploadedImageMimeType) {
    const uploadedBuffer = Buffer.from(uploadedImageBase64, "base64");
    const overlaySize = 180;
    const overlayPad = 16;

    const circleMask = Buffer.from(
      `<svg width="${overlaySize}" height="${overlaySize}">
        <circle cx="${overlaySize / 2}" cy="${overlaySize / 2}" r="${overlaySize / 2}" fill="white"/>
      </svg>`
    );

    const overlayImg = await sharp(uploadedBuffer)
      .resize(overlaySize, overlaySize, { fit: "cover", position: "center" })
      .composite([{ input: circleMask, blend: "dest-in" }])
      .png()
      .toBuffer();

    compositeSteps.push({
      input: overlayImg,
      top: overlayPad,
      left: CANVAS_WIDTH - overlaySize - overlayPad,
      blend: "over",
    });
  }

  const topLines = wrapText(topText, 20);
  const bottomLines = wrapText(bottomText, 20);
  const textSvg = buildTextSvg(topLines, bottomLines, CANVAS_WIDTH, CANVAS_HEIGHT);

  compositeSteps.push({
    input: textSvg,
    top: 0,
    left: 0,
    blend: "over",
  });

  return sharp(base)
    .composite(compositeSteps)
    .jpeg({ quality: 92 })
    .toBuffer();
}
