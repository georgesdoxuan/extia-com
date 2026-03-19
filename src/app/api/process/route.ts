import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { EXTIA_CONTEXT } from "@/lib/extiaContext";
import { EXTIA_LINKEDIN_STYLE_GUIDE } from "@/lib/linkedinStyleGuide";
import { LINKEDIN_CAROUSEL_SLIDES_PROMPT, parseLinkedinSlides } from "@/lib/linkedinCarouselSlides";
import { SEO_ARTICLE_STRUCTURE_FR } from "@/lib/seoArticlePrompt";

type ProcessRequest = {
  url?: string;
};

function extractRetryAfterSeconds(message: string): number | null {
  const m1 = message.match(/Please retry in\s+(\d+(?:\.\d+)?)s/i);
  if (m1?.[1]) return Math.max(1, Math.round(Number(m1[1])));
  const m2 = message.match(/retryDelay\"\s*:\s*\"(\d+)s\"/i);
  if (m2?.[1]) return Math.max(1, Number(m2[1]));
  return null;
}

function throwUserFacingGeminiError(lastError: unknown, candidates: string[]): never {
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

  throw new Error(`Erreur Gemini (modèles testés: ${candidates.join(", ")}). ${msg}`.trim());
}

function extractYouTubeVideoId(input: string): string | null {
  try {
    const url = new URL(input);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = url.pathname.replace("/", "").trim();
      return id || null;
    }

    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      // https://www.youtube.com/watch?v=VIDEOID
      const v = url.searchParams.get("v");
      if (v) return v;

      // https://www.youtube.com/shorts/VIDEOID
      const shorts = url.pathname.match(/^\/shorts\/([^/?#]+)/)?.[1];
      if (shorts) return shorts;

      // https://www.youtube.com/live/VIDEOID
      const live = url.pathname.match(/^\/live\/([^/?#]+)/)?.[1];
      if (live) return live;
    }

    return null;
  } catch {
    return null;
  }
}

async function fetchYouTubeOEmbed(videoUrl: string): Promise<{
  title: string;
  author_name: string;
  author_url?: string;
}> {
  const oembedUrl = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(videoUrl)}`;
  const res = await fetch(oembedUrl, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Impossible de vérifier la vidéo (oEmbed HTTP ${res.status}).`);
  }
  return (await res.json()) as { title: string; author_name: string; author_url?: string };
}

async function fetchTranscriptFromApi(videoId: string): Promise<string> {
  const token = process.env.YT_TRANSCRIPT_API_TOKEN;
  if (!token) {
    throw new Error("Clé API YouTube Transcript manquante côté serveur (YT_TRANSCRIPT_API_TOKEN).");
  }

  const res = await fetch("https://www.youtube-transcript.io/api/transcripts", {
    method: "POST",
    headers: {
      Authorization: `Basic ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ids: [videoId] }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Erreur API transcript (HTTP ${res.status}). ${text}`.trim());
  }

  const data = (await res.json()) as unknown;

  // Parsing robuste: l'API ne garantit pas un schéma unique selon les vidéos.
  // On tente d'extraire:
  // - un transcript string
  // - ou un tableau de segments avec champ `text`
  // - ou toute liste de strings plausible trouvée en profondeur

  function normalizeText(s: string) {
    return s.replace(/\s+/g, " ").trim();
  }

  function collectTextSegments(node: unknown, out: string[], depth = 0) {
    if (depth > 12) return; // garde-fou
    if (node == null) return;

    if (typeof node === "string") {
      const t = normalizeText(node);
      if (t.length >= 2) out.push(t);
      return;
    }

    if (Array.isArray(node)) {
      for (const item of node) collectTextSegments(item, out, depth + 1);
      return;
    }

    if (typeof node === "object") {
      const obj = node as Record<string, unknown>;

      // Cas typique: segment { text: "..." }
      if (typeof obj.text === "string") {
        const t = normalizeText(obj.text);
        if (t) out.push(t);
      }

      // Certains schémas: { transcript: "..." } ou { transcript: [...] }
      if (typeof obj.transcript === "string") {
        const t = normalizeText(obj.transcript);
        if (t) out.push(t);
      } else if (obj.transcript) {
        collectTextSegments(obj.transcript, out, depth + 1);
      }

      // Autres clés possibles
      const candidates = ["transcripts", "items", "segments", "data", "results", "videos", "captions"];
      for (const key of candidates) {
        if (key in obj) collectTextSegments(obj[key], out, depth + 1);
      }

      // Parcours générique (dernier recours)
      for (const value of Object.values(obj)) collectTextSegments(value, out, depth + 1);
    }
  }

  // 1) Si la racine est un tableau, on priorise le 1er élément (ids=[1]) mais on garde un fallback.
  const roots = Array.isArray(data) ? [data[0], data] : [data];
  for (const root of roots) {
    const segs: string[] = [];
    collectTextSegments(root, segs);
    const text = normalizeText(segs.join(" "));
    if (text.length > 20) return text;
  }

  throw new Error("Transcription introuvable (format non supporté).");
}

async function generateWithGemini(input: {
  videoUrl: string;
  videoTitle: string;
  channelName: string;
  transcript: string;
}): Promise<{
  ideas: string[];
  seoArticle: string;
  linkedinCarousel: { slides: { title: string; bullets: string[] }[]; caption: string; hashtags: string[] };
}> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Clé Gemini manquante côté serveur (GEMINI_API_KEY).");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  async function listAvailableModelNames(): Promise<string[]> {
    // Le SDK ne fournit pas toujours un listModels stable selon versions.
    // On utilise l’endpoint REST officiel pour récupérer les modèles accessibles à la clé.
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = (await res.json()) as any;
    const models = Array.isArray(json?.models) ? json.models : [];
    return models
      .map((m: any) => (typeof m?.name === "string" ? m.name : ""))
      .filter(Boolean);
  }

  function modelConfig(model: string, forceJson: boolean) {
    return genAI.getGenerativeModel({
      model,
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 2048,
        ...(forceJson ? { responseMimeType: "application/json" } : {}),
      },
    });
  }

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
    promptText: string,
  ): Promise<any> {
    const retryPrompt = `${promptText}\n\nIMPORTANT: Réponds UNIQUEMENT avec un objet JSON valide. Aucun texte avant/après.`;
    const retryRes = await model.generateContent(retryPrompt);
    const retryText = retryRes.response.text();
    const extracted = extractFirstJsonObject(retryText);
    if (!extracted) {
      throw new Error("Impossible d'extraire un JSON dans la réponse IA (même après relance stricte).");
    }
    JSON.parse(extracted);
    return {
      response: {
        text: () => extracted,
      },
    } as any;
  }

  async function generateJson(prompt: string) {
    const available = (await listAvailableModelNames()).map(normalizeModelName);
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

    let lastError: unknown = null;
    for (const modelName of candidates) {
      // 1) Essai avec réponse JSON forcée (quand supporté)
      try {
        const model = modelConfig(modelName, true);
        const res = await model.generateContent(prompt);
        const text = res.response.text();
        // Valide rapidement que c'est du JSON; sinon on retentera sans forcing
        JSON.parse(text);
        return res;
      } catch (e) {
        lastError = e;
      }

      // 2) Essai sans responseMimeType (plus compatible), on extrait le 1er objet JSON
      try {
        const model = modelConfig(modelName, false);
        const res = await model.generateContent(prompt);
        const text = res.response.text();
        const extracted = extractFirstJsonObject(text);
        if (!extracted) return await forceJsonRetry(model, prompt);
        JSON.parse(extracted);

        // On retourne un objet "compatible" avec le reste du code (response.text() doit donner le JSON).
        return {
          response: {
            text: () => extracted,
          },
        } as any;
      } catch (e) {
        lastError = e;
      }
    }

    throwUserFacingGeminiError(lastError, candidates);
  }

  function htmlToMarkdownish(input: string) {
    let s = input;
    // Normalize newlines
    s = s.replace(/\r\n/g, "\n");
    // Headings
    s = s.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "\n\n## $1\n");
    s = s.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "\n\n### $1\n");
    // Paragraphs and breaks
    s = s.replace(/<br\s*\/?>/gi, "\n");
    s = s.replace(/<\/p>\s*<p[^>]*>/gi, "\n\n");
    s = s.replace(/<p[^>]*>/gi, "");
    s = s.replace(/<\/p>/gi, "\n");
    // Strong/emphasis
    s = s.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "**$1**");
    s = s.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, "_$1_");
    // Links
    s = s.replace(/<a[^>]*href=\"([^\"]+)\"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)");
    // Lists
    s = s.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "\n- $1");
    s = s.replace(/<\/ul>/gi, "\n");
    s = s.replace(/<ul[^>]*>/gi, "\n");
    // Remove remaining tags
    s = s.replace(/<[^>]+>/g, "");
    // Decode a few common entities
    s = s.replace(/&nbsp;/g, " ");
    s = s.replace(/&amp;/g, "&");
    s = s.replace(/&quot;/g, "\"");
    s = s.replace(/&#39;/g, "'");
    // Cleanup spacing
    s = s.replace(/[ \t]+\n/g, "\n");
    s = s.replace(/\n{3,}/g, "\n\n");
    return s.trim();
  }

  function normalizeSeoArticle(article: string) {
    let s = article.trim();
    if (!s) return s;
    // If it looks like HTML, convert to readable text first.
    if (/[<][a-z][\s\S]*[>]/i.test(s) && /<\/(h2|h3|p|ul|li|a|strong)>/i.test(s)) {
      s = htmlToMarkdownish(s);
    }
    // Remove Markdown heading markers like "## " / "### " while keeping the title text.
    s = s.replace(/^\s{0,3}#{1,6}\s+/gm, "");
    // Remove common Markdown emphasis markers while keeping the inner text.
    // Bold: **text** or __text__
    s = s.replace(/\*\*([^*]+)\*\*/g, "$1");
    s = s.replace(/__([^_]+)__/g, "$1");
    // Italic: *text* or _text_ (avoid catching bullet "* " at line start)
    s = s.replace(/(^|[^\*])\*([^*\n]+)\*(?!\*)/g, "$1$2");
    s = s.replace(/(^|[^_])_([^_\n]+)_(?!_)/g, "$1$2");

    // Ensure readable layout:
    // - avoid 1 sentence per paragraph
    // - avoid ALL CAPS headings
    // - keep FAQ readable (no orphan "1." lines)

    // Normalize weird line breaks first
    s = s.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n");

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
          // keep acronyms like "OSBD" if already uppercase in original
          if (/\bOSBD\b/.test(line)) {
            w = w.replace(/\bosbd\b/, "OSBD");
          }
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
      if (isAllCaps(t)) return true;
      if (/^(conclusion|foire aux questions|faq)\b/i.test(t)) return true;
      if (t.endsWith(":")) return true;
      return false;
    };

    // Fix orphan FAQ numbering lines: "1." followed by blank then question
    s = s.replace(/\n(\d+)\.\s*\n+\s*/g, "\n$1. ");

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
      if (!line) {
        // don't flush immediately; we regroup sentences into real paragraphs
        continue;
      }

      if (isHeadingLike(line)) {
        flushParagraph();
        const heading = isAllCaps(line) ? titleCase(line) : line;
        out.push(heading, "");
        continue;
      }

      // List item stays on its own line
      if (line.startsWith("- ")) {
        flushParagraph();
        out.push(line, "");
        continue;
      }

      paragraph.push(line);

      // If paragraph is long enough, flush to avoid giant blocks
      const joinedLen = paragraph.join(" ").length;
      if (joinedLen > 260) flushParagraph();
    }

    flushParagraph();

    // Remove trailing blank lines
    while (out.length && out[out.length - 1] === "") out.pop();
    let formatted = out.join("\n").trim();

    // Hard fallback: if it still looks like a single block (no blank lines),
    // rebuild paragraphs from sentences (2–3 sentences per paragraph).
    const blankLines = (formatted.match(/\n\s*\n/g) || []).length;
    if (blankLines < 2) {
      // Preserve simple headings if present by splitting on double newlines first
      const raw = s.replace(/\n{3,}/g, "\n\n");
      const chunks = raw
        .split(/\n{2,}/)
        .map((c) => c.trim())
        .filter(Boolean);

      const rebuilt: string[] = [];
      for (const chunk of chunks) {
        if (isHeadingLike(chunk)) {
          rebuilt.push(isAllCaps(chunk) ? titleCase(chunk) : chunk, "");
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
    return [
      head,
      "\n\n[... transcript tronqué pour performance (Netlify timeout) ...]\n\n",
      tail,
    ].join("");
  }

  const prompt = `
Tu es un expert en content marketing B2B (FR) pour Extia.

Contexte Extia:
${EXTIA_CONTEXT}

Style LinkedIn Extia (caption + carousel uniquement):
${EXTIA_LINKEDIN_STYLE_GUIDE}

${LINKEDIN_CAROUSEL_SLIDES_PROMPT}

Source:
- URL: ${input.videoUrl}
- Titre: ${input.videoTitle}
- Chaîne: ${input.channelName}

Transcript brut (peut contenir des erreurs):
${condenseTranscriptForAi(input.transcript)}

${SEO_ARTICLE_STRUCTURE_FR}

Génère STRICTEMENT un JSON valide (pas de markdown), avec ce schéma:
{
  "ideas": ["...", "...", "...", "...", "..."],
  "seoArticle": "texte complet : titre ligne 1 puis structure ci-dessus (pas HTML/Markdown, pas puces)",
  "linkedinCarousel": {
    "slides": [
      { "type": "cover", "title": "…", "bullets": [] },
      { "type": "content", "title": "…", "bullets": ["…"] },
      … (5 ou 6 content) …
      { "type": "cta", "title": "…", "bullets": ["…"] }
    ],
    "caption": "Texte de post LinkedIn (FR) + CTA",
    "hashtags": ["#...", "#..."]
  }
}

Contraintes:
- 5 idées clés: courtes, actionnables, fidèles au transcript.
- Article SEO: respecter SEO_ARTICLE_STRUCTURE_FR (450–700 mots, questions de section, pas de puces).
- Carousel LinkedIn: 1 cover + 5 ou 6 slides contenu + 1 CTA (voir structure ci-dessus).
- Caption LinkedIn + hashtags: respecter le guide de style LinkedIn Extia ci-dessus (structure, emojis modérés, CTA clair, hashtags en fin).
- Ne pas inventer de faits (chiffres, clients, labels) hors transcript + contexte.
`.trim();

  const result = await generateJson(prompt);
  const text = result.response.text();

  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Réponse IA illisible (JSON invalide).");
  }

  const ideas = Array.isArray(parsed?.ideas) ? parsed.ideas.filter((x: any) => typeof x === "string") : [];
  const seoArticle = typeof parsed?.seoArticle === "string" ? normalizeSeoArticle(parsed.seoArticle) : "";
  const slides = Array.isArray(parsed?.linkedinCarousel?.slides) ? parsed.linkedinCarousel.slides : [];
  const caption = typeof parsed?.linkedinCarousel?.caption === "string" ? parsed.linkedinCarousel.caption : "";
  const hashtags = Array.isArray(parsed?.linkedinCarousel?.hashtags)
    ? parsed.linkedinCarousel.hashtags.filter((x: any) => typeof x === "string")
    : [];

  const normSlides = parseLinkedinSlides(slides);
  if (ideas.length !== 5 || !seoArticle || seoArticle.length < 800 || !normSlides || !caption) {
    throw new Error("Réponse IA incomplète (champs manquants, article trop court ou carousel invalide).");
  }

  return {
    ideas: ideas.slice(0, 5),
    seoArticle,
    linkedinCarousel: {
      slides: normSlides,
      caption,
      hashtags,
    },
  };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ProcessRequest;
    const url = typeof body?.url === "string" ? body.url.trim() : "";
    if (!url) {
      return NextResponse.json({ error: "URL manquante." }, { status: 400 });
    }

    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
      return NextResponse.json({ error: "URL YouTube invalide (videoId introuvable)." }, { status: 400 });
    }

    const oembed = await fetchYouTubeOEmbed(url);
    const channelName = oembed.author_name || "";
    const isExtia = /extia/i.test(channelName) || /extia/i.test(oembed.title || "");
    if (!isExtia) {
      return NextResponse.json(
        {
          error:
            "Cette vidéo ne semble pas provenir d’Extia (restriction: uniquement des vidéos Extia). Vérifie la chaîne YouTube.",
        },
        { status: 403 },
      );
    }

    const transcript = await fetchTranscriptFromApi(videoId);
    const generated = await generateWithGemini({
      videoUrl: url,
      videoTitle: oembed.title,
      channelName,
      transcript,
    });

    return NextResponse.json({
      video: { id: videoId, url, title: oembed.title, channelName },
      transcript,
      ...generated,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur inconnue.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

