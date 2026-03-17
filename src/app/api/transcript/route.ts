import { NextResponse } from "next/server";
import {
  extractYouTubeVideoId,
  fetchYouTubeOEmbed,
  fetchTranscriptFromApi,
} from "@/lib/youtubeTranscript";

type Body = { url?: string };

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
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

    return NextResponse.json({
      video: { id: videoId, url, title: oembed.title, channelName },
      transcript,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur inconnue.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
