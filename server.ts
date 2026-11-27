import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT) || 3000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '32kb' }));

interface CampaignBody {
  project?: unknown;
  target?: unknown;
  goal?: unknown;
  channel?: unknown;
}

function sanitizeField(value: unknown, maxLen: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLen);
}

const SYSTEM_INSTRUCTION = `Tu es un stratège senior en marketing digital et storytelling francophone.
Tu adaptes la méthode en trois temps (Attirer, Engager, Convertir) au projet précis fourni par l'utilisateur.
Tes réponses doivent être entièrement rédigées en français naturel, concis, concret et immédiatement exploitable — sans jargon creux ni anglicismes inutiles.
Respecte strictement la structure JSON demandée :
- attirer : une accroche prête à publier (percutante, directement adressée à la cible), un format conseillé concret et une brève justification du format.
- engager : un récit court (3 à 4 phrases fluides) qui part du problème vécu par la cible, introduit une tension réelle et montre une transformation concrète grâce au projet, ainsi que les trois balises narratives résumées (situation, tension, transformation).
- convertir : un appel à l'action précis et sans friction, l'indicateur clé de performance le plus cohérent avec l'objectif, et une courte explication de la façon de le mesurer.`;

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/campaign', async (req, res) => {
  const body = (req.body ?? {}) as CampaignBody;
  const project = sanitizeField(body.project, 400);
  const target = sanitizeField(body.target, 250);
  const goal = sanitizeField(body.goal, 250);
  const channel = sanitizeField(body.channel, 120);

  if (!project || !target || !goal) {
    res.status(400).json({
      error:
        'Merci de renseigner le projet, la cible et l’objectif avant de générer votre campagne.',
    });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    res.status(503).json({
      error:
        'La clé GEMINI_API_KEY n’est pas configurée côté serveur. Ajoutez-la dans les paramètres Secrets du projet puis réessayez.',
    });
    return;
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const userPrompt = [
    `Projet : ${project}`,
    `Cible : ${target}`,
    `Objectif principal : ${goal}`,
    channel ? `Canal de diffusion privilégié : ${channel}` : 'Canal de diffusion : à recommander selon la cible.',
    '',
    'Adapte concrètement la méthode Attirer / Engager / Convertir à ce projet en français.',
  ].join('\n');

  const callGemini = () =>
    ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          required: ['attirer', 'engager', 'convertir'],
          properties: {
            attirer: {
              type: Type.OBJECT,
              required: ['accroche', 'formatConseille', 'justificationFormat'],
              properties: {
                accroche: {
                  type: Type.STRING,
                  description: 'Une accroche prête à publier, percutante et adaptée à la cible.',
                },
                formatConseille: {
                  type: Type.STRING,
                  description: 'Le format de contenu recommandé (ex. Réel 30 s, Carrousel LinkedIn, Newsletter).',
                },
                justificationFormat: {
                  type: Type.STRING,
                  description: 'Une phrase expliquant pourquoi ce format capte efficacement cette cible.',
                },
              },
            },
            engager: {
              type: Type.OBJECT,
              required: ['recitCourt', 'situation', 'tension', 'transformation'],
              properties: {
                recitCourt: {
                  type: Type.STRING,
                  description: 'Un récit court et vivant (3 à 4 phrases) reliant problème, tension et transformation.',
                },
                situation: {
                  type: Type.STRING,
                  description: 'Le point de départ vécu par la cible (1 phrase courte).',
                },
                tension: {
                  type: Type.STRING,
                  description: 'L’obstacle ou la frustration clé (1 phrase courte).',
                },
                transformation: {
                  type: Type.STRING,
                  description: 'Le changement concret apporté par le projet (1 phrase courte).',
                },
              },
            },
            convertir: {
              type: Type.OBJECT,
              required: ['appelAction', 'indicateurCle', 'methodeMesure'],
              properties: {
                appelAction: {
                  type: Type.STRING,
                  description: 'Un appel à l’action précis, clair et prêt à l’emploi.',
                },
                indicateurCle: {
                  type: Type.STRING,
                  description: 'L’indicateur clé cohérent avec l’objectif annoncé.',
                },
                methodeMesure: {
                  type: Type.STRING,
                  description: 'Comment suivre concrètement cet indicateur sur la campagne.',
                },
              },
            },
          },
        },
      },
    });

  try {
    let response;
    try {
      response = await callGemini();
    } catch (firstErr: unknown) {
      const firstStatus =
        typeof firstErr === 'object' && firstErr !== null && 'status' in firstErr
          ? Number((firstErr as { status?: number }).status)
          : 500;
      if (firstStatus >= 500) {
        await new Promise((resolve) => setTimeout(resolve, 600));
        response = await callGemini();
      } else {
        throw firstErr;
      }
    }

    const rawText = response.text?.trim();
    if (!rawText) {
      res.status(502).json({
        error: 'L’agent n’a renvoyé aucun contenu exploitable. Veuillez réessayer.',
      });
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      res.status(502).json({
        error: 'La réponse reçue n’est pas dans le format attendu. Veuillez réessayer.',
      });
      return;
    }

    res.json({ campaign: parsed });
  } catch (err: unknown) {
    const status =
      typeof err === 'object' && err !== null && 'status' in err
        ? Number((err as { status?: number }).status)
        : 500;
    const message =
      err instanceof Error ? err.message : 'Erreur inconnue lors de la génération.';
    console.error('[api/campaign] Gemini error:', status);

    if (status === 401 || status === 403 || message.includes('API_KEY_INVALID')) {
      res.status(502).json({
        error:
          'Clé API Gemini invalide ou refusée. Vérifiez la variable GEMINI_API_KEY dans Settings > Secrets.',
      });
      return;
    }

    if (status === 429 || message.includes('RESOURCE_EXHAUSTED')) {
      res.status(429).json({
        error:
          'Limite de requêtes temporairement atteinte. Patientez quelques instants puis réessayez.',
      });
      return;
    }

    res.status(502).json({
      error:
        'Impossible de joindre l’agent Gemini pour le moment. Vos champs sont conservés : vous pouvez réessayer.',
    });
  }
});

async function startServer() {
  if (!IS_PRODUCTION) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.use((_req, res) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build non trouvé.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Serveur prêt sur http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Échec du démarrage du serveur :', error);
  process.exit(1);
});
