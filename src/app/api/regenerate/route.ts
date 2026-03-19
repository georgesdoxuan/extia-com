import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { EXTIA_CONTEXT } from "@/lib/extiaContext";
import { EXTIA_LINKEDIN_STYLE_GUIDE } from "@/lib/linkedinStyleGuide";
import { LINKEDIN_CAROUSEL_SLIDES_PROMPT, parseLinkedinSlides } from "@/lib/linkedinCarouselSlides";
import { SEO_ARTICLE_STRUCTURE_FR } from "@/lib/seoArticlePrompt";

type RegenerateRequest = {
  kind?: "seo" | "linkedin";
  video?: { url: string; title: string; channelName: string };
  transcript?: string;
  previous?: {
    seoArticle?: string;
    linkedinCaption?: string;
    linkedinSlidesText?: string;
  };
};

function normalizeModelName(name: string) {
  return name.replace(/^models\//, "").trim();
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

async function forceJsonRetry(
  model: ReturnType<GoogleGenerativeAI["getGenerativeModel"]>,
  prompt: string,
): Promise<string> {
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
  const json = (await res.json()) as any;
  const models = Array.isArray(json?.models) ? json.models : [];
  return models.map((m: any) => (typeof m?.name === "string" ? m.name : "")).filter(Boolean);
}

function modelConfig(genAI: GoogleGenerativeAI, model: string, forceJson: boolean) {
  return genAI.getGenerativeModel({
    model,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
      ...(forceJson ? { responseMimeType: "application/json" } : {}),
    },
  });
}

function extractRetryAfterSeconds(message: string): number | null {
  const m1 = message.match(/Please retry in\s+(\d+(?:\.\d+)?)s/i);
  if (m1?.[1]) return Math.max(1, Math.round(Number(m1[1])));
  const m2 = message.match(/retryDelay\"\s*:\s*\"(\d+)s\"/i);
  if (m2?.[1]) return Math.max(1, Number(m2[1]));
  return null;
}

function throwUserFacingGeminiError(lastError: unknown): never {
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
    throw new Error(
      `Limite Gemini atteinte (quota). ${hint} Si ça revient souvent, augmente le quota/active la facturation côté Google AI.`,
    );
  }

  throw new Error(`Erreur Gemini. ${msg}`.trim());
}

async function generateJson(apiKey: string, prompt: string) {
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
    throw new Error(`Modèle Gemini introuvable/insupporté. Modèles disponibles: ${available.slice(0, 20).join(", ")}`);
  }

  let lastError: unknown = null;
  for (const modelName of candidates) {
    try {
      const model = modelConfig(genAI, modelName, true);
      const res = await model.generateContent(prompt);
      JSON.parse(res.response.text());
      return res.response.text();
    } catch (e) {
      lastError = e;
    }

    try {
      const model = modelConfig(genAI, modelName, false);
      const res = await model.generateContent(prompt);
      const raw = res.response.text();
      const extracted = extractFirstJsonObject(raw);
      if (!extracted) return await forceJsonRetry(model, prompt);
      JSON.parse(extracted);
      return extracted;
    } catch (e) {
      lastError = e;
    }
  }

  throwUserFacingGeminiError(lastError);
}

function htmlToMarkdownish(input: string) {
  let s = input;
  s = s.replace(/\r\n/g, "\n");
  s = s.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "\n\n## $1\n");
  s = s.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "\n\n### $1\n");
  s = s.replace(/<br\s*\/?>/gi, "\n");
  s = s.replace(/<\/p>\s*<p[^>]*>/gi, "\n\n");
  s = s.replace(/<p[^>]*>/gi, "");
  s = s.replace(/<\/p>/gi, "\n");
  s = s.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "**$1**");
  s = s.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, "_$1_");
  s = s.replace(/<a[^>]*href=\"([^\"]+)\"[^>]*>([\s\S]*?)<\/a>/gi, "$2 ($1)");
  s = s.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "\n- $1");
  s = s.replace(/<\/ul>/gi, "\n");
  s = s.replace(/<ul[^>]*>/gi, "\n");
  s = s.replace(/<[^>]+>/g, "");
  s = s.replace(/&nbsp;/g, " ");
  s = s.replace(/&amp;/g, "&");
  s = s.replace(/&quot;/g, "\"");
  s = s.replace(/&#39;/g, "'");
  s = s.replace(/[ \t]+\n/g, "\n");
  s = s.replace(/\n{3,}/g, "\n\n");
  return s.trim();
}

function normalizeSeoArticle(article: string) {
  let s = article.trim();
  if (!s) return s;
  if (/[<][a-z][\s\S]*[>]/i.test(s) && /<\/(h2|h3|p|ul|li|a|strong)>/i.test(s)) s = htmlToMarkdownish(s);

  s = s.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n");
  // Strip bold markers in non-heading lines
  s = s
    .split("\n")
    .map((line) => (line.trimStart().startsWith("#") ? line : line.replace(/\*\*([^*]+)\*\*/g, "$1")))
    .join("\n");
  s = s.replace(/\n(\d+)\.\s*\n+\s*/g, "\n$1. ");

  const stopWords = new Set([
    "de",
    "du",
    "des",
    "la",
    "le",
    "les",
    "et",
    "à",
    "au",
    "aux",
    "en",
    "dans",
    "pour",
    "sur",
    "avec",
    "sans",
    "un",
    "une",
    "d'",
    "l'",
  ]);

  const isAllCaps = (line: string) => {
    const letters = line.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ]/g, "");
    return letters.length >= 8 && letters === letters.toUpperCase();
  };

  const titleCase = (line: string) => {
    const lower = line.toLowerCase();
    const words = lower.split(/\s+/).filter(Boolean);
    return words
      .map((w, idx) => {
        if (/\bOSBD\b/.test(line)) w = w.replace(/\bosbd\b/, "OSBD");
        if (idx !== 0 && stopWords.has(w)) return w;
        return w.charAt(0).toUpperCase() + w.slice(1);
      })
      .join(" ")
      .replace(/\bExtia\b/g, "Extia")
      .replace(/\bIa\b/g, "IA");
  };

  const isHeadingLike = (line: string) => {
    const t = line.trim();
    if (!t) return false;
    if (t.startsWith("## ") || t.startsWith("### ")) return true;
    if (isAllCaps(t)) return true;
    if (/^(conclusion|foire aux questions|faq)\b/i.test(t)) return true;
    if (t.endsWith("?")) return true;
    return false;
  };

  const sentenceSplit = (input: string) =>
    input
      .replace(/\s+/g, " ")
      .trim()
      .split(/(?<=[.!?])\s+(?=[A-ZÀ-ÖØ-Þ])/g)
      .map((x) => x.trim())
      .filter(Boolean);

  const lines = s.split("\n");
  const out: string[] = [];
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const text = paragraph.join(" ").replace(/\s+/g, " ").trim();
    if (text) out.push(text, "");
    paragraph = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (isHeadingLike(line)) {
      flushParagraph();
      let heading = isAllCaps(line) ? titleCase(line) : line;
      if (!heading.startsWith("#")) heading = `## ${heading}`;
      out.push(heading, "");
      continue;
    }
    if (line.startsWith("- ")) {
      flushParagraph();
      out.push(line, "");
      continue;
    }
    paragraph.push(line);
    if (paragraph.join(" ").length > 260) flushParagraph();
  }

  flushParagraph();
  while (out.length && out[out.length - 1] === "") out.pop();
  let formatted = out.join("\n").trim();

  const blankLines = (formatted.match(/\n\s*\n/g) || []).length;
  if (blankLines < 2) {
    const raw = s.replace(/\n{3,}/g, "\n\n");
    const chunks = raw
      .split(/\n{2,}/)
      .map((c) => c.trim())
      .filter(Boolean);

    const rebuilt: string[] = [];
    for (const chunk of chunks) {
      if (isHeadingLike(chunk)) {
        let heading = isAllCaps(chunk) ? titleCase(chunk) : chunk;
        if (!heading.startsWith("#")) heading = `## ${heading}`;
        rebuilt.push(heading, "");
        continue;
      }
      const sentences = sentenceSplit(chunk);
      if (sentences.length <= 2) {
        rebuilt.push(chunk.replace(/\s+/g, " ").trim(), "");
        continue;
      }
      for (let i = 0; i < sentences.length; i += 3) {
        rebuilt.push(sentences.slice(i, i + 3).join(" "), "");
      }
    }
    while (rebuilt.length && rebuilt[rebuilt.length - 1] === "") rebuilt.pop();
    formatted = rebuilt.join("\n");
  }

  return formatted.trim();
}

function condenseTranscriptForAi(transcript: string) {
  const t = transcript.replace(/\s+/g, " ").trim();
  const maxChars = 18000;
  if (t.length <= maxChars) return t;
  const head = t.slice(0, 9000);
  const tail = t.slice(-6000);
  return [head, "\n\n[... transcript tronqué pour performance (Netlify timeout) ...]\n\n", tail].join("");
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RegenerateRequest;
    const kind = body?.kind;
    const video = body?.video;
    const transcript = typeof body?.transcript === "string" ? body.transcript.trim() : "";

    if (kind !== "seo" && kind !== "linkedin") {
      return NextResponse.json({ error: "Paramètre kind invalide." }, { status: 400 });
    }
    if (!video?.url || !video?.title || !video?.channelName) {
      return NextResponse.json({ error: "Métadonnées vidéo manquantes." }, { status: 400 });
    }
    if (!transcript) {
      return NextResponse.json({ error: "Transcription manquante." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Clé Gemini manquante côté serveur (GEMINI_API_KEY)." }, { status: 500 });

    const antiHallucination = `
Règles anti-hallucination (strictes):
- Tu n'as droit qu'aux informations présentes dans le transcript brut et le contexte Extia ci-dessous.
- Si une info n'est pas explicitement dans le transcript: NE PAS l'inventer. À la place, reformule sans fait nouveau, ou indique \"(non mentionné dans la vidéo)\".
- Ne cite pas de clients, chiffres, labels, partenariats ou résultats non présents dans le transcript.
`.trim();

    const previousSeo = body?.previous?.seoArticle?.slice(0, 2500) ?? "";
    const previousCaption = body?.previous?.linkedinCaption?.slice(0, 1500) ?? "";
    const previousSlides = body?.previous?.linkedinSlidesText?.slice(0, 2500) ?? "";

    const prompt =
      kind === "seo"
        ? `
Tu écris un article SEO en français pour Extia.

Contexte Extia:
${EXTIA_CONTEXT}

${SEO_ARTICLE_STRUCTURE_FR}

${antiHallucination}

Source:
- URL: ${video.url}
- Titre: ${video.title}
- Chaîne: ${video.channelName}

Transcript brut:
${condenseTranscriptForAi(transcript)}

Article précédent (NE PAS REPRENDRE les mêmes formulations/angles; propose un autre angle):
${previousSeo}

Génère STRICTEMENT un JSON valide avec:
{ "seoArticle": "…" }
(le texte complet respectant la structure : titre ligne 1, chapeau, sections ## en questions, bullets - autorisés, **gras** autorisé, 450–700 mots environ)
`.trim()
        : `
Tu écris des contenus LinkedIn pour Extia.

Contexte Extia:
${EXTIA_CONTEXT}

Style LinkedIn Extia:
${EXTIA_LINKEDIN_STYLE_GUIDE}

${antiHallucination}

Source:
- URL: ${video.url}
- Titre: ${video.title}
- Chaîne: ${video.channelName}

Transcript brut:
${condenseTranscriptForAi(transcript)}

Post précédent (NE PAS REPRENDRE les mêmes formulations/structure; propose une variante):
Caption précédent:
${previousCaption}

Slides précédentes:
${previousSlides}

${LINKEDIN_CAROUSEL_SLIDES_PROMPT}

Génère STRICTEMENT un JSON valide (pas de markdown) avec:
{
  "linkedinCarousel": {
    "slides": [
      { "type": "cover", "title": "…", "bullets": [] },
      { "type": "content", "title": "…", "bullets": ["…"] },
      … (5 ou 6 slides content) …
      { "type": "cta", "title": "…", "bullets": ["…"] }
    ],
    "caption": "Post LinkedIn FR + CTA",
    "hashtags": ["#...","#..."]
  }
}
`.trim();

    const raw = await generateJson(apiKey, prompt);
    const parsed = JSON.parse(raw) as any;

    if (kind === "seo") {
      const seo = typeof parsed?.seoArticle === "string" ? normalizeSeoArticle(parsed.seoArticle) : "";
      if (!seo || seo.length < 1800) {
        return NextResponse.json({ error: "Réponse IA incomplète (article SEO manquant ou trop court)." }, { status: 500 });
      }
      return NextResponse.json({ seoArticle: seo });
    }

    const lc = parsed?.linkedinCarousel;
    const slides = Array.isArray(lc?.slides) ? lc.slides : [];
    const caption = typeof lc?.caption === "string" ? lc.caption : "";
    const hashtags = Array.isArray(lc?.hashtags) ? lc.hashtags.filter((x: any) => typeof x === "string") : [];

    const normSlides = parseLinkedinSlides(slides);

    if (!caption || !normSlides) {
      return NextResponse.json(
        { error: "Réponse IA incomplète (LinkedIn : 1 cover + 5–6 contenus + 1 CTA)." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      linkedinCarousel: { slides: normSlides, caption, hashtags },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur inconnue.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

