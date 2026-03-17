/** Une slide du carousel : couverture (titre), contenu (puces), ou CTA final. */
export type LinkedinSlide = {
  type: "cover" | "content" | "cta";
  title: string;
  bullets: string[];
};

function slideTypeAt(index: number, total: number): LinkedinSlide["type"] {
  if (index === 0) return "cover";
  if (index === total - 1) return "cta";
  return "content";
}

/**
 * Normalise et valide : 1 cover + 5 ou 6 slides contenu + 1 CTA (7 ou 8 slides au total).
 */
export function parseLinkedinSlides(raw: unknown): LinkedinSlide[] | null {
  if (!Array.isArray(raw) || raw.length < 7 || raw.length > 8) return null;

  const n = raw.length;
  const contentCount = n - 2;
  if (contentCount < 5 || contentCount > 6) return null;

  const slides: LinkedinSlide[] = [];

  for (let i = 0; i < n; i++) {
    const o = raw[i] as Record<string, unknown>;
    const title = typeof o?.title === "string" ? o.title.trim() : "";
    const bullets = Array.isArray(o?.bullets)
      ? (o.bullets as unknown[])
          .filter((b): b is string => typeof b === "string")
          .map((x) => x.trim())
          .filter(Boolean)
      : [];
    const type = slideTypeAt(i, n);
    slides.push({ type, title, bullets });
  }

  const cover = slides[0];
  if (!cover.title || cover.title.length < 3) return null;

  for (let i = 1; i < n - 1; i++) {
    const s = slides[i];
    if (!s.title || s.bullets.length < 1) return null;
  }

  const cta = slides[n - 1];
  if (!cta.title || cta.bullets.length < 1) return null;

  return slides;
}

export const LINKEDIN_CAROUSEL_SLIDES_PROMPT = `
Structure du carousel (ordre strict, 7 ou 8 slides au total) :
1) **Couverture** (\`type\`: \`"cover"\`) : une seule slide d’accroche avec le **titre principal** du carousel (impactant, lisible comme une cover). \`bullets\` : tableau vide \`[]\`, ou au plus **une** ligne sous-titre / accroche secondaire.
2) **Contenu** : **5 ou 6** slides (\`type\`: \`"content"\`), chacune avec un **titre court** + **2 à 4 puces** (idées du transcript, style percutant).
3) **Call to action** (\`type\`: \`"cta"\`) : **dernière slide** — titre du type « À retenir », « Envie d’en savoir plus ? » + puces avec CTA clair (ex. lien extia.fr, invitation à commenter / voir la vidéo).

Schéma JSON pour \`slides\` (exemple 7 slides = 1 cover + 5 content + 1 cta) :
\`\`\`
"slides": [
  { "type": "cover", "title": "Grand titre cover", "bullets": [] },
  { "type": "content", "title": "…", "bullets": ["…", "…"] },
  … (5 ou 6 slides content au total) …
  { "type": "cta", "title": "…", "bullets": ["…", "…"] }
]
\`\`\`
`.trim();
