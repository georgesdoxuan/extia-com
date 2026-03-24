import { NextResponse } from "next/server";

type SyncResultRow = {
  id: number;
  created_at: string;
  payload?: {
    video?: {
      id?: string;
      url?: string;
      title?: string;
      channelName?: string;
      publishedAt?: string;
      durationSeconds?: number;
    };
    ideas?: string[];
    seoArticle?: string;
    linkedinCarousel?: {
      caption?: string;
      hashtags?: string[];
      slides?: unknown[];
    };
  };
};

function isAuthorized(req: Request): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return true;
  const header = req.headers.get("x-cron-secret") || "";
  return header === secret;
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

export async function GET(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const config = getSupabaseConfig();
    if (!config) {
      return NextResponse.json(
        { error: "SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant côté serveur." },
        { status: 500 },
      );
    }

    const u = new URL(req.url);
    const limitRaw = Number(u.searchParams.get("limit") || "10");
    const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(50, Math.floor(limitRaw))) : 10;
    const endpoint = `${config.url}/rest/v1/youtube_sync_results?select=id,created_at,payload&order=id.desc&limit=${limit}`;

    const res = await fetch(endpoint, {
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const t = await res.text().catch(() => "");
      return NextResponse.json({ error: `Supabase error (${res.status}). ${t}`.trim() }, { status: 500 });
    }

    const rows = (await res.json()) as SyncResultRow[];
    const results = (Array.isArray(rows) ? rows : []).map((row) => {
      const video = row?.payload?.video ?? {};
      const ideas = Array.isArray(row?.payload?.ideas) ? row.payload.ideas : [];
      const slides = Array.isArray(row?.payload?.linkedinCarousel?.slides) ? row.payload.linkedinCarousel.slides : [];
      const hashtags = Array.isArray(row?.payload?.linkedinCarousel?.hashtags)
        ? row.payload.linkedinCarousel.hashtags
        : [];
      const seo = typeof row?.payload?.seoArticle === "string" ? row.payload.seoArticle : "";
      const caption =
        typeof row?.payload?.linkedinCarousel?.caption === "string" ? row.payload.linkedinCarousel.caption : "";

      return {
        id: row.id,
        createdAt: row.created_at,
        video,
        counts: {
          ideas: ideas.length,
          seoChars: seo.length,
          slides: slides.length,
          hashtags: hashtags.length,
          captionChars: caption.length,
        },
        payload: row.payload ?? {},
      };
    });

    return NextResponse.json({
      ok: true,
      count: results.length,
      results,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur inconnue.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

