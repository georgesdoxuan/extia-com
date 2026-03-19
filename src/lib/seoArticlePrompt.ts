/**
 * Consignes pour l’article SEO : format court, structure type billet pro,
 * compatible copier-coller sans puces (les tirets disparaissent souvent).
 */
export const SEO_ARTICLE_STRUCTURE_FR = `
Structure et forme (obligatoire) — texte brut uniquement :

1) **Première ligne** : le **titre** de l’article (une ligne, accrocheur, pas de préfixe ## ni Markdown).

2) **Audience & intention (obligatoire)** : écrire pour des **clients/prospects** et des **candidats IT** (Dev, DevOps, Data, Cloud, Web, ingénieurs) — adapter le vocabulaire au sujet. Le texte doit donner envie de travailler avec/rejoindre Extia, sans sonner comme une pub.

3) **Démarrage direct (obligatoire)** : après une ligne vide, commencer **immédiatement** par un hook utile pour un lectorat tech (problème concret, insight, trade-off, résultat, angle “consulting”). **Aucune phrase d’introduction générique** (ex: « Dans un monde en constante évolution… », « Aujourd’hui plus que jamais… », « Il est important de… »). Maximum **1 court paragraphe d’ouverture** avant d’entrer dans les sections.

4) **Sous-parties cohérentes + progression “consulting”** : 3 à 5 sections, avec une **progression logique** (ex: cadrage → mécanismes → implications architecture/ops → cas d’usage → risques/bonnes pratiques → projection). Chaque section commence par une **question préfixée ##** (ex: ## Pourquoi les LLMs changent-ils tout ?), sur sa propre ligne. Saut de ligne, puis le développement.

5) **Lisibilité pour profils tech (obligatoire)** : paragraphes courts, phrases denses. Pour rythmer, utiliser des **bullet points Markdown** (format: - élément) quand plusieurs éléments sont listés (3+ points, avantages, étapes, outils). Ne pas mettre de mots en gras dans les paragraphes — le gras est réservé aux titres de section ## uniquement.

6) **Ton expert (obligatoire)** : écrire comme un ingénieur senior ou un consultant tech qui connaît le sujet de l’intérieur. Pas de vulgarisation excessive. Utiliser les bons termes sans les expliquer comme à un débutant. Appeler les choses par leur nom : si c’est du RAG, dire RAG ; si c’est du fine-tuning, dire fine-tuning ; si c’est un problème de latence p99, le dire. Zéro phrase du type “dans un monde en constante évolution”, “de plus en plus”, “il est essentiel de”, “à l’heure où”, “révolutionner”, “game-changer”, “bouleverser” — ces tournures sont interdites car elles sonnent creux pour un lectorat technique.

7) **Profondeur technique réelle (obligatoire)** : chaque section doit apporter un insight qu’un praticien trouverait utile. Mentionner les trade-offs concrets, les limites connues, les pièges classiques. Si le sujet touche à l’IA : distinguer clairement génératif vs agentique, tool-calling, orchestration, grounding, hallucinations, évaluation des outputs, coût d’inférence. Si DevOps/Cloud : parler de latence, observabilité, résilience, blast radius, drift de configuration. Si Data : pipeline, qualité des données, feature store, lineage. Intégrer naturellement au raisonnement, jamais en glossaire.

8) **Orienté usage métier** : répondre implicitement à “et concrètement pour nous ?” via 2–4 exemples de cas d’usage (code, doc, analyse, run, incidents, architecture, automatisation) et l’impact (Dev, DevOps, Data).

9) **Vision & prospective** : inclure une courte projection (tendances, maturité, implications d’architecture/organisation) sans inventer de faits/chiffres.

10) **Conclusion** : 1–2 paragraphes qui synthétisent et ouvrent (positionnement Extia subtil si pertinent), puis une **dernière phrase courte et percutante**.

11) **Longueur** : viser **environ 450 à 700 mots** — rester dense et lisible.

12) **Style rédactionnel** : phrases actives, concrètes, orientées action; pas de remplissage ni de généralités vagues. Chaque paragraphe doit apporter une information exploitable.

13) **Interdits** : HTML, et section « FAQ » en fin d’article. Les questions doivent apparaître comme **titres de section ## interrogatifs** dans le corps. Le Markdown (##, **, -) est autorisé et souhaité pour la mise en forme.

14) **Extia** : intégrer Extia de façon subtile (expertise, masterclass/communautés si pertinent), + CTA discret vers extia.fr si naturel ; ne pas inventer de chiffres, labels ou faits hors transcript + contexte marque.
`.trim();
