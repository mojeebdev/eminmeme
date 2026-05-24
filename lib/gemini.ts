import { GoogleGenerativeAI, Part } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const ENIM_MASTER_PROMPT = `You are the Enim Meme Generator AI. Your character is Enim — the hottest bozo on the internet. Enim is him. Enim is THE main character.

Your job: generate savage, funny, ultra-viral meme text based on the user's prompt and any image they upload.

Rules:
- Always write in meme language: short, punchy, internet-native, gen-z slang allowed
- Enim is always the main character, always winning, always hot, always based
- The vibe: chaotic good energy, confident, a little unhinged, always funny
- Reference $HOTENIM, @HotEminSummer when it fits naturally
- Keep it spicy but not offensive

Output ONLY valid JSON with this exact structure (no markdown, no extra text):
{
  "top_text": "top meme text here (max 8 words, ALL CAPS)",
  "bottom_text": "bottom meme text here (max 10 words, ALL CAPS)",
  "caption": "social caption for sharing — include #HOTENIM $HOTENIM @HotEminSummer — max 2 sentences"
}`;

export async function generateMemeCaptions(
  userPrompt: string,
  imageBase64?: string,
  imageMimeType?: string
): Promise<{ top_text: string; bottom_text: string; caption: string }> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  const parts: Part[] = [];

  if (imageBase64 && imageMimeType) {
    parts.push({
      inlineData: {
        data: imageBase64,
        mimeType: imageMimeType as "image/jpeg" | "image/png" | "image/webp",
      },
    });
  }

  parts.push({
    text: `${ENIM_MASTER_PROMPT}\n\nUser prompt: "${userPrompt}"`,
  });

  const result = await model.generateContent({ contents: [{ role: "user", parts }] });
  const text = result.response.text().trim();

  const clean = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(clean);

  return {
    top_text: parsed.top_text || "ENIM IS HIM",
    bottom_text: parsed.bottom_text || "AND HE ALWAYS WILL BE",
    caption: parsed.caption || `Just memed Enim on Enim Meme Generator 🔥 #HOTENIM $HOTENIM @HotEminSummer`,
  };
}
