## Extia Content Studio

Hello

Web app: tu colles (ou glisses-déposes) une URL YouTube (vidéo Extia), l’app récupère la transcription via `youtube-transcript.io`, puis génère:

- 5 idées clés
- 1 article SEO (format court ~450–700 mots : titre, chapeau, sections en questions, sans puces)
- 1 carousel LinkedIn (cover + 5–6 pages contenu + slide CTA, caption + hashtags)

## Getting Started

### 1) Configure les variables d’environnement

Copie `.env.example` en `.env.local` et renseigne les clés (elles restent côté serveur).

### 2) Run the dev server

```bash
npm run dev
```

Ouvre `http://localhost:3000`.

## Notes

- La restriction “vidéos Extia uniquement” est vérifiée via YouTube oEmbed (nom de chaîne / titre).
- La transcription est “brute” (elle peut contenir des erreurs), l’IA s’appuie dessus + le contexte de marque Extia.
- **Netlify / timeouts** : le flux principal enchaîne `POST /api/transcript` puis trois appels `POST /api/generate-part` (`ideas`, `seo`, `linkedin`) pour rester sous la limite de durée d’une fonction serverless (~26–30 s) par requête.

## Automation YouTube (cron-jobs.org)

Endpoint:
- `POST /api/cron/youtube-sync`

Variables d'environnement requises:
- `YOUTUBE_API_KEY` (YouTube Data API v3, utilisé pour filtrer la durée des vidéos)
- `CRON_SECRET` (secret partagé, envoyé via header `x-cron-secret`)
- `APP_BASE_URL` (URL publique de l'app, ex: `https://extia-com.netlify.app`)
- (optionnel) `YOUTUBE_CHANNEL_HANDLE` (défaut: `@Extiaconseil`)
- (recommandé prod) `SUPABASE_URL`
- (recommandé prod) `SUPABASE_SERVICE_ROLE_KEY`

Comportement:
- Vérifie les nouvelles vidéos de la chaîne.
- Ne traite que les vidéos **nouvelles** (jamais traitées avant).
- Filtre: uniquement vidéos de **plus de 20 minutes**.
- Lance automatiquement: transcript + ideas + seo + linkedin.
- Stocke l'état + résultats dans Supabase si configuré, sinon fallback fichiers locaux (`data/youtube-sync-state.json` et `data/youtube-sync-results.json`).

SQL Supabase (à exécuter une fois):

```sql
create table if not exists public.youtube_sync_state (
  id text primary key,
  processed_video_ids jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.youtube_sync_results (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  payload jsonb not null
);
```

Configuration cron-jobs.org:
- URL: `https://<votre-domaine>/api/cron/youtube-sync`
- Méthode: `POST`
- Header: `x-cron-secret: <CRON_SECRET>`
- Fréquence recommandée: 2x/jour (ex: 08:00 et 18:00 Europe/Paris)

# extia-com
