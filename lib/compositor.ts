import sharp from "sharp";
import path from "path";
import fs from "fs";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 800;
const FONT_SIZE_TOP = 52;
const FONT_SIZE_BOTTOM = 52;
const PADDING = 24;
const STROKE_WIDTH = 6;

function wrapText(text: string, maxCharsPerLine = 22): string[] {
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

function makeSvgText(
  lines: string[],
  yStart: number,
  fontSize: number,
  position: "top" | "bottom"
): string {
  const lineHeight = fontSize * 1.2;
  const totalHeight = lines.length * lineHeight;
  const startY = position === "bottom" ? yStart - totalHeight + lineHeight : yStart;

  return lines
    .map((line, i) => {
      const y = startY + i * lineHeight;
      return `
      <text
        x="${CANVAS_WIDTH / 2}"
        y="${y}"
        font-family="Impact, Arial Black, sans-serif"
        font-size="${fontSize}"
        font-weight="900"
        text-anchor="middle"
        fill="white"
        stroke="black"
        stroke-width="${STROKE_WIDTH}"
        paint-order="stroke fill"
        letter-spacing="2"
      >${escapeXml(line)}</text>`;
    })
    .join("\n");
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function compositeMeme(
  topText: string,
  bottomText: string,
  uploadedImageBase64?: string,
  uploadedImageMimeType?: string
): Promise<Buffer> {
  // Load /hotenim.jpg from public folder
  const enimPath = path.join(process.cwd(), "public", "hotenim.jpg");
  let enimBuffer: Buffer;

  if (fs.existsSync(enimPath)) {
    enimBuffer = fs.readFileSync(enimPath);
  } else {
    // Fallback: create a placeholder gradient background
    enimBuffer = await sharp({
      create: {
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        channels: 3,
        background: { r: 20, g: 10, b: 40 },
      },
    })
      .jpeg()
      .toBuffer();
  }

  // Resize enim to fill canvas
  const enimResized = await sharp(enimBuffer)
    .resize(CANVAS_WIDTH, CANVAS_HEIGHT, { fit: "cover", position: "center" })
    .toBuffer();

  // If user uploaded an image, composite it as a smaller overlay (top-right)
  let compositeSteps: sharp.OverlayOptions[] = [];

  if (uploadedImageBase64 && uploadedImageMimeType) {
    const uploadedBuffer = Buffer.from(uploadedImageBase64, "base64");
    const uploadedResized = await sharp(uploadedBuffer)
      .resize(200, 200, { fit: "cover" })
      .toBuffer();

    compositeSteps.push({
      input: uploadedResized,
      top: 16,
      left: CANVAS_WIDTH - 216,
      blend: "over",
    });
  }

  // Build SVG text overlay
  const topLines = wrapText(topText, 22);
  const bottomLines = wrapText(bottomText, 22);

  const svgOverlay = `
  <svg width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    ${makeSvgText(topLines, PADDING + FONT_SIZE_TOP, FONT_SIZE_TOP, "top")}
    ${makeSvgText(bottomLines, CANVAS_HEIGHT - PADDING, FONT_SIZE_BOTTOM, "bottom")}
  </svg>`;

  compositeSteps.push({
    input: Buffer.from(svgOverlay),
    top: 0,
    left: 0,
    blend: "over",
  });

  const output = await sharp(enimResized)
    .composite(compositeSteps)
    .jpeg({ quality: 90 })
    .toBuffer();

  return output;
}
