import {
  ChevronRight,
  Check,
  Calendar,
  Video,
  Brain,
  HeartPulse,
  Zap,
  Target,
  Activity,
  Lock,
  User,
  Mail,
  CreditCard,
  Star,
} from 'lucide-react';

const LOGO_SRC = '/logo.png';

function cn(...c: (string | false | undefined)[]) {
  return c.filter(Boolean).join(' ');
}

interface MarketingLandingProps {
  landingSub: 'hero' | 'checkout';
  setLandingSub: (sub: 'hero' | 'checkout') => void;
  onStartFree: () => void;
  onMeetCoach: () => void;
  checkoutName: string;
  setCheckoutName: (v: string) => void;
  checkoutEmail: string;
  setCheckoutEmail: (v: string) => void;
  checkoutCard: string;
  setCheckoutCard: (v: string) => void;
  checkoutExpiry: string;
  setCheckoutExpiry: (v: string) => void;
  checkoutCvc: string;
  setCheckoutCvc: (v: string) => void;
  onSubscribe: () => void;
}

const PROGRAMS = [
  { id: 'hyrox', name: 'Hyrox', desc: 'Carrera funcional. Sled, wall balls, farmer carry y resistencia de élite.' },
  { id: 'crossfit', name: 'CrossFit', desc: 'Alta intensidad, olímpicos, gimnásticos y WODs que transforman.' },
  { id: 'strength', name: 'Fuerza Aplicada', desc: 'Potencia, RFD y rendimiento atlético con base científica.' },
  { id: 'athletics', name: 'Atletismo', desc: 'Intervalos, pacing, mecánica de carrera y capacidad aeróbica.' },
];

const AUDIENCE = [
  {
    title: 'Nuevo en el entrenamiento',
    desc: '¿Primera vez en functional o Hyrox? Te damos estructura, confianza y un plan claro para empezar fuerte.',
  },
  {
    title: 'Buscando tu mejor marca',
    desc: 'Ya entrenas pero sabes que tienes más. La progresión específica es lo que separa un buen día de un gran día.',
  },
  {
    title: 'Tu workout, siempre listo',
    desc: 'Abre el box online y tu sesión está ahí. Sin adivinar, sin improvisar. Solo entrena.',
  },
  {
    title: 'Hecho para tu deporte',
    desc: 'Fuerza, carrera, estaciones y metcon. Cada bloque está diseñado para que tu fitness se note cuando importa.',
  },
];

const INCLUDED = [
  'Programación diaria por disciplina con bloques de calentamiento, fuerza y metcon.',
  '2 a 5 días por semana según tu horario. Sesiones de 60 a 90 minutos.',
  'Movimientos de alto retorno: barra, mancuernas, kettlebells, sleds y cardio.',
  'Escalado por RPE para que funcione si eres principiante o atleta avanzado.',
  'Videos de técnica y biblioteca de movimientos subidos por el coach.',
  'Coach Ángel IA 24/7 para dudas, sustituciones y motivación en tiempo real.',
  'Cocina digital con recetas y guía nutricional para alto rendimiento.',
  'Hub de fisioterapia: prevención, citas y notas clínicas integradas.',
];

const FAQ = [
  {
    q: '¿Cuánto duran las sesiones?',
    a: 'Entre 60 y 90 minutos, diseñadas como una sesión completa por día.',
  },
  {
    q: '¿Qué pasa si me pierdo un día?',
    a: 'Tu programación queda en el box online. Retomas cuando puedas sin perder el hilo.',
  },
  {
    q: '¿Es para principiantes?',
    a: 'Sí. No necesitas experiencia previa. El escalado por RPE adapta cada sesión a tu nivel actual.',
  },
  {
    q: '¿Qué equipamiento necesito?',
    a: 'Acceso a barra, mancuernas, kettlebells, cardio (rower/bike/carrera) y preferiblemente sled.',
  },
  {
    q: '¿Incluye el Coach IA?',
    a: 'Sí. Coach Ángel IA responde dudas de técnica, sustituciones y nutrición las 24 horas.',
  },
  {
    q: '¿Puedo cancelar cuando quiera?',
    a: 'Sí. Sin compromisos ocultos. Cancela tu suscripción en cualquier momento.',
  },
];

export function MarketingLanding({
  landingSub,
  setLandingSub,
  onStartFree,
  onMeetCoach,
  checkoutName,
  setCheckoutName,
  checkoutEmail,
  setCheckoutEmail,
  checkoutCard,
  setCheckoutCard,
  checkoutExpiry,
  setCheckoutExpiry,
  checkoutCvc,
  setCheckoutCvc,
  onSubscribe,
}: MarketingLandingProps) {
  if (landingSub === 'checkout') {
    return (
      <section className="mx-auto max-w-md px-4 py-16">
        <button
          type="button"
          onClick={() => setLandingSub('hero')}
          className="mb-6 flex items-center gap-1 text-sm text-gray-400 transition hover:text-white"
        >
          <ChevronRight size={14} className="rotate-180" />
          Volver
        </button>
        <div className="rounded-xl border border-zinc-800 bg-[#161618] p-8">
          <div className="mb-6 text-center">
            <img src={LOGO_SRC} alt="Life & Soul" className="mx-auto mb-4 h-24 w-auto" />
            <h2 className="text-xl font-black uppercase tracking-tighter text-white">Únete al Team</h2>
            <p className="mt-1 text-sm text-gray-400">Acceso inmediato al Box Online</p>
          </div>
          <div className="mb-6 rounded-lg border border-[#A3E635]/30 bg-[#A3E635]/10 p-4 text-center">
            <p className="text-2xl font-black text-[#A3E635]">Q399<span className="text-sm text-gray-400">/mes</span></p>
            <p className="text-[10px] text-gray-500">Plan Elite · Todas las disciplinas incluidas</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="ls-label"><User size={12} /> Nombre</label>
              <input type="text" value={checkoutName} onChange={(e) => setCheckoutName(e.target.value)} placeholder="Tu nombre completo" className="ls-input" />
            </div>
            <div>
              <label className="ls-label"><Mail size={12} /> Email</label>
              <input type="email" value={checkoutEmail} onChange={(e) => setCheckoutEmail(e.target.value)} placeholder="tu@email.com" className="ls-input" />
            </div>
            <div>
              <label className="ls-label"><CreditCard size={12} /> Tarjeta</label>
              <input type="text" value={checkoutCard} onChange={(e) => setCheckoutCard(e.target.value)} placeholder="4242 4242 4242 4242" maxLength={19} className="ls-input" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="ls-label">MM/AA</label>
                <input type="text" value={checkoutExpiry} onChange={(e) => setCheckoutExpiry(e.target.value)} placeholder="12/28" maxLength={5} className="ls-input" />
              </div>
              <div>
                <label className="ls-label">CVC</label>
                <input type="text" value={checkoutCvc} onChange={(e) => setCheckoutCvc(e.target.value)} placeholder="123" maxLength={4} className="ls-input" />
              </div>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-500">
              <Lock size={10} className="text-[#A3E635]" /> Pago seguro con Stripe
            </div>
            <button type="button" onClick={onSubscribe} className="ls-btn-primary w-full">
              PAGAR E ENTRAR AL BOX
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* HERO — HWPO style */}
      <section className="relative overflow-hidden border-b border-zinc-800">
        <div className="ls-glow -right-40 top-0 h-[500px] w-[500px] bg-[#A3E635]/8" />
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-2 lg:items-center lg:px-6 lg:py-24">
          <div>
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.35em] text-[#A3E635]">
              Life & Soul · Functional Training
            </p>
            <h1 className="font-black uppercase leading-[1.05] tracking-tighter text-white text-4xl md:text-5xl lg:text-6xl">
              El plan de entrenamiento que te mantiene fuerte y listo todo el año
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-gray-400">
              Deja de entrenar con programas genéricos. Empieza a entrenar con propósito, técnica y la metodología Life & Soul.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={14} className="fill-[#A3E635] text-[#A3E635]" />
                ))}
              </div>
              <span>Atletas de élite en Guatemala confían en nosotros</span>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={onStartFree} className="ls-btn-primary">
                Empezar gratis
                <ChevronRight size={18} />
              </button>
              <button type="button" onClick={onMeetCoach} className="ls-btn-ghost">
                Conoce al Coach
              </button>
            </div>
            <p className="mt-3 text-[10px] text-gray-600">Prueba 14 días. Cancela cuando quieras.</p>
          </div>

          {/* Pricing card */}
          <div className="relative">
            <div className="overflow-hidden rounded-xl border border-zinc-800 bg-[#161618]">
              <img
                src="/team/angel-11.png"
                alt="Atleta Life & Soul"
                className="aspect-[4/3] w-full object-cover object-top"
              />
              <div className="p-6">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Plan Elite</p>
                    <p className="text-4xl font-black text-white">
                      Q399<span className="text-lg text-gray-500">/mes</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 line-through">Q4,788/año</p>
                    <p className="text-sm font-black text-[#A3E635]">Q3,828/año</p>
                    <p className="text-[9px] text-gray-600">Ahorra 20%</p>
                  </div>
                </div>
                <ul className="mt-4 space-y-2">
                  {['4 disciplinas incluidas', 'Coach Ángel IA 24/7', 'Box Online completo'].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-gray-300">
                      <Check size={14} className="shrink-0 text-[#A3E635]" />
                      {item}
                    </li>
                  ))}
                </ul>
                <button type="button" onClick={onStartFree} className="ls-btn-primary mt-5 w-full text-sm">
                  Empezar gratis
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Audience cards */}
      <section className="border-b border-zinc-800 bg-[#161618]/50 py-16">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <h2 className="mx-auto max-w-2xl text-center font-black uppercase tracking-tighter text-white text-2xl md:text-3xl">
            Para atletas que no quieren dejar rendimiento en la mesa
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {AUDIENCE.map((item) => (
              <div key={item.title} className="rounded-xl border border-zinc-800 bg-[#161618] p-5 transition hover:border-[#333]">
                <h3 className="font-black uppercase tracking-tight text-white text-sm">{item.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs */}
      <section id="programas" className="py-16">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#A3E635] mb-3">Metodología</p>
              <h2 className="font-black uppercase tracking-tighter text-white text-2xl md:text-3xl">
                Programación estructurada que te hace progresar bloque a bloque
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-gray-400">
                Life & Soul es nuestro programa anual de entrenamiento funcional, diseñado para principiantes y atletas experimentados que quieren estructura específica cada semana — con o sin competencia en el calendario.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-400">
                Cada bloque de 8 semanas desarrolla fuerza, resistencia y capacidad de trabajo con movimientos de alto retorno. Sesiones de 60 a 90 minutos, 2 a 5 días por semana según tu agenda.
              </p>
              <button type="button" onClick={onStartFree} className="ls-btn-primary mt-6 text-sm">
                Empezar gratis
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {PROGRAMS.map((prog) => (
                <div key={prog.id} className="rounded-xl border border-zinc-800 bg-[#161618] p-4 hover:border-[#A3E635]/30 transition">
                  <h3 className="font-black uppercase text-[#A3E635] text-sm">{prog.name}</h3>
                  <p className="mt-1.5 text-xs text-gray-400">{prog.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What's included */}
      <section className="border-y border-zinc-800 bg-[#161618]/50 py-16">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <h2 className="font-black uppercase tracking-tighter text-white text-2xl md:text-3xl mb-8">
            ¿Qué incluye tu membresía?
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {INCLUDED.map((item) => (
              <div key={item} className="flex gap-3 rounded-lg border border-zinc-800 bg-[#0B0B0C] p-4">
                <Check size={16} className="mt-0.5 shrink-0 text-[#A3E635]" />
                <p className="text-xs leading-relaxed text-gray-300">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: <Zap size={22} />, title: 'Más fuerte cada bloque', desc: 'Progresión de 8 semanas alrededor de las demandas reales de tu deporte.' },
              { icon: <Target size={22} />, title: 'Que se note en competencia', desc: 'Movimientos que transfieren directo a carrera, estaciones y metcon.' },
              { icon: <Activity size={22} />, title: 'Listo para cada start line', desc: 'Entrenamiento consistente que construye la base que necesitas el día de la prueba.' },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-zinc-800 bg-[#161618] p-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#A3E635]/15 text-[#A3E635]">
                  {item.icon}
                </div>
                <h3 className="font-black uppercase tracking-tight text-white text-sm">{item.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App preview */}
      <section className="border-y border-zinc-800 bg-[#161618]/50 py-16">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-black uppercase tracking-tighter text-white text-2xl md:text-3xl">
                Acceso instantáneo al Box Online
              </h2>
              <p className="mt-4 text-sm text-gray-400">
                Tus WODs diarios, videos de técnica, cronómetro, progreso y Coach IA — todo en un solo lugar.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  { icon: <Calendar size={16} />, label: 'WOD diario' },
                  { icon: <Video size={16} />, label: 'Videos técnica' },
                  { icon: <Brain size={16} />, label: 'Coach IA 24/7' },
                  { icon: <HeartPulse size={16} />, label: 'Fisioterapia' },
                ].map((f) => (
                  <div key={f.label} className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-[#0B0B0C] px-3 py-2.5 text-xs text-gray-300">
                    <span className="text-[#A3E635]">{f.icon}</span>
                    {f.label}
                  </div>
                ))}
              </div>
              <button type="button" onClick={onStartFree} className="ls-btn-primary mt-6 text-sm">
                Entrar al Box Online
              </button>
            </div>
            <div className="overflow-hidden rounded-xl border border-zinc-800 bg-[#0B0B0C] p-4 shadow-2xl">
              <div className="mb-3 flex gap-1">
                {['Panel Atleta', 'Coach', 'Cocina'].map((tab, i) => (
                  <span
                    key={tab}
                    className={cn(
                      'rounded-md px-3 py-1.5 text-[10px] font-bold uppercase',
                      i === 0 ? 'bg-[#A3E635] text-black' : 'bg-[#242427] text-gray-400'
                    )}
                  >
                    {tab}
                  </span>
                ))}
              </div>
              <div className="space-y-3">
                <div className="rounded-lg border border-zinc-800 bg-[#161618] p-4">
                  <p className="text-[10px] font-black uppercase text-[#A3E635]">A. Calentamiento</p>
                  <p className="mt-1 text-xs text-gray-400">800m trote + wall balls + farmer carry...</p>
                </div>
                <div className="rounded-lg border border-zinc-800 bg-[#161618] p-4">
                  <p className="text-[10px] font-black uppercase text-[#A3E635]">B. Fuerza</p>
                  <p className="mt-1 text-xs text-gray-400">Back Squat 5×5 @ 75%</p>
                </div>
                <div className="rounded-lg border border-zinc-800 bg-[#161618] p-4">
                  <p className="text-[10px] font-black uppercase text-[#A3E635]">C. Metcon</p>
                  <p className="mt-1 font-mono text-lg font-black text-[#A3E635]">12:34</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet coach */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="overflow-hidden rounded-xl border border-zinc-800">
              <img src="/team/angel-10.png" alt="Coach Ángel Campos" className="aspect-square w-full object-cover object-top" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#A3E635] mb-3">Head Coach</p>
              <h2 className="font-black uppercase tracking-tighter text-white text-2xl md:text-3xl">
                Conoce a tu coach: Ángel Campos
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-gray-400">
                Ex velocista y atleta nacional con más de 22 años en el deporte. Campeón centroamericano en relevos 4×100m y subcampeón en 200m y 400m. Fundador de Life & Soul y la Academia Endurance.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-400">
                Su experiencia como atleta y coach — desde clubes de atletismo en Guatemala hasta el Colegio Americano — le da una comprensión única de cómo progresar en cada nivel con programación que entrega resultados reales.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {['Campeón Centroamericano', 'Ex Velocista Nacional', '22 años de experiencia'].map((badge) => (
                  <span key={badge} className="rounded-full bg-[#A3E635]/15 px-3 py-1 text-[10px] font-bold uppercase text-[#A3E635]">
                    {badge}
                  </span>
                ))}
              </div>
              <button type="button" onClick={onMeetCoach} className="ls-btn-ghost mt-6 text-sm">
                Ver historia completa
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-zinc-800 bg-[#161618]/50 py-16">
        <div className="mx-auto max-w-3xl px-4 lg:px-6">
          <h2 className="text-center font-black uppercase tracking-tighter text-white text-2xl mb-8">
            Preguntas frecuentes
          </h2>
          <div className="space-y-3">
            {FAQ.map((item) => (
              <details key={item.q} className="group rounded-xl border border-zinc-800 bg-[#161618]">
                <summary className="cursor-pointer list-none px-5 py-4 text-sm font-bold text-white [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span className="float-right text-[#A3E635] transition group-open:rotate-45">+</span>
                </summary>
                <p className="border-t border-zinc-800 px-5 py-4 text-xs leading-relaxed text-gray-400">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-2xl px-4 text-center lg:px-6">
          <h2 className="font-black uppercase tracking-tighter text-white text-3xl md:text-4xl">
            Tu historia empieza aquí
          </h2>
          <p className="mt-4 text-sm text-gray-400">
            Únete a Life & Soul y empieza a entrenar con propósito hoy.
          </p>
          <button type="button" onClick={onStartFree} className="ls-btn-primary mt-8">
            Empezar gratis — 14 días
            <ChevronRight size={18} />
          </button>
          <p className="mt-3 text-[10px] text-gray-600">Cancela cuando quieras. Sin compromisos.</p>
        </div>
      </section>
    </>
  );
}
