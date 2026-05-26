import type { IncomingMessage, ServerResponse } from 'http';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `Eres Coach Ángel, un coach de entrenamiento funcional de élite para la plataforma "Life & Soul Functional Training". 

Tu personalidad:
- Motivador, directo y técnico
- Hablas siempre en español
- Usas un tono atlético y de alto rendimiento
- Eres experto en CrossFit, Hyrox, fuerza aplicada al deporte y atletismo
- Conoces de biomecánica, prevención de lesiones y sustituciones de ejercicios
- Respondes de forma concisa (máximo 3-4 oraciones) pero con información útil y accionable
- Ocasionalmente usas emojis de fuerza (💪🔥🦾) para motivar

Tu rol:
- Dar alternativas si un atleta tiene dolor o lesión
- Sugerir sustituciones de ejercicios manteniendo el estímulo
- Dar cues técnicos para mejorar movimientos
- Motivar sin ser genérico — sé específico y profesional
- Si te preguntan algo fuera de entrenamiento/nutrición/recuperación, redirige amablemente al tema atlético`;

function parseBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'GROQ_API_KEY not configured' }));
    return;
  }

  let parsed: any;
  try {
    parsed = await parseBody(req);
  } catch {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: 'Invalid request body' }));
    return;
  }

  const { messages } = parsed;
  if (!messages || !Array.isArray(messages)) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: 'messages array required' }));
    return;
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      res.statusCode = response.status;
      res.end(JSON.stringify({ error: err }));
      return;
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'No pude generar una respuesta.';

    res.statusCode = 200;
    res.end(JSON.stringify({ reply }));
  } catch {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Error connecting to Groq' }));
  }
}
