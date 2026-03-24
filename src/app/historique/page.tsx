"use client";

import React from "react";

type CarouselSlide = { type?: "cover" | "content" | "cta"; title: string; bullets: string[] };
type HistoryItem = {
  id: number;
  createdAt: string;
  video?: { title?: string; url?: string; channelName?: string; durationSeconds?: number };
  payload?: {
    ideas?: string[];
    seoArticle?: string;
    linkedinCarousel?: { caption?: string; hashtags?: string[]; slides?: CarouselSlide[] };
  };
};

function IconGrid() {
  return (
    <svg className="h-5 w-5 shrink-0 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
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

function applyInlineMd(str: string): string {
  return str.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}
function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
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
function linkedinSlideHeading(slide: CarouselSlide, index: number, total: number): string {
  const t = slide.type ?? (index === 0 ? "cover" : index === total - 1 ? "cta" : "content");
  if (t === "cover") return "Couverture";
  if (t === "cta") return "Call to action";
  return `Contenu ${index} / ${Math.max(1, total - 2)}`;
}

function Sidebar() {
  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-gray-200 bg-white lg:w-[260px] lg:border-b-0 lg:border-r">
      <div className="px-5 pb-2 pt-6 lg:px-6">
        <p className="vamos-logo text-3xl leading-none"><span className="text-slate-700">Extia</span><span className="text-orange-500">&apos;Com</span></p>
        <p className="mt-1 text-xs font-medium text-gray-500">Extia · contenus vidéo</p>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 px-3 pb-6 pt-4 lg:px-4">
        <a href="/" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50"><IconGrid />Tableau de bord</a>
        <span className="flex cursor-default items-center gap-3 rounded-lg bg-sky-50 px-3 py-2.5 text-sm font-medium text-sky-800"><IconDocSolid />Historique contenus</span>
      </nav>
    </aside>
  );
}

function ResultCard({ icon, iconClassName, title, subtitle, meta, children }: { icon?: React.ReactNode; iconClassName?: string; title: string; subtitle?: string; meta?: string; children: React.ReactNode }) {
  return (
    <article className="mb-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2 border-b border-gray-100 pb-3">
        <div className="flex items-start gap-3">
          {icon ? <span className={`mt-0.5 inline-flex items-center justify-center ${iconClassName || "text-sky-600"}`}>{icon}</span> : null}
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

export default function HistoriquePage() {
  const [items, setItems] = React.useState<HistoryItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [runLoading, setRunLoading] = React.useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cron/youtube-sync/results?limit=20", { cache: "no-store" });
      const json = (await res.json()) as { error?: string; results?: HistoryItem[] };
      if (!res.ok || json.error) throw new Error(json.error || `Erreur HTTP ${res.status}`);
      setItems(Array.isArray(json.results) ? json.results : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible de charger l'historique.");
    } finally {
      setLoading(false);
    }
  }

  async function generateLatestEligible() {
    setRunLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cron/youtube-sync?mode=latest-eligible", { method: "POST" });
      const json = (await res.json()) as { error?: string; generated?: number };
      if (!res.ok || json.error) throw new Error(json.error || `Erreur HTTP ${res.status}`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible de lancer la génération.");
    } finally {
      setRunLoading(false);
    }
  }

  React.useEffect(() => {
    void load();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-800 lg:flex-row">
      <Sidebar />
      <main className="w-full flex-1 p-5 lg:p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Historique SEO + LinkedIn</h1>
            <p className="mt-1 text-sm text-gray-600">Même format que la génération manuelle, pour chaque vidéo.</p>
          </div>
          <button
            type="button"
            onClick={() => void generateLatestEligible()}
            disabled={runLoading}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
          >
            {runLoading ? "Génération..." : "Générer la dernière vidéo > 20 min"}
          </button>
        </div>

        {loading ? <p className="text-sm text-gray-500">Chargement de l&apos;historique...</p> : null}
        {error ? <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}

        {!loading && !error && items.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">Aucun contenu trouvé.</div>
        ) : null}

        {items.map((item) => {
          const ideas = Array.isArray(item.payload?.ideas) ? item.payload.ideas : [];
          const seoArticle = item.payload?.seoArticle || "";
          const linkedin = item.payload?.linkedinCarousel;
          const slides = Array.isArray(linkedin?.slides) ? linkedin.slides : [];
          const hashtags = Array.isArray(linkedin?.hashtags) ? linkedin.hashtags : [];
          const meta = `${item.video?.channelName || "Chaîne"} · ${item.video?.durationSeconds || 0}s · ${new Date(item.createdAt).toLocaleString("fr-FR")}`;

          return (
            <section key={item.id} className="mb-8 rounded-2xl border border-sky-100/80 bg-sky-50/20 p-3">
              <ResultCard icon={<IconGrid />} title={item.video?.title || "Sans titre"} subtitle="Vidéo source" meta={meta}>
                {item.video?.url ? <a href={item.video.url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-sky-700 underline">Ouvrir sur YouTube</a> : null}
              </ResultCard>

              <ResultCard icon={<IconBulbSolid />} iconClassName="text-amber-500" title="5 idées clés" subtitle="À réutiliser en posts ou briefs">
                <ul className="mt-1 list-none space-y-2 text-sm leading-relaxed text-gray-700">
                  {ideas.map((idea, i) => (
                    <li key={i} className="flex gap-2"><span className="font-semibold text-sky-600">{i + 1}.</span><span>{idea}</span></li>
                  ))}
                </ul>
              </ResultCard>

              <ResultCard icon={<IconDocSolid />} iconClassName="text-emerald-600" title="Article SEO" subtitle="Texte long · prêt à éditer">
                <div
                  className="max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50/80 px-4 py-3 text-sm leading-relaxed text-gray-800 [&_h2]:mb-1 [&_h2]:mt-4 [&_h2]:text-base [&_h2]:font-bold [&_h3]:mb-1 [&_h3]:mt-3 [&_h3]:text-sm [&_h3]:font-bold [&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:my-0.5 [&_p]:my-1.5"
                  dangerouslySetInnerHTML={{ __html: markdownToHtml(seoArticle) }}
                />
              </ResultCard>

              <ResultCard icon={<IconCarouselSolid />} iconClassName="text-sky-600" title="Carousel LinkedIn" subtitle={`${slides.length} pages · cover + contenu + CTA`}>
                <div className="space-y-3">
                  {slides.map((s, idx) => {
                    const n = slides.length;
                    const kind = s.type ?? (idx === 0 ? "cover" : idx === n - 1 ? "cta" : "content");
                    const heading = linkedinSlideHeading(s, idx, n);
                    if (kind === "cover") {
                      return (
                        <div key={idx} className="rounded-xl border-2 border-sky-200/80 bg-gradient-to-br from-sky-50 to-white p-6 text-center shadow-sm">
                          <p className="text-xs font-bold uppercase tracking-wider text-sky-600">{heading}</p>
                          <p className="mt-3 text-xl font-extrabold leading-snug text-gray-900 sm:text-2xl">{s.title}</p>
                          {s.bullets.length > 0 ? <p className="mt-3 text-sm font-medium text-gray-600">{s.bullets.join(" · ")}</p> : null}
                        </div>
                      );
                    }
                    if (kind === "cta") {
                      return (
                        <div key={idx} className="rounded-xl border-2 border-orange-200/90 bg-gradient-to-br from-orange-50/90 to-amber-50/50 p-5 shadow-sm">
                          <p className="text-xs font-bold uppercase tracking-wider text-orange-700">{heading}</p>
                          <p className="mt-2 text-lg font-bold text-gray-900">{s.title}</p>
                          <ul className="mt-3 list-none space-y-2 text-sm font-medium text-gray-800">
                            {s.bullets.map((b, i) => (
                              <li key={i} className="flex gap-2"><span className="text-orange-500" aria-hidden>→</span><span>{b}</span></li>
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

              <ResultCard icon={<IconChatSolid />} iconClassName="text-fuchsia-600" title="Post LinkedIn" subtitle="Légende + hashtags">
                <p className="whitespace-pre-wrap text-sm text-gray-800">{linkedin?.caption || ""}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {hashtags.map((h, i) => (
                    <span key={i} className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-medium text-sky-800">{h}</span>
                  ))}
                </div>
              </ResultCard>
            </section>
          );
        })}
      </main>
    </div>
  );
}
