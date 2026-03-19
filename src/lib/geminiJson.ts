import { GoogleGenerativeAI } from "@google/generative-ai";

function normalizeModelName(name: string) {
  return name.replace(/^models\//, "").trim();
}

function extractRetryAfterSeconds(message: string): number | null {
  // Examples:
  // - "Please retry in 59.31s."
  // - "\"retryDelay\":\"59s\""
  const m1 = message.match(/Please retry in\s+(\d+(?:\.\d+)?)s/i);
  if (m1?.[1]) return Math.max(1, Math.round(Number(m1[1])));
  const m2 = message.match(/retryDelay\"\s*:\s*\"(\d+)s\"/i);
  if (m2?.[1]) return Math.max(1, Number(m2[1]));
  return null;
}

function asUserFacingGeminiError(lastError: unknown, candidates: string[]): Error {
  const msg = lastError instanceof Error ? lastError.message : String(lastError);
  const lowered = msg.toLowerCase();
  const isQuota =
    lowered.includes("429") ||
    lowered.includes("too many requests") ||
    lowered.includes("quota exceeded") ||
    lowered.includes("rate limit");

  if (isQuota) {
    const retry = extractRetryAfterSeconds(msg);
    const hint = retry ? `Réessaie dans ~${retry}s.` : "Réessaie dans une minute.";
    return new Error(
      `Limite Gemini atteinte (quota). ${hint} Si ça revient souvent, augmente le quota/active la facturation côté Google AI.`,
    );
  }

  return new Error(`Erreur Gemini (modèles testés: ${candidates.join(", ")}). ${msg}`.trim());
}

function parseIfJsonObject(input: string): string | null {
  try {
    const parsed = JSON.parse(input.trim());
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return JSON.stringify(parsed);
    }
  } catch {
    // ignore
  }
  return null;
}

function extractBalancedJsonObject(text: string): string | null {
  const start = text.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === "\"") {
        inString = false;
      }
      continue;
    }
    if (ch === "\"") {
      inString = true;
      continue;
    }
    if (ch === "{") depth++;
    if (ch === "}") depth--;
    if (depth === 0) return text.slice(start, i + 1);
  }
  return null;
}

function extractFirstJsonObject(text: string): string | null {
  const direct = parseIfJsonObject(text);
  if (direct) return direct;

  const fenced = Array.from(text.matchAll(/```(?:json)?\s*([\s\S]*?)```/gi));
  for (const m of fenced) {
    const block = m[1] ?? "";
    const parsed = parseIfJsonObject(block);
    if (parsed) return parsed;
    const extracted = extractBalancedJsonObject(block);
    if (extracted && parseIfJsonObject(extracted)) return extracted;
  }

  const extracted = extractBalancedJsonObject(text);
  if (!extracted) return null;
  return parseIfJsonObject(extracted) ? extracted : null;
}

async function forceJsonRetry(model: ReturnType<GoogleGenerativeAI["getGenerativeModel"]>, prompt: string): Promise<string> {
  const retryPrompt = `${prompt}\n\nIMPORTANT: Réponds UNIQUEMENT avec un objet JSON valide. Aucun texte avant/après.`;
  const retryRes = await model.generateContent(retryPrompt);
  const retryText = retryRes.response.text();
  const extracted = extractFirstJsonObject(retryText);
  if (!extracted) {
    throw new Error("Impossible d'extraire un JSON dans la réponse IA (même après relance stricte).");
  }
  JSON.parse(extracted);
  return extracted;
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
      if (!extracted) {
        return await forceJsonRetry(model, prompt);
      }
      JSON.parse(extracted);
      return extracted;
    } catch (e) {
      lastError = e;
    }
  }

  throw asUserFacingGeminiError(lastError, candidates);
}
