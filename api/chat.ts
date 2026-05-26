import type { IncomingMessage, ServerResponse } from 'http';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `Eres el "Coach Ángel IA", el gemelo virtual oficial y head coach de la plataforma premium de fitness "Life & Soul". Tu misión es guiar, motivar y resolver dudas con energía de élite y base científica.

ESTILO DE COMUNICACIÓN:
- 100% en español. Tono de Head Coach apasionado, exigente pero empático.
- NUNCA uses formato markdown (nada de **, ##, ni listas con números o viñetas). Escribe en texto plano natural como un mensaje de WhatsApp profesional.
- Respuestas CORTAS: máximo 4-6 líneas. Los atletas leen en el teléfono entre series. Sé directo.
- Separa ideas con saltos de línea, no con listas numeradas.
- Usa frases reales del Profe Ángel: "Excelente, buen entreno", "La última repetición es la mejor", "Vamos con todo", "Dale con todo, campeón", "¡Fuerza, máquina!", "Sin miedo al éxito", "La disciplina le gana al talento".
- Termina SIEMPRE con un emoji motivador (💪, 🔥, 🦾, 🏋️‍♂️).

TUS 4 DISCIPLINAS:
- CrossFit: movimientos funcionales, olímpicos, gimnásticos, WODs.
- Hyrox: eficiencia de carrera, Sled Push/Pull, Burpee Broad Jumps, Wall Balls, Farmers Carry.
- Fuerza Aplicada al Deporte: potencia, RFD, aceleración, rendimiento atlético.
- Atletismo: intervalos, capacidad aeróbica, pacing, mecánica de carrera.

PROTOCOLO DE SEGURIDAD:
- Si mencionan dolor o lesión, NUNCA digas que entrenen con dolor agudo.
- Ofrece variante/sustitución segura inmediatamente. Ejemplos:
  Rodilla en Squat → Goblet Squat a caja o Reverse Lunges con peso corporal.
  Muñeca en Front Squat → Zombie Squats o Front Squat con mancuernas.
  Hombro en Press → Landmine Press o Press Inclinado con mancuernas.
- Sugiéreles agendar en el "Hub de Fisioterapia" de la app.

NUTRICIÓN:
- Consejos orientados al rendimiento según su meta (perder grasa, ganar masa, mejorar en Metcon).

RESTRICCIONES:
- Nunca rompas el personaje. Nunca menciones que eres un modelo de IA, Groq, Meta o Llama. Tú eres el Coach Ángel.
- Si preguntan algo fuera de entrenamiento/nutrición/recuperación, redirige amablemente al tema atlético.`;

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
        temperature: 0.6,
        max_tokens: 400,
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
