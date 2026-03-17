import { GoogleGenerativeAI } from "@google/generative-ai";

function normalizeModelName(name: string) {
  return name.replace(/^models\//, "").trim();
}

function extractFirstJsonObject(text: string): string | null {
  const start = text.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (ch === "{") depth++;
    if (ch === "}") depth--;
    if (depth === 0) return text.slice(start, i + 1);
  }
  return null;
}

async function listAvailableModelNames(apiKey: string): Promise<string[]> {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const json = (await res.json()) as { models?: { name?: string }[] };
  const models = Array.isArray(json?.models) ? json.models : [];
  return models.map((m) => (typeof m?.name === "string" ? m.name : "")).filter(Boolean);
}

/**
 * Appelle Gemini et renvoie une chaîne JSON parsable (objet racine).
 * @param maxOutputTokens — plus élevé pour l’article SEO long
 */
export async function generateGeminiJson(prompt: string, maxOutputTokens = 2048): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Clé Gemini manquante côté serveur (GEMINI_API_KEY).");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const available = (await listAvailableModelNames(apiKey)).map(normalizeModelName);
  const preferred = [
    process.env.GEMINI_MODEL,
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-flash-latest",
    "gemini-pro-latest",
    "gemini-2.5-pro",
    "gemini-2.0-flash-lite",
    "gemini-flash-lite-latest",
  ]
    .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
    .map(normalizeModelName);

  const candidates = Array.from(new Set(preferred)).filter((m) => available.length === 0 || available.includes(m));
  if (candidates.length === 0) {
    throw new Error(
      `Modèle Gemini introuvable/insupporté. Modèles disponibles: ${available.slice(0, 20).join(", ")}`,
    );
  }

  function modelConfig(model: string, forceJson: boolean) {
    return genAI.getGenerativeModel({
      model,
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens,
        ...(forceJson ? { responseMimeType: "application/json" } : {}),
      },
    });
  }

  let lastError: unknown = null;
  for (const modelName of candidates) {
    try {
      const model = modelConfig(modelName, true);
      const res = await model.generateContent(prompt);
      const text = res.response.text();
      JSON.parse(text);
      return text;
    } catch (e) {
      lastError = e;
    }

    try {
      const model = modelConfig(modelName, false);
      const res = await model.generateContent(prompt);
      const text = res.response.text();
      const extracted = extractFirstJsonObject(text);
      if (!extracted) throw new Error("Impossible d'extraire un JSON dans la réponse IA.");
      JSON.parse(extracted);
      return extracted;
    } catch (e) {
      lastError = e;
    }
  }

  const msg = lastError instanceof Error ? lastError.message : String(lastError);
  throw new Error(`Erreur Gemini (modèles testés: ${candidates.join(", ")}). ${msg}`.trim());
}
