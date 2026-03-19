"use client";

import React from "react";
import { VamosStyleBackground } from "@/components/VamosStyleBackground";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-800 lg:flex-row">
      <Sidebar />
      <div className="relative flex min-h-[100dvh] flex-1 flex-col lg:min-h-screen">
        <VamosStyleBackground />
        <div className="relative z-10 flex min-h-0 flex-1 flex-col lg:flex-row">
          <MainWorkspace />
        </div>
      </div>
    </div>
  );
}

function IconGrid() {
  return (
    <svg className="h-5 w-5 shrink-0 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}
function IconLink() {
  return (
    <svg className="h-5 w-5 shrink-0 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  );
}

function IconAI() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2l1.1 3.7a2 2 0 0 0 1.3 1.3L18 8l-3.6 1a2 2 0 0 0-1.3 1.3L12 14l-1.1-3.7A2 2 0 0 0 9.6 9L6 8l3.6-1A2 2 0 0 0 10.9 5.7L12 2Z"
        fill="currentColor"
        opacity="0.95"
      />
      <path
        d="M19 12l.7 2.3a1.4 1.4 0 0 0 .9.9L23 16l-2.4.8a1.4 1.4 0 0 0-.9.9L19 20l-.7-2.3a1.4 1.4 0 0 0-.9-.9L15 16l2.4-.8a1.4 1.4 0 0 0 .9-.9L19 12Z"
        fill="currentColor"
        opacity="0.75"
      />
    </svg>
  );
}

function IconVideoSolid() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M4 6.75A2.75 2.75 0 0 1 6.75 4h7.5A2.75 2.75 0 0 1 17 6.75v10.5A2.75 2.75 0 0 1 14.25 20h-7.5A2.75 2.75 0 0 1 4 17.25V6.75Z" />
      <path d="M19.4 8.3a1 1 0 0 1 1.6.8v5.8a1 1 0 0 1-1.6.8l-2.4-1.8V10.1l2.4-1.8Z" />
    </svg>
  );
}

function IconBulbSolid() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2a7 7 0 0 0-4 12.74V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.26A7 7 0 0 0 12 2Z" />
      <path d="M9 21a1 1 0 0 0 1 1h4a1 1 0 1 0 0-2h-4a1 1 0 0 0-1 1Z" />
    </svg>
  );
}

function IconDocSolid() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M7 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5a2 2 0 0 0-.59-1.41l-3.5-3.5A2 2 0 0 0 13.5 3H7Z" />
      <path d="M14 3.5V8a1 1 0 0 0 1 1h4.5" opacity="0.25" />
    </svg>
  );
}

function IconCarouselSolid() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M7 6a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3V6Z" />
      <path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h.5v14H6A2.5 2.5 0 0 1 3.5 16.5v-9Z" opacity="0.35" />
      <path d="M17.5 5H18a2.5 2.5 0 0 1 2.5 2.5v9A2.5 2.5 0 0 1 18 19h-.5V5Z" opacity="0.35" />
    </svg>
  );
}

function IconChatSolid() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M4 5.5A3.5 3.5 0 0 1 7.5 2h9A3.5 3.5 0 0 1 20 5.5v6A3.5 3.5 0 0 1 16.5 15H10l-4.6 3.45A1 1 0 0 1 4 17.65V5.5Z" />
    </svg>
  );
}

function IconTranscriptSolid() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V10.5a1 1 0 0 0-.29-.71l-6.5-6.5A1 1 0 0 0 15.5 3H6Z" />
      <path d="M15 3.5V9a1 1 0 0 0 1 1h5.5" opacity="0.25" />
    </svg>
  );
}

function Sidebar() {
  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-gray-200 bg-white lg:w-[260px] lg:border-b-0 lg:border-r">
      <div className="flex items-start justify-between px-5 pb-2 pt-6 lg:px-6">
        <div>
          <p className="vamos-logo text-3xl leading-none">
            <span className="text-slate-700">Extia</span>
            <span className="text-orange-500">&apos;Com</span>
          </p>
          <p className="mt-1 text-xs font-medium text-gray-500">Extia · contenus vidéo</p>
        </div>
        <button
          type="button"
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:mt-1"
          aria-label="Menu"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 px-3 pb-6 pt-4 lg:px-4">
        <span className="flex cursor-default items-center gap-3 rounded-lg bg-sky-50 px-3 py-2.5 text-sm font-medium text-sky-800">
          <IconGrid />
          Tableau de bord
        </span>
        <a
          href="https://extia.fr"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
        >
          <IconLink />
          extia.fr
        </a>
      </nav>
    </aside>
  );
}

type ApiResponse = {
  error?: string;
  video?: { id: string; url: string; title: string; channelName: string };
  transcript?: string;
  ideas?: string[];
  seoArticle?: string;
  linkedinCarousel?: {
    slides: { type?: "cover" | "content" | "cta"; title: string; bullets: string[] }[];
    caption: string;
    hashtags: string[];
  };
};

function linkedinSlideHeading(
  slide: { type?: "cover" | "content" | "cta"; title: string; bullets: string[] },
  index: number,
  total: number,
): string {
  const t = slide.type ?? (index === 0 ? "cover" : index === total - 1 ? "cta" : "content");
  if (t === "cover") return "Couverture";
  if (t === "cta") return "Call to action";
  return `Contenu ${index} / ${total - 2}`;
}

function formatLinkedinSlidesForCopy(
  slides: { type?: "cover" | "content" | "cta"; title: string; bullets: string[] }[],
): string {
  const n = slides.length;
  return slides
    .map((s, idx) => {
      const head = linkedinSlideHeading(s, idx, n);
      const body =
        s.bullets.length > 0
          ? `${s.title}\n${s.bullets.map((b) => `• ${b}`).join("\n")}`
          : s.title;
      return `━━ ${head} ━━\n${body}`;
    })
    .join("\n\n");
}

function splitSeoTitleAndBody(seoArticle: string): { title?: string; body: string } {
  const raw = seoArticle.trim();
  if (!raw) return { body: "" };
  const lines = raw.split("\n").map((l) => l.trim());
  const first = lines.find((l) => l.length > 0) || "";
  const secondIdx = lines.findIndex((l, idx) => idx > 0 && l.length > 0);

  // Heuristic: treat the first non-empty line as title if it's not too long.
  const looksLikeTitle = first.length >= 8 && first.length <= 110;
  if (!looksLikeTitle) return { body: raw };

  const bodyStart = secondIdx === -1 ? "" : lines.slice(secondIdx).join("\n").trim();
  return { title: first, body: bodyStart || raw };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function applyInlineMd(str: string): string {
  return str.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

function markdownToHtml(md: string): string {
  const lines = md.split("\n");
  const parts: string[] = [];
  let ulBuffer: string[] = [];

  const flushUl = () => {
    if (ulBuffer.length) {
      parts.push(`<ul>${ulBuffer.join("")}</ul>`);
      ulBuffer = [];
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.startsWith("## ")) {
      flushUl();
      parts.push(`<h2>${applyInlineMd(escapeHtml(line.slice(3)))}</h2>`);
    } else if (line.startsWith("### ")) {
      flushUl();
      parts.push(`<h3>${applyInlineMd(escapeHtml(line.slice(4)))}</h3>`);
    } else if (line.startsWith("- ")) {
      ulBuffer.push(`<li>${applyInlineMd(escapeHtml(line.slice(2)))}</li>`);
    } else if (line === "") {
      flushUl();
    } else {
      flushUl();
      parts.push(`<p>${applyInlineMd(escapeHtml(line))}</p>`);
    }
  }
  flushUl();
  return parts.join("");
}

function stripMarkdownForPlainText(md: string): string {
  return md
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/^- /gm, "• ");
}

/** Libellés d’attente (sans jargon technique) selon l’étape en cours. */
function loadingWaitPhrase(step: string | null): { title: string; detail: string } {
  if (!step) {
    return {
      title: "Un instant…",
      detail: "On prépare la suite : transcription, puis idées, article et LinkedIn.",
    };
  }
  if (step.startsWith("Transcription")) {
    return {
      title: "On capte la vidéo",
      detail: "Extraction du texte parlé — merci de patienter quelques secondes.",
    };
  }
  if (step.startsWith("Idées")) {
    return {
      title: "On creuse le contenu",
      detail: "Repérage des idées fortes à reprendre dans tes supports.",
    };
  }
  if (step.startsWith("Article")) {
    return {
      title: "Rédaction en cours",
      detail: "L’article SEO prend forme, ça peut prendre un peu plus de temps.",
    };
  }
  if (step.startsWith("LinkedIn")) {
    return {
      title: "Dernière ligne droite",
      detail: "Slides, légende et hashtags pour ton post LinkedIn.",
    };
  }
  return { title: "Presque fini", detail: "Encore un petit effort…" };
}

function MainWorkspace() {
  const [url, setUrl] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [progressLabel, setProgressLabel] = React.useState<string | null>(null);
  const [regenSeoLoading, setRegenSeoLoading] = React.useState(false);
  const [regenLinkedinLoading, setRegenLinkedinLoading] = React.useState(false);
  const [data, setData] = React.useState<ApiResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const processAbortRef = React.useRef<AbortController | null>(null);

  async function safeJson<T>(res: Response): Promise<T> {
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `API indisponible (HTTP ${res.status}). ${text ? "Réponse non-JSON reçue (probable timeout Netlify)." : ""}`.trim(),
      );
    }
    return (await res.json()) as T;
  }

  const videoPayload = (v: NonNullable<ApiResponse["video"]>) => ({
    url: v.url,
    title: v.title,
    channelName: v.channelName,
  });

  async function run(u: string) {
    const trimmed = u.trim();
    if (!trimmed) return;
    processAbortRef.current?.abort();
    const controller = new AbortController();
    processAbortRef.current = controller;
    setLoading(true);
    setProgressLabel(null);
    setError(null);
    setData(null);
    const jsonHeaders = { "Content-Type": "application/json" };
    try {
      setProgressLabel("Transcription…");
      const resT = await fetch("/api/transcript", {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({ url: trimmed }),
        signal: controller.signal,
      });
      const jT = await safeJson<{ error?: string; video?: ApiResponse["video"]; transcript?: string }>(resT);
      if (!resT.ok || jT.error || !jT.video || !jT.transcript) {
        throw new Error(jT.error || `Erreur transcription (HTTP ${resT.status})`);
      }

      setProgressLabel("Idées clés…");
      const resI = await fetch("/api/generate-part", {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({
          part: "ideas",
          video: videoPayload(jT.video),
          transcript: jT.transcript,
        }),
        signal: controller.signal,
      });
      const jI = await safeJson<{ error?: string; ideas?: string[] }>(resI);
      if (!resI.ok || jI.error || !jI.ideas?.length) {
        throw new Error(jI.error || `Erreur idées (HTTP ${resI.status})`);
      }

      setProgressLabel("Article SEO…");
      const resS = await fetch("/api/generate-part", {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({
          part: "seo",
          video: videoPayload(jT.video),
          transcript: jT.transcript,
        }),
        signal: controller.signal,
      });
      const jS = await safeJson<{ error?: string; seoArticle?: string }>(resS);
      if (!resS.ok || jS.error || !jS.seoArticle) {
        throw new Error(jS.error || `Erreur SEO (HTTP ${resS.status})`);
      }

      setProgressLabel("LinkedIn…");
      const resL = await fetch("/api/generate-part", {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({
          part: "linkedin",
          video: videoPayload(jT.video),
          transcript: jT.transcript,
        }),
        signal: controller.signal,
      });
      const jL = await safeJson<{
        error?: string;
        linkedinCarousel?: ApiResponse["linkedinCarousel"];
      }>(resL);
      if (!resL.ok || jL.error || !jL.linkedinCarousel) {
        throw new Error(jL.error || `Erreur LinkedIn (HTTP ${resL.status})`);
      }

      setData({
        video: jT.video,
        transcript: jT.transcript,
        ideas: jI.ideas,
        seoArticle: jS.seoArticle,
        linkedinCarousel: jL.linkedinCarousel,
      });
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        setError("Traitement stoppé.");
      } else {
        setError(e instanceof Error ? e.message : "Erreur inconnue.");
      }
    } finally {
      setProgressLabel(null);
      setLoading(false);
    }
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const text = e.dataTransfer.getData("text/plain") || "";
    if (text) {
      setUrl(text);
      void run(text);
    }
  }

  const hasResults = Boolean(data?.ideas?.length || data?.seoArticle);

  function stopProcessing() {
    processAbortRef.current?.abort();
    processAbortRef.current = null;
    setLoading(false);
  }

  async function regenerateSeo() {
    if (!data?.video || !data?.transcript) return;
    setRegenSeoLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "seo",
          video: { url: data.video.url, title: data.video.title, channelName: data.video.channelName },
          transcript: data.transcript,
          previous: { seoArticle: data.seoArticle || "" },
        }),
      });
      const json = await safeJson<{ error?: string; seoArticle?: string }>(res);
      if (!res.ok || json.error) throw new Error(json.error || `Erreur HTTP ${res.status}`);
      setData((prev) => (prev ? { ...prev, seoArticle: json.seoArticle || prev.seoArticle } : prev));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue.");
    } finally {
      setRegenSeoLoading(false);
    }
  }

  async function regenerateLinkedin() {
    if (!data?.video || !data?.transcript || !data?.linkedinCarousel) return;
    setRegenLinkedinLoading(true);
    setError(null);
    try {
      const prevSlidesText = formatLinkedinSlidesForCopy(data.linkedinCarousel.slides);
      const res = await fetch("/api/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "linkedin",
          video: { url: data.video.url, title: data.video.title, channelName: data.video.channelName },
          transcript: data.transcript,
          previous: {
            linkedinCaption: data.linkedinCarousel.caption,
            linkedinSlidesText: prevSlidesText,
          },
        }),
      });
      const json = await safeJson<{
        error?: string;
        linkedinCarousel?: ApiResponse["linkedinCarousel"];
      }>(res);
      if (!res.ok || json.error) throw new Error(json.error || `Erreur HTTP ${res.status}`);
      setData((prev) => (prev ? { ...prev, linkedinCarousel: json.linkedinCarousel || prev.linkedinCarousel } : prev));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue.");
    } finally {
      setRegenLinkedinLoading(false);
    }
  }

  return (
    <>
      <div id="resultats" className="min-h-0 w-full flex-1 overflow-auto p-5 lg:p-6">
        {/* Source vidéo (au-dessus des contenus générés) */}
        <div
          id="source"
          className="mb-6 rounded-2xl border border-sky-200/60 bg-white/70 p-5 shadow-sm backdrop-blur-sm"
        >
          <h2 className="mb-4 text-base font-semibold text-gray-800">Source vidéo</h2>
          <div className="grid gap-4">
            <div
              id="generer"
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <label className="mb-1.5 block text-sm font-medium text-gray-700">URL YouTube</label>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Sélectionner ou coller l’URL…"
                className="mb-3 w-full rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2.5 text-sm outline-none ring-sky-300 focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
              />
              <p className="mb-4 text-xs text-gray-500">Glisser-déposer l’URL fonctionne aussi.</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void run(url)}
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform duration-150 ease-out hover:scale-[1.03] hover:bg-sky-700 active:scale-[1.01] disabled:opacity-50 sm:w-auto"
                >
                  {loading ? (
                    loadingWaitPhrase(progressLabel).title
                  ) : (
                    <>
                      <span className="text-white/95">
                        <IconAI />
                      </span>
                      Générer les contenus
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUrl("");
                    setData(null);
                    setError(null);
                  }}
                  disabled={loading}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 sm:w-auto"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center rounded-full border border-sky-300/80 bg-sky-100/90 px-3 py-1 text-xs font-semibold text-sky-800 shadow-sm">
              Nouveauté !
            </span>
            <p className="text-sm text-gray-600">YouTube → idées, SEO, LinkedIn</p>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-gray-600 hover:bg-white/60"
            aria-label="Rechercher"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

        <h2 className="mb-1 text-lg font-semibold text-sky-800">
          {hasResults ? "Contenus générés" : "Aucun contenu pour l’instant"}
        </h2>
        <p className="mb-6 text-sm text-sky-900/70">
          {hasResults
            ? "Résumé de la vidéo et livrables prêts à copier."
            : "Colle une URL Extia puis clique sur Générer."}
        </p>

        {error ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-white p-4 text-sm text-red-800 shadow-sm">{error}</div>
        ) : null}

        {!data && !loading && !error ? (
          <div className="rounded-xl border border-dashed border-sky-300/50 bg-white/70 p-10 text-center text-sm text-gray-500 shadow-sm backdrop-blur-sm">
            En attente d’une URL YouTube…
          </div>
        ) : null}

        {loading ? (
          <LoadingCard onStop={stopProcessing} step={progressLabel} />
        ) : null}

        {data?.video ? (
          <ResultCard
            icon={<IconVideoSolid />}
            iconClassName="text-indigo-600"
            title={data.video.title}
            subtitle={`Chaîne · ${data.video.channelName}`}
            meta={data.video.url}
          >
            <a href={data.video.url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-sky-700 underline">
              Ouvrir sur YouTube
            </a>
          </ResultCard>
        ) : null}

        {data?.ideas?.length ? (
          <ResultCard
            icon={<IconBulbSolid />}
            iconClassName="text-amber-500"
            title="5 idées clés"
            subtitle="À réutiliser en posts ou briefs"
          >
            <CopyBtn text={data.ideas.map((x) => `• ${x}`).join("\n")} />
            <ul className="mt-3 list-none space-y-2 text-sm leading-relaxed text-gray-700">
              {data.ideas.map((idea, i) => (
                <li key={i} className="flex gap-2">
                  <span className="font-semibold text-sky-600">{i + 1}.</span>
                  <span>{idea}</span>
                </li>
              ))}
            </ul>
          </ResultCard>
        ) : null}

        {data?.seoArticle ? (
          <ResultCard
            icon={<IconDocSolid />}
            iconClassName="text-emerald-600"
            title="Article SEO"
            subtitle="Texte long · prêt à éditer"
          >
            {(() => {
              const { title: seoTitle, body: seoBody } = splitSeoTitleAndBody(data.seoArticle);
              return (
                <>
                  {seoTitle ? (
                    <h4 className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900">{seoTitle}</h4>
                  ) : null}
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <CopyBtn
                      text={stripMarkdownForPlainText(seoBody || data.seoArticle)}
                      html={markdownToHtml(seoBody || data.seoArticle)}
                    />
                    <SmallActionButton onClick={() => void regenerateSeo()} disabled={regenSeoLoading || loading}>
                      {regenSeoLoading ? (
                        "Regénération…"
                      ) : (
                        <>
                          <span className="text-sky-700/90">
                            <IconAI />
                          </span>
                          Regénérer
                        </>
                      )}
                    </SmallActionButton>
                  </div>
                  <div
                    className="mt-3 max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50/80 px-4 py-3 text-sm leading-relaxed text-gray-800 [&_h2]:mb-1 [&_h2]:mt-4 [&_h2]:text-base [&_h2]:font-bold [&_h3]:mb-1 [&_h3]:mt-3 [&_h3]:text-sm [&_h3]:font-bold [&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:my-0.5 [&_p]:my-1.5"
                    dangerouslySetInnerHTML={{ __html: markdownToHtml(seoBody || data.seoArticle) }}
                  />
                </>
              );
            })()}
          </ResultCard>
        ) : null}

        {data?.linkedinCarousel ? (
          <>
            <ResultCard
              icon={<IconCarouselSolid />}
              iconClassName="text-sky-600"
              title="Carousel LinkedIn"
              subtitle={`${data.linkedinCarousel.slides.length} pages · cover + contenu + CTA`}
            >
              <div className="flex items-center justify-between gap-3">
                <CopyBtn text={formatLinkedinSlidesForCopy(data.linkedinCarousel.slides)} />
                <SmallActionButton onClick={() => void regenerateLinkedin()} disabled={regenLinkedinLoading || loading}>
                  {regenLinkedinLoading ? (
                    "Regénération…"
                  ) : (
                    <>
                      <span className="text-sky-700/90">
                        <IconAI />
                      </span>
                      Regénérer
                    </>
                  )}
                </SmallActionButton>
              </div>
              <div className="mt-4 space-y-3">
                {data.linkedinCarousel.slides.map((s, idx) => {
                  const n = data.linkedinCarousel!.slides.length;
                  const kind = s.type ?? (idx === 0 ? "cover" : idx === n - 1 ? "cta" : "content");
                  const heading = linkedinSlideHeading(s, idx, n);
                  if (kind === "cover") {
                    return (
                      <div
                        key={idx}
                        className="rounded-xl border-2 border-sky-200/80 bg-gradient-to-br from-sky-50 to-white p-6 text-center shadow-sm"
                      >
                        <p className="text-xs font-bold uppercase tracking-wider text-sky-600">{heading}</p>
                        <p className="mt-3 text-xl font-extrabold leading-snug text-gray-900 sm:text-2xl">{s.title}</p>
                        {s.bullets.length > 0 ? (
                          <p className="mt-3 text-sm font-medium text-gray-600">{s.bullets.join(" · ")}</p>
                        ) : null}
                      </div>
                    );
                  }
                  if (kind === "cta") {
                    return (
                      <div
                        key={idx}
                        className="rounded-xl border-2 border-orange-200/90 bg-gradient-to-br from-orange-50/90 to-amber-50/50 p-5 shadow-sm"
                      >
                        <p className="text-xs font-bold uppercase tracking-wider text-orange-700">{heading}</p>
                        <p className="mt-2 text-lg font-bold text-gray-900">{s.title}</p>
                        <ul className="mt-3 list-none space-y-2 text-sm font-medium text-gray-800">
                          {s.bullets.map((b, i) => (
                            <li key={i} className="flex gap-2">
                              <span className="text-orange-500" aria-hidden>
                                →
                              </span>
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  }
                  return (
                    <div key={idx} className="rounded-lg border border-gray-100 bg-gray-50/50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{heading}</p>
                      <p className="mt-1 text-sm font-semibold text-gray-900">{s.title}</p>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
                        {s.bullets.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </ResultCard>
            <ResultCard
              icon={<IconChatSolid />}
              iconClassName="text-fuchsia-600"
              title="Post LinkedIn"
              subtitle="Post LinkedIn"
            >
              <CopyBtn text={`${data.linkedinCarousel.caption}\n\n${data.linkedinCarousel.hashtags.join(" ")}`} />
              <p className="mt-3 whitespace-pre-wrap text-sm text-gray-800">{data.linkedinCarousel.caption}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {data.linkedinCarousel.hashtags.map((h, i) => (
                  <span key={i} className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-medium text-sky-800">
                    {h}
                  </span>
                ))}
              </div>
            </ResultCard>
          </>
        ) : null}

        {data?.transcript ? (
          <ResultCard
            icon={<IconTranscriptSolid />}
            iconClassName="text-slate-600"
            title="Transcription brute"
            subtitle="Source YouTube Transcript API"
          >
            <CopyBtn text={data.transcript} />
            <textarea
              readOnly
              value={data.transcript}
              className="mt-3 h-48 w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs leading-relaxed text-gray-700"
            />
          </ResultCard>
        ) : null}
      </div>
    </>
  );
}

function LoadingCard({ onStop, step }: { onStop: () => void; step: string | null }) {
  const { title, detail } = loadingWaitPhrase(step);
  return (
    <div className="mb-4 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-sky-700">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" />
              <path
                d="M21 12a9 9 0 0 0-9-9"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <div>
            <p className="text-sm font-semibold text-gray-900">{title}</p>
            <p className="text-xs text-gray-500">{detail}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="hidden max-w-[180px] items-center gap-2 truncate text-xs font-medium text-sky-700 sm:flex"
            title={detail}
          >
            <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-sky-400" />
            {title}
          </div>
          <button
            type="button"
            onClick={onStop}
            className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 shadow-sm transition-transform duration-150 ease-out hover:scale-[1.03] hover:bg-red-50 active:scale-[1.01]"
          >
            Stop
          </button>
        </div>
      </div>

      {/* Shimmer */}
      <div className="relative px-5 py-5">
        <div className="space-y-3">
          <div className="h-3 w-2/3 rounded bg-gray-100" />
          <div className="h-3 w-5/6 rounded bg-gray-100" />
          <div className="h-3 w-1/2 rounded bg-gray-100" />
          <div className="h-3 w-4/6 rounded bg-gray-100" />
          <div className="h-3 w-3/5 rounded bg-gray-100" />
        </div>
        <div className="loading-shimmer absolute inset-0" />
      </div>
    </div>
  );
}

function CopyBtn({ text, html }: { text: string; html?: string }) {
  const [copied, setCopied] = React.useState(false);
  const timeoutRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  async function onCopy() {
    try {
      if (html && typeof ClipboardItem !== "undefined" && navigator.clipboard.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": new Blob([html], { type: "text/html" }),
            "text/plain": new Blob([text], { type: "text/plain" }),
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(text);
      }
      setCopied(true);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // no-op: clipboard can fail depending on browser permissions
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-100"
    >
      {copied ? "Copié !" : "Copier"}
    </button>
  );
}

function SmallActionButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition-transform duration-150 ease-out hover:scale-[1.03] hover:bg-gray-50 active:scale-[1.01] disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function ResultCard({
  icon,
  iconClassName,
  title,
  subtitle,
  meta,
  children,
}: {
  icon?: React.ReactNode;
  iconClassName?: string;
  title: string;
  subtitle?: string;
  meta?: string;
  children: React.ReactNode;
}) {
  return (
    <article className="mb-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2 border-b border-gray-100 pb-3">
        <div className="flex items-start gap-3">
          {icon ? (
            <span className={`mt-0.5 inline-flex items-center justify-center ${iconClassName || "text-sky-600"}`}>
              {icon}
            </span>
          ) : null}
          <div>
            <h3 className="text-base font-bold text-gray-900">{title}</h3>
          {subtitle ? <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p> : null}
          {meta ? <p className="mt-1 truncate text-xs text-gray-400">{meta}</p> : null}
          </div>
        </div>
      </div>
      {children}
    </article>
  );
}
