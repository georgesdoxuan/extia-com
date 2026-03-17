/** Réduit la taille du transcript pour limiter la latence (timeouts hébergeur). */
export function condenseTranscriptForAi(transcript: string): string {
  const t = transcript.replace(/\s+/g, " ").trim();
  const maxChars = 18000;
  if (t.length <= maxChars) return t;
  const head = t.slice(0, 9000);
  const tail = t.slice(-6000);
  return [
    head,
    "\n\n[... transcript tronqué pour performance (timeout) ...]\n\n",
    tail,
  ].join("");
}
