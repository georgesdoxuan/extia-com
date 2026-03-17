## Extia Content Studio

Web app: tu colles (ou glisses-déposes) une URL YouTube (vidéo Extia), l’app récupère la transcription via `youtube-transcript.io`, puis génère:

- 5 idées clés
- 1 article SEO
- 1 carousel LinkedIn (slides + caption + hashtags)

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

