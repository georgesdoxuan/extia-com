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
  s = s.replace(/<a[^>]*href=\"([^\"]+)\"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)");
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

export function normalizeSeoArticle(article: string) {
  let s = article.trim();
  if (!s) return s;
  if (/[<][a-z][\s\S]*[>]/i.test(s) && /<\/(h2|h3|p|ul|li|a|strong)>/i.test(s)) {
    s = htmlToMarkdownish(s);
  }
  s = s.replace(/^\s{0,3}#{1,6}\s+/gm, "");
  s = s.replace(/\*\*([^*]+)\*\*/g, "$1");
  s = s.replace(/__([^_]+)__/g, "$1");
  s = s.replace(/(^|[^\*])\*([^*\n]+)\*(?!\*)/g, "$1$2");
  s = s.replace(/(^|[^_])_([^_\n]+)_(?!_)/g, "$1$2");
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
  let titleEmitted = false;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const text = paragraph.join(" ").replace(/\s+/g, " ").trim();
    if (text) out.push(text, "");
    paragraph = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Toujours préserver la 1ère ligne non-vide comme titre seul sur sa ligne
    if (!titleEmitted) {
      out.push(line, "");
      titleEmitted = true;
      continue;
    }

    if (isHeadingLike(line)) {
      flushParagraph();
      out.push(isAllCaps(line) ? titleCase(line) : line, "");
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
