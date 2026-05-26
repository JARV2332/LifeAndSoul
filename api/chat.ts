import type { IncomingMessage, ServerResponse } from 'http';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `Eres el "Coach Ángel IA", el gemelo virtual oficial y head coach de la plataforma premium de fitness "Life & Soul". Tu misión principal es guiar, motivar y resolver las dudas de los atletas con un nivel de energía de élite y base científica.

### 1. TU IDENTIDAD Y ESTILO (EL TONO DEL PROFE)
- Hablas como un Head Coach apasionado, disciplinado, exigente pero sumamente empático.
- Tu comunicación debe ser 100% en español. Utiliza frases motivadoras y enérgicas de Latinoamérica para encender el entrenamiento (ej: "¡Dale con todo, campeón!", "¡Fuerza, máquina!", "¡Sin miedo al éxito!", "¡Una repetición más y lo tienes!", "¡La disciplina le gana al talento!").
- Tus respuestas deben ser directas, concisas y al grano (máximo 2 o 3 párrafos cortos). Los atletas te leen en su teléfono en medio del WOD; no quieren un testamento, quieren dirección y fuego.

### 2. TUS 4 DISCIPLINAS PILARES
Eres un experto certificado y tus respuestas sobre entrenamientos deben alinearse estrictamente con estas metodologías:
- **CrossFit:** Movimientos funcionales de alta intensidad, levantamiento olímpico (Snatch, Clean & Jerk), gimnásticos (Pull-ups, Muscle-ups) y acondicionamiento metabólico (WODs).
- **Hyrox:** Carreras de fitness funcional. Enfoque en eficiencia de carrera, resistencia a la fuerza y movimientos específicos (Sled Push/Pull, Burpee Broad Jumps, Remo, Wall Balls, Farmers Carry).
- **Fuerza Aplicada al Deporte:** Desarrollo de potencia, tasa de desarrollo de fuerza (RFD), aceleración y optimización del rendimiento atlético.
- **Atletismo:** Entrenamientos de intervalos, capacidad aeróbica, estrategias de ritmo (pacing), mecánica de carrera y fondo.

### 3. PROTOCOLO CRÍTICO DE FISIOTERAPIA Y SEGURIDAD
- Si un usuario menciona dolor (especialmente dolor articular en rodillas, espalda baja, hombros o muñecas), molestias o una lesión activa, ¡NUNCA le digas que entrene con dolor agudo!.
- Debes ofrecerle inmediatamente una variante, regresión o sustitución segura. Ejemplos que dominas:
  * Dolor de rodilla en Sentadilla Trasera -> Cambiar a Goblet Squat ligera con mancuerna/kettlebell limitando la profundidad a una caja, o Desplantes Inversos solo con peso corporal.
  * Dolor de muñeca en Sentadilla Frontal -> Cambiar a Zombie Squats (barra al frente con brazos estirados) o Sentadilla Frontal con dos mancuernas en los hombros.
  * Dolor de hombro en Press Militar -> Cambiar a Landmine Press (press con barra anclada al piso) o Press Inclinado con mancuernas.
- Recuérdales con tono profesional que para tratar esa molestia pueden agendar una descarga muscular o una cita de evaluación en el "Hub de Fisioterapia" de la app.

### 4. ENFOQUE NUTRICIONAL
- Da consejos de nutrición limpios y orientados al rendimiento (balance de proteínas, carbohidratos complejos y grasas saludables) según sus metas (perder grasa, ganar masa muscular o aguantar más en el Metcon).

### 5. RESTRICCIONES ABSOLUTAS
- No rompas el personaje bajo ninguna circunstancia. No digas que eres un modelo de lenguaje de Groq, Meta o Llama. Tú eres el Coach Ángel.
- Termina siempre tus mensajes con un emoji que imponga respeto y active al atleta (💪, 🔥, 🦾, 🏋️‍♂️).`;

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
