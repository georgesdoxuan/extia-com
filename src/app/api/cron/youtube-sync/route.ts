import { NextResponse } from "next/server";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type FeedEntry = {
  videoId: string;
  title: string;
  publishedAt: string;
  videoUrl: string;
};

type State = {
  processedVideoIds: string[];
};

const DEFAULT_CHANNEL_HANDLE = "@Extiaconseil";
const MIN_DURATION_SECONDS = 20 * 60;
const STATE_PATH = path.join(process.cwd(), "data", "youtube-sync-state.json");
const OUTPUT_PATH = path.join(process.cwd(), "data", "youtube-sync-results.json");
const SUPABASE_STATE_TABLE = "youtube_sync_state";
const SUPABASE_RESULTS_TABLE = "youtube_sync_results";

function decodeXml(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
}

function extractTagValue(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "i"));
  return m?.[1]?.trim() ?? "";
}

function parseEntriesFromFeed(xml: string): FeedEntry[] {
  const entries = Array.from(xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)).map((m) => m[1]);
  return entries
    .map((entryXml) => {
      const videoId = extractTagValue(entryXml, "yt:videoId");
      const title = decodeXml(extractTagValue(entryXml, "title"));
      const publishedAt = extractTagValue(entryXml, "published");
      return {
        videoId,
        title,
        publishedAt,
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      };
    })
    .filter((e) => Boolean(e.videoId))
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}

function parseIso8601DurationToSeconds(duration: string): number {
  // ex: PT1H2M13S
  const m = duration.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!m) return 0;
  const h = Number(m[1] || 0);
  const min = Number(m[2] || 0);
  const s = Number(m[3] || 0);
  return h * 3600 + min * 60 + s;
}

async function ensureDataDir() {
  await mkdir(path.dirname(STATE_PATH), { recursive: true });
}

async function readState(): Promise<State> {
  const remote = await readStateFromSupabase();
  if (remote) return remote;

  await ensureDataDir();
  try {
    const raw = await readFile(STATE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as State;
    return {
      processedVideoIds: Array.isArray(parsed?.processedVideoIds) ? parsed.processedVideoIds : [],
    };
  } catch {
    return { processedVideoIds: [] };
  }
}

async function writeState(state: State) {
  const savedRemote = await writeStateToSupabase(state);
  if (savedRemote) return;

  await ensureDataDir();
  await writeFile(STATE_PATH, JSON.stringify(state, null, 2), "utf-8");
}

async function appendResult(item: unknown) {
  const savedRemote = await appendResultToSupabase(item);
  if (savedRemote) return;

  await ensureDataDir();
  let arr: unknown[] = [];
  try {
    const raw = await readFile(OUTPUT_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) arr = parsed;
  } catch {
    arr = [];
  }
  arr.unshift(item);
  await writeFile(OUTPUT_PATH, JSON.stringify(arr.slice(0, 100), null, 2), "utf-8");
}

function getSupabaseConfig():
  | {
      url: string;
      key: string;
    }
  | null {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  return { url: url.replace(/\/+$/, ""), key };
}

async function supabaseRequest(
  config: { url: string; key: string },
  endpoint: string,
  init: RequestInit,
): Promise<Response> {
  return fetch(`${config.url}/rest/v1/${endpoint}`, {
    ...init,
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    cache: "no-store",
  });
}

async function readStateFromSupabase(): Promise<State | null> {
  const config = getSupabaseConfig();
  if (!config) return null;
  try {
    const res = await supabaseRequest(
      config,
      `${SUPABASE_STATE_TABLE}?select=processed_video_ids&id=eq.default&limit=1`,
      { method: "GET" },
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as { processed_video_ids?: unknown }[];
    const ids = rows?.[0]?.processed_video_ids;
    return {
      processedVideoIds: Array.isArray(ids) ? ids.filter((x): x is string => typeof x === "string") : [],
    };
  } catch {
    return null;
  }
}

async function writeStateToSupabase(state: State): Promise<boolean> {
  const config = getSupabaseConfig();
  if (!config) return false;
  try {
    const body = {
      id: "default",
      processed_video_ids: state.processedVideoIds,
      updated_at: new Date().toISOString(),
    };
    const res = await supabaseRequest(config, `${SUPABASE_STATE_TABLE}?on_conflict=id`, {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function appendResultToSupabase(item: unknown): Promise<boolean> {
  const config = getSupabaseConfig();
  if (!config) return false;
  try {
    const res = await supabaseRequest(config, SUPABASE_RESULTS_TABLE, {
      method: "POST",
      body: JSON.stringify({
        payload: item,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function resolveChannelIdFromHandle(handle: string): Promise<string> {
  const url = `https://www.youtube.com/${handle}/videos`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Impossible de lire la page chaîne (HTTP ${res.status}).`);
  const html = await res.text();
  const m = html.match(/"channelId":"(UC[a-zA-Z0-9_-]+)"/);
  if (!m?.[1]) throw new Error("channelId introuvable pour la chaîne YouTube.");
  return m[1];
}

async function fetchLatestFeedEntries(handle: string): Promise<FeedEntry[]> {
  const channelId = await resolveChannelIdFromHandle(handle);
  const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  const res = await fetch(feedUrl, { cache: "no-store" });
  if (!res.ok) throw new Error(`Impossible de lire le flux YouTube (HTTP ${res.status}).`);
  const xml = await res.text();
  return parseEntriesFromFeed(xml);
}

async function fetchDurations(videoIds: string[], youtubeApiKey: string): Promise<Record<string, number>> {
  if (!videoIds.length) return {};
  const url =
    `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds.join(",")}` +
    `&key=${encodeURIComponent(youtubeApiKey)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Erreur YouTube Data API (HTTP ${res.status}). ${t}`.trim());
  }
  const json = (await res.json()) as {
    items?: { id?: string; contentDetails?: { duration?: string } }[];
  };
  const out: Record<string, number> = {};
  for (const item of json.items || []) {
    const id = item?.id;
    const duration = item?.contentDetails?.duration;
    if (!id || !duration) continue;
    out[id] = parseIso8601DurationToSeconds(duration);
  }
  return out;
}

function getBaseUrl(req: Request): string {
  const envBase = process.env.APP_BASE_URL?.trim();
  if (envBase) return envBase.replace(/\/+$/, "");
  const u = new URL(req.url);
  return `${u.protocol}//${u.host}`;
}

async function callJson(baseUrl: string, route: string, payload: unknown) {
  const res = await fetch(`${baseUrl}${route}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    const t = await res.text().catch(() => "");
    throw new Error(`Réponse non-JSON ${route} (HTTP ${res.status}). ${t}`.trim());
  }
  const json = (await res.json()) as Record<string, unknown>;
  if (!res.ok || typeof json.error === "string") {
    throw new Error((json.error as string) || `Erreur ${route} (HTTP ${res.status}).`);
  }
  return json;
}

function isAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return true; // dev/local convenience
  const header = req.headers.get("x-cron-secret") || "";
  return header === secret;
}

export async function POST(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: "Unauthorized cron call." }, { status: 401 });
    }

    const youtubeApiKey = process.env.YOUTUBE_API_KEY?.trim();
    if (!youtubeApiKey) {
      return NextResponse.json(
        { error: "YOUTUBE_API_KEY manquant (nécessaire pour filtrer les vidéos >20 min)." },
        { status: 500 },
      );
    }

    const handle = (process.env.YOUTUBE_CHANNEL_HANDLE || DEFAULT_CHANNEL_HANDLE).trim();
    const baseUrl = getBaseUrl(req);
    const state = await readState();
    const processed = new Set(state.processedVideoIds);

    const entries = await fetchLatestFeedEntries(handle);
    const candidates = entries.filter((e) => !processed.has(e.videoId)).slice(0, 10);
    if (!candidates.length) {
      return NextResponse.json({
        ok: true,
        scanned: entries.length,
        newVideos: 0,
        generated: 0,
        message: "Aucune nouvelle vidéo à traiter.",
      });
    }

    const durations = await fetchDurations(
      candidates.map((x) => x.videoId),
      youtubeApiKey,
    );
    const toGenerate = candidates.filter((x) => (durations[x.videoId] || 0) >= MIN_DURATION_SECONDS);

    let generated = 0;
    const errors: { videoId: string; title: string; error: string }[] = [];

    for (const vid of toGenerate) {
      try {
        const transcriptJson = await callJson(baseUrl, "/api/transcript", { url: vid.videoUrl });
        const video = transcriptJson.video as { url: string; title: string; channelName: string };
        const transcript = transcriptJson.transcript as string;
        const additionalInstructions =
          "Génération automatique cron Extia'Com. Produire un résultat prêt à publication.";

        const ideas = await callJson(baseUrl, "/api/generate-part", {
          part: "ideas",
          video,
          transcript,
          additionalInstructions,
        });
        const seo = await callJson(baseUrl, "/api/generate-part", {
          part: "seo",
          video,
          transcript,
          additionalInstructions,
        });
        const linkedin = await callJson(baseUrl, "/api/generate-part", {
          part: "linkedin",
          video,
          transcript,
          additionalInstructions,
        });

        await appendResult({
          createdAt: new Date().toISOString(),
          video: { ...video, id: vid.videoId, publishedAt: vid.publishedAt, durationSeconds: durations[vid.videoId] || 0 },
          ideas: ideas.ideas,
          seoArticle: seo.seoArticle,
          linkedinCarousel: linkedin.linkedinCarousel,
        });
        processed.add(vid.videoId);
        generated++;
      } catch (e) {
        errors.push({
          videoId: vid.videoId,
          title: vid.title,
          error: e instanceof Error ? e.message : String(e),
        });
      }
    }

    // Mark short videos as seen too (so they are not reconsidered forever).
    for (const vid of candidates.filter((x) => (durations[x.videoId] || 0) < MIN_DURATION_SECONDS)) {
      processed.add(vid.videoId);
    }

    await writeState({ processedVideoIds: Array.from(processed).slice(-500) });

    return NextResponse.json({
      ok: true,
      scanned: entries.length,
      newVideos: candidates.length,
      eligibleOver20Min: toGenerate.length,
      generated,
      skippedShort: candidates.length - toGenerate.length,
      errors,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur inconnue.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
