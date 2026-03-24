import { NextResponse } from "next/server";
import { EXTIA_CONTEXT } from "@/lib/extiaContext";
import { EXTIA_LINKEDIN_STYLE_GUIDE } from "@/lib/linkedinStyleGuide";
import { condenseTranscriptForAi } from "@/lib/condenseTranscript";
import { normalizeSeoArticle } from "@/lib/seoArticleNormalize";
import { SEO_ARTICLE_STRUCTURE_FR } from "@/lib/seoArticlePrompt";
import { generateGeminiJson } from "@/lib/geminiJson";
import { LINKEDIN_CAROUSEL_SLIDES_PROMPT, parseLinkedinSlides } from "@/lib/linkedinCarouselSlides";

type VideoMeta = { url: string; title: string; channelName: string };
type Body = {
  part?: "ideas" | "seo" | "linkedin";
  video?: VideoMeta;
  transcript?: string;
  additionalInstructions?: string;
};

function baseSource(video: VideoMeta, condensed: string) {
  return `
Source:
- URL: ${video.url}
- Titre: ${video.title}
- Chaîne: ${video.channelName}

Transcript brut (peut contenir des erreurs):
${condensed}
`.trim();
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const part = body?.part;
    const video = body?.video;
    const transcript = typeof body?.transcript === "string" ? body.transcript : "";
    const additionalInstructions = typeof body?.additionalInstructions === "string" ? body.additionalInstructions.trim() : "";

    if (part !== "ideas" && part !== "seo" && part !== "linkedin") {
      return NextResponse.json({ error: "part invalide (ideas | seo | linkedin)." }, { status: 400 });
    }
    if (!video?.url || !video.title) {
      return NextResponse.json({ error: "Métadonnées vidéo manquantes." }, { status: 400 });
    }
    if (!transcript.trim()) {
      return NextResponse.json({ error: "Transcript manquant." }, { status: 400 });
    }

    const condensed = condenseTranscriptForAi(transcript);
    const source = baseSource(video, condensed);
    const extraGuidance = additionalInstructions
      ? `\nInstructions supplémentaires fournies par l’utilisateur:\n${additionalInstructions}\n`
      : "";

    if (part === "ideas") {
      const prompt = `
Tu es un expert en content marketing B2B (FR) pour Extia.

Contexte Extia:
${EXTIA_CONTEXT}

${source}
${extraGuidance}

Génère STRICTEMENT un JSON valide (pas de markdown), schéma:
{ "ideas": ["...", "...", "...", "...", "..."] }

Contraintes:
- Exactement 5 idées clés, courtes, actionnables, fidèles au transcript.
- Ne pas inventer de faits (chiffres, clients, labels) hors transcript + contexte.
`.trim();

      const text = await generateGeminiJson(prompt, 1024);
      const parsed = JSON.parse(text) as { ideas?: unknown };
      const ideas = Array.isArray(parsed?.ideas)
        ? parsed.ideas.filter((x): x is string => typeof x === "string")
        : [];
      if (ideas.length !== 5) {
        return NextResponse.json({ error: "Réponse IA incomplète (5 idées attendues)." }, { status: 502 });
      }
      return NextResponse.json({ ideas: ideas.slice(0, 5) });
    }

    if (part === "seo") {
      const prompt = `
Tu es un expert en content marketing B2B (FR) pour Extia.

Contexte Extia:
${EXTIA_CONTEXT}

${SEO_ARTICLE_STRUCTURE_FR}

${source}
${extraGuidance}

Génère STRICTEMENT un objet JSON valide (sans balise de code ni enveloppe markdown autour du JSON), schéma:
{ "seoArticle": "..." }

L’article dans "seoArticle" DOIT utiliser le Markdown demandé (## pour les titres de section, - pour les bullets).
Ne pas inventer de faits hors transcript + contexte.
`.trim();

      const text = await generateGeminiJson(prompt, 8192);
      const parsed = JSON.parse(text) as { seoArticle?: unknown };
      const raw = typeof parsed?.seoArticle === "string" ? parsed.seoArticle : "";
      const seoArticle = normalizeSeoArticle(raw);
      const sentenceCount = (seoArticle.match(/[.!?](?:\s|$)/g) || []).length;
      if (!seoArticle || seoArticle.length < 1400 || sentenceCount < 8) {
        return NextResponse.json(
          { error: "Réponse IA incomplète (article SEO trop court). Relance la génération." },
          { status: 502 },
        );
      }
      return NextResponse.json({ seoArticle });
    }

    const prompt = `
Tu es un expert en content marketing B2B (FR) pour Extia.

Contexte Extia:
${EXTIA_CONTEXT}

Style LinkedIn Extia (caption + carousel):
${EXTIA_LINKEDIN_STYLE_GUIDE}

${LINKEDIN_CAROUSEL_SLIDES_PROMPT}

${source}
${extraGuidance}

Génère STRICTEMENT un JSON valide (pas de markdown), schéma:
{
  "linkedinCarousel": {
    "slides": [
      { "type": "cover", "title": "…", "bullets": [] },
      { "type": "content", "title": "…", "bullets": ["…", "…"] },
      … (5 ou 6 slides "content") …
      { "type": "cta", "title": "…", "bullets": ["…"] }
    ],
    "caption": "Post LinkedIn FR + CTA",
    "hashtags": ["#...", "#..."]
  }
}

Contraintes:
- Respecter exactement la structure cover → 5 ou 6 × content → cta (7 ou 8 slides).
- Caption + hashtags: guide Extia (emojis modérés, CTA clair, hashtags en fin).
- Ne pas inventer de faits hors transcript + contexte.
`.trim();

    const text = await generateGeminiJson(prompt, 2048);
    const parsed = JSON.parse(text) as { linkedinCarousel?: unknown };
    const lc = parsed?.linkedinCarousel as Record<string, unknown> | undefined;
    const slidesRaw = Array.isArray(lc?.slides) ? lc.slides : [];
    const caption = typeof lc?.caption === "string" ? lc.caption : "";
    const hashtags = Array.isArray(lc?.hashtags)
      ? lc.hashtags.filter((x): x is string => typeof x === "string")
      : [];

    const normalizedSlides = parseLinkedinSlides(slidesRaw);

    if (!normalizedSlides || !caption) {
      return NextResponse.json(
        { error: "Réponse IA incomplète (carousel : 1 cover + 5–6 contenus + 1 CTA attendus)." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      linkedinCarousel: {
        slides: normalizedSlides,
        caption,
        hashtags,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur inconnue.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
