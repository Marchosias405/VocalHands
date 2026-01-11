import { GoogleGenAI } from "@google/genai";

/**
 * Cleans up raw detected words into a nicer sentence.
 * If key is missing or call fails, returns the raw text.
 */
export async function cleanWithGemini(
  raw: string,
  apiKey?: string
): Promise<string> {
  const text = (raw || "").trim();
  if (!text) return "";

  if (!apiKey) return text;

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt =
      `Rewrite the following sign-recognition transcript into natural English.\n` +
      `Rules:\n` +
      `- Keep meaning\n` +
      `- Add punctuation\n` +
      `- Remove repeated words\n` +
      `- Don't add new info\n\n` +
      `Transcript: "${text}"`;

    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const out = (res.text || "").trim();
    return out || text;
  } catch (e) {
    console.warn("Gemini cleanup failed, falling back to raw text:", e);
    return text;
  }
}
