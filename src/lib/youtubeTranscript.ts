export function extractYouTubeVideoId(input: string): string | null {
  try {
    const url = new URL(input);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = url.pathname.replace("/", "").trim();
      return id || null;
    }

    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      const v = url.searchParams.get("v");
      if (v) return v;
      const shorts = url.pathname.match(/^\/shorts\/([^/?#]+)/)?.[1];
      if (shorts) return shorts;
      const live = url.pathname.match(/^\/live\/([^/?#]+)/)?.[1];
      if (live) return live;
    }

    return null;
  } catch {
    return null;
  }
}

export async function fetchYouTubeOEmbed(videoUrl: string): Promise<{
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

export async function fetchTranscriptFromApi(videoId: string): Promise<string> {
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

  function normalizeText(s: string) {
    return s.replace(/\s+/g, " ").trim();
  }

  function collectTextSegments(node: unknown, out: string[], depth = 0) {
    if (depth > 12) return;
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
      if (typeof obj.text === "string") {
        const t = normalizeText(obj.text);
        if (t) out.push(t);
      }
      if (typeof obj.transcript === "string") {
        const t = normalizeText(obj.transcript);
        if (t) out.push(t);
      } else if (obj.transcript) {
        collectTextSegments(obj.transcript, out, depth + 1);
      }
      const candidates = ["transcripts", "items", "segments", "data", "results", "videos", "captions"];
      for (const key of candidates) {
        if (key in obj) collectTextSegments(obj[key], out, depth + 1);
      }
      for (const value of Object.values(obj)) collectTextSegments(value, out, depth + 1);
    }
  }

  const roots = Array.isArray(data) ? [data[0], data] : [data];
  for (const root of roots) {
    const segs: string[] = [];
    collectTextSegments(root, segs);
    const text = normalizeText(segs.join(" "));
    if (text.length > 20) return text;
  }

  throw new Error("Transcription introuvable (format non supporté).");
}
