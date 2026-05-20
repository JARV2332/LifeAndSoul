import { useState, useEffect, useRef, type ReactNode } from 'react';
import {
  Menu,
  X,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Video,
  Check,
  Send,
  Download,
  Calendar,
  Clock,
  Dumbbell,
  Brain,
  HeartPulse,
  UtensilsCrossed,
  MessageCircle,
  LayoutDashboard,
  Home,
  CreditCard,
  User,
  Mail,
  Lock,
  Flame,
  Target,
  Zap,
  Shield,
  Activity,
  BookOpen,
  Stethoscope,
  FileText,
  ClipboardList,
  Plus,
  Trash2,
  Upload,
  Link,
} from 'lucide-react';
import { DatePicker, WeekDayStrip } from './components/DatePicker';
import {
  type Discipline,
  type WorkoutProgram,
  loadPrograms,
  savePrograms,
  findProgram,
} from './lib/programs';

type View = 'landing' | 'dashboard' | 'coach' | 'kitchen' | 'physio' | 'professor';
type LandingSub = 'hero' | 'checkout';

interface ChatMessage {
  id: number;
  sender: 'user' | 'coach';
  text: string;
}

interface Recipe {
  id: string;
  name: string;
  tag: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  emoji: string;
}

const DISCIPLINES: { id: Discipline; label: string }[] = [
  { id: 'hyrox', label: 'Hyrox' },
  { id: 'crossfit', label: 'CrossFit' },
  { id: 'strength', label: 'Fuerza Aplicada al Deporte' },
  { id: 'athletics', label: 'Atletismo' },
];

const WOD_DATA: Record<
  Discipline,
  { warmup: string; strength: string; metcon: string; strengthLabel: string }
> = {
  hyrox: {
    warmup:
      '800 m trote suave + 2×20 Wall Balls + 2×50 m Farmer Carry ligero + 10 banded good mornings.',
    strength: 'Sled Push — 4×30 m @ RPE 8. Descanso 3 min entre series.',
    metcon:
      '4 rondas for time: 1 km Run, 50 m Sled Push, 50 m Sled Pull, 80 m Burpee Broad Jumps.',
    strengthLabel: 'Sled Push',
  },
  crossfit: {
    warmup:
      '3 rondas: 10 Cal Row, 10 PVC Pass-Throughs, 10 Air Squats, 10 Push-ups escalonados.',
    strength: 'Back Squat — 5×5 @ 75% 1RM. Descanso 2:30 entre series.',
    metcon:
      'AMRAP 12 min: 9 Thrusters (43/30 kg), 12 Pull-ups, 15 Box Jumps (60/50 cm).',
    strengthLabel: 'Back Squat',
  },
  strength: {
    warmup:
      'Movilidad cadera y tobillo: 90/90, Cossack squat, ankle rocks — 8 min total.',
    strength: 'Trap Bar Deadlift — 4×4 @ 82%. Tempo 3-1-1. Descanso 3 min.',
    metcon:
      'EMOM 16: Min 1 — 8 KB Swings, Min 2 — 6 DB Push Press, Min 3 — 10 V-ups, Min 4 — descanso.',
    strengthLabel: 'Trap Bar Deadlift',
  },
  athletics: {
    warmup:
      'Drills: A-skips, B-skips, high knees, butt kicks — 2×20 m cada uno + 400 m trote.',
    strength: 'Power Clean — 5×3 @ 70%. Enfoque en velocidad de barra.',
    metcon: '6×200 m sprint @ 85% con 2 min recuperación entre repeticiones.',
    strengthLabel: 'Power Clean',
  },
};

const STRENGTH_ROWS = [
  { id: 1, sets: '5', reps: '5', pct: '75%' },
  { id: 2, sets: '5', reps: '5', pct: '75%' },
  { id: 3, sets: '5', reps: '5', pct: '75%' },
  { id: 4, sets: '5', reps: '5', pct: '75%' },
  { id: 5, sets: '5', reps: '5', pct: '75%' },
];

const RECIPES: Recipe[] = [
  {
    id: 'oats',
    name: 'Bowl de Avena Proteico',
    tag: 'Desayuno',
    calories: 450,
    protein: 32,
    carbs: 48,
    fat: 12,
    emoji: '🥣',
    ingredients: [
      '80 g avena',
      '30 g proteína whey vainilla',
      '200 ml leche de almendras',
      '1 plátano',
      '15 g mantequilla de cacahuete',
      'Arándanos y canela',
    ],
  },
  {
    id: 'fajitas',
    name: 'Fajitas de Pollo Fitness',
    tag: 'Almuerzo',
    calories: 520,
    protein: 42,
    carbs: 38,
    fat: 18,
    emoji: '🌮',
    ingredients: [
      '200 g pechuga de pollo',
      '2 tortillas integrales',
      'Pimiento y cebolla',
      'Especias fajita',
      'Aguacate (media unidad)',
      'Yogur griego como crema',
    ],
  },
  {
    id: 'salmon',
    name: 'Salmón con Quinoa y Espárragos',
    tag: 'Cena',
    calories: 580,
    protein: 38,
    carbs: 42,
    fat: 24,
    emoji: '🐟',
    ingredients: [
      '180 g salmón',
      '80 g quinoa cocida',
      '150 g espárragos',
      'Limón y eneldo',
      'Aceite de oliva (1 cda)',
    ],
  },
  {
    id: 'shake',
    name: 'Shake Post-Entreno Recuperador',
    tag: 'Post-WOD',
    calories: 380,
    protein: 35,
    carbs: 45,
    fat: 6,
    emoji: '🥤',
    ingredients: [
      '40 g proteína chocolate',
      '1 plátano congelado',
      '250 ml leche',
      '30 g avena',
      'Pizca de sal',
      'Hielo',
    ],
  },
  {
    id: 'eggs',
    name: 'Tostada de Aguacate y Huevo',
    tag: 'Desayuno',
    calories: 410,
    protein: 22,
    carbs: 32,
    fat: 22,
    emoji: '🥑',
    ingredients: [
      '2 huevos pochados',
      '1 rebanada pan integral',
      'Medio aguacate',
      'Semillas de chía',
      'Sal y pimienta',
      'Tomate cherry',
    ],
  },
  {
    id: 'bowl',
    name: 'Bowl Mediterráneo de Atún',
    tag: 'Almuerzo',
    calories: 490,
    protein: 40,
    carbs: 35,
    fat: 16,
    emoji: '🥗',
    ingredients: [
      '150 g atún en conserva',
      'Arroz basmati (80 g cocido)',
      'Pepino, tomate, aceitunas',
      'Hummus (2 cdas)',
      'Aceite de oliva virgen extra',
      'Limón',
    ],
  },
];

const TIME_SLOTS = ['09:00', '10:30', '12:00', '16:00', '17:30', '19:00'];

const PREVENTION_ROUTINES = [
  {
    id: 'shoulder',
    title: 'Salud de Hombro',
    desc: 'Rotadores externos con banda, YTW en pared, face pulls — 3×12. Prevención de pinzamiento.',
    duration: '12 min',
  },
  {
    id: 'hip',
    title: 'Apertura de Cadera',
    desc: '90/90 stretch, pigeon pose, couch stretch, Cossack squat — post-entreno obligatorio.',
    duration: '15 min',
  },
  {
    id: 'ankle',
    title: 'Estabilidad de Tobillo',
    desc: 'Calf raises excéntricos, dorsiflexión con banda, balance unilateral en bosu.',
    duration: '10 min',
  },
];

const THERAPIST_NOTES = [
  {
    date: '18 May 2026',
    title: 'Recuperación rodilla izquierda',
    body: 'Mantener Goblet Squats en lugar de Back Squats esta semana. Aplicar hielo 15 min post-WOD. Reevaluar el jueves.',
    status: 'Activa',
  },
  {
    date: '12 May 2026',
    title: 'Descarga muscular — espalda baja',
    body: 'Sesión de flush completada. Movilidad lumbar mejorada. Continuar con protocolo de cadera 3×/semana.',
    status: 'Completada',
  },
  {
    date: '5 May 2026',
    title: 'Evaluación inicial hombro',
    body: 'ROM completo sin dolor. Autorizado para kipping pull-ups progresivos. Evitar muscle-ups hasta semana 3.',
    status: 'Completada',
  },
];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function cn(...classes: (string | false | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

function toEmbedUrl(url: string): string {
  if (!url) return '';
  if (url.includes('/embed/')) return url;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (match) return `https://www.youtube.com/embed/${match[1]}`;
  return url;
}

const LOGO_SRC = '/logo.png';

function Logo({ className }: { className?: string }) {
  return (
    <img
      src={LOGO_SRC}
      alt="Life & Soul Functional Training"
      className={cn('ls-logo', className)}
    />
  );
}

export default function LifeAndSoulApp() {
  const [view, setView] = useState<View>('landing');
  const [landingSub, setLandingSub] = useState<LandingSub>('hero');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [discipline, setDiscipline] = useState<Discipline>('hyrox');
  const [selectedDay, setSelectedDay] = useState(1);
  const [warmupDone, setWarmupDone] = useState(false);
  const [strengthChecks, setStrengthChecks] = useState<Record<number, boolean>>({});
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: 'user',
      text: 'Profe, hoy toca Sentadilla Trasera en el bloque de fuerza, pero me duele la rodilla izquierda. ¿Qué hago?',
    },
    {
      id: 2,
      sender: 'coach',
      text: '¡Buena pregunta, guerrero! Protege esa rodilla: sustituye las Back Squats por Goblet Squats ligeros (16 kg) o Reverse Lunges con peso corporal × 12 por pierna. Mantén el estímulo sin comprometer la articulación. Calienta bien con band walks antes del bloque. ¡Dale con todo, no te detengas! 🦾🔥',
    },
  ]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [physioTherapy, setPhysioTherapy] = useState('descarga');
  const [physioDate, setPhysioDate] = useState('');
  const [physioSlot, setPhysioSlot] = useState('');
  const [physioBooked, setPhysioBooked] = useState(false);
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [checkoutCard, setCheckoutCard] = useState('');
  const [checkoutExpiry, setCheckoutExpiry] = useState('');
  const [checkoutCvc, setCheckoutCvc] = useState('');
  const [preventionVideo, setPreventionVideo] = useState<string | null>(null);
  const [programs, setPrograms] = useState<WorkoutProgram[]>(() => loadPrograms());
  const [activeVideoTitle, setActiveVideoTitle] = useState('Biblioteca de Técnica');
  const [profForm, setProfForm] = useState({
    discipline: 'hyrox' as Discipline,
    date: '',
    title: '',
    warmup: '',
    strength: '',
    strengthLabel: '',
    metcon: '',
    videoUrl: '',
    videoTitle: 'Video técnica del movimiento',
  });
  const [profSaved, setProfSaved] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const weekDays = [
    { label: 'Lun', date: 18, iso: '2026-05-18', isToday: false },
    { label: 'Mar', date: 19, iso: '2026-05-19', isToday: true },
    { label: 'Mié', date: 20, iso: '2026-05-20', isToday: false },
    { label: 'Jue', date: 21, iso: '2026-05-21', isToday: false },
  ];

  const selectedDateISO = weekDays[selectedDay].iso;
  const activeProgram = findProgram(programs, discipline, selectedDateISO);
  const wod = activeProgram
    ? {
        warmup: activeProgram.warmup,
        strength: activeProgram.strength,
        metcon: activeProgram.metcon,
        strengthLabel: activeProgram.strengthLabel,
      }
    : WOD_DATA[discipline];

  const persistPrograms = (next: WorkoutProgram[]) => {
    setPrograms(next);
    savePrograms(next);
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (timerRunning) {
      interval = setInterval(() => setTimerSeconds((p) => p + 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSubscribe = () => {
    setIsSubscribed(true);
    setView('dashboard');
    setLandingSub('hero');
  };

  const handleSendChat = () => {
    const trimmed = chatInput.trim();
    if (!trimmed) return;
    setChatMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: 'user', text: trimmed },
      {
        id: Date.now() + 1,
        sender: 'coach',
        text: '¡Recibido! Analizo tu consulta y te doy la mejor alternativa para tu sesión de hoy. Recuerda: la técnica correcta siempre gana al ego. ¡Sigue fuerte! 💪🔥',
      },
    ]);
    setChatInput('');
  };

  const strengthDoneCount = Object.values(strengthChecks).filter(Boolean).length;
  const completionPct = Math.round(
    ((warmupDone ? 1 : 0) + strengthDoneCount + (timerSeconds > 0 ? 1 : 0)) / 7 * 100
  );

  const navItems: { id: View; label: string; icon: ReactNode; locked?: boolean }[] = [
    { id: 'landing', label: 'Inicio & Checkout', icon: <Home size={18} /> },
    { id: 'professor', label: 'Panel Profe', icon: <ClipboardList size={18} /> },
    { id: 'dashboard', label: 'Panel Atleta', icon: <LayoutDashboard size={18} />, locked: !isSubscribed },
    { id: 'coach', label: 'Coach Ángel', icon: <MessageCircle size={18} />, locked: !isSubscribed },
    { id: 'kitchen', label: 'Cocina Digital', icon: <UtensilsCrossed size={18} />, locked: !isSubscribed },
    { id: 'physio', label: 'Hub Fisioterapia', icon: <HeartPulse size={18} />, locked: !isSubscribed },
  ];

  const handlePublishProgram = () => {
    if (!profForm.date || !profForm.title || !profForm.warmup) return;
    const newProgram: WorkoutProgram = {
      id: `prog-${Date.now()}`,
      discipline: profForm.discipline,
      date: profForm.date,
      title: profForm.title,
      warmup: profForm.warmup,
      strength: profForm.strength,
      strengthLabel: profForm.strengthLabel || 'Bloque de fuerza',
      metcon: profForm.metcon,
      videoUrl: profForm.videoUrl,
      videoTitle: profForm.videoTitle || 'Video técnica',
      published: true,
      createdAt: new Date().toISOString(),
    };
    const filtered = programs.filter(
      (p) => !(p.discipline === newProgram.discipline && p.date === newProgram.date)
    );
    persistPrograms([newProgram, ...filtered]);
    setProfSaved(true);
    setTimeout(() => setProfSaved(false), 3000);
    setProfForm({
      discipline: profForm.discipline,
      date: '',
      title: '',
      warmup: '',
      strength: '',
      strengthLabel: '',
      metcon: '',
      videoUrl: '',
      videoTitle: 'Video técnica del movimiento',
    });
  };

  const handleDeleteProgram = (id: string) => {
    persistPrograms(programs.filter((p) => p.id !== id));
  };

  const openWodVideo = () => {
    setActiveVideoTitle(
      activeProgram?.videoTitle || `${wod.strengthLabel} — Técnica`
    );
    setVideoModalOpen(true);
  };

  const featureCards = [
    {
      icon: <Calendar size={28} className="text-accent" />,
      title: 'Programación Diaria',
      desc: 'WODs estructurados por disciplina con progresión inteligente cada día.',
    },
    {
      icon: <Video size={28} className="text-accent" />,
      title: 'Librería de Técnica',
      desc: 'Videos y cues para perfeccionar cada movimiento de tu entrenamiento.',
    },
    {
      icon: <Brain size={28} className="text-accent" />,
      title: 'Coach IA 24/7',
      desc: 'Coach Ángel responde dudas en tiempo real, día y noche.',
    },
    {
      icon: <HeartPulse size={28} className="text-accent" />,
      title: 'Fisioterapia Integrada',
      desc: 'Prevención, recuperación y citas con especialistas en un solo lugar.',
    },
  ];

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/[0.06] px-3 py-5">
        <Logo
          className={cn(
            'mx-auto',
            sidebarOpen || mobileSidebar
              ? 'h-40 w-full max-w-[240px]'
              : 'h-14 w-14 max-w-[56px]'
          )}
        />
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            disabled={item.locked}
            onClick={() => {
              if (!item.locked) {
                setView(item.id);
                setMobileSidebar(false);
              }
            }}
            className={cn(
              'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200',
              view === item.id
                ? 'bg-accent text-black shadow-lg shadow-accent/40'
                : item.locked
                  ? 'cursor-not-allowed text-gray-600 opacity-50'
                  : 'text-muted hover:bg-white/5 hover:text-white'
            )}
          >
            {item.icon}
            {(sidebarOpen || mobileSidebar) && <span>{item.label}</span>}
            {view === item.id && (sidebarOpen || mobileSidebar) && (
              <ChevronRight size={14} className="ml-auto" />
            )}
          </button>
        ))}
      </nav>

      {isSubscribed && (sidebarOpen || mobileSidebar) && (
        <div className="mx-3 mb-3 rounded-xl border border-accent/30 bg-accent/10 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-accent">
            Miembro activo
          </p>
          <p className="mt-1 text-xs text-gray-400">Plan Elite · Acceso completo</p>
        </div>
      )}

      <button
        type="button"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="hidden border-t border-white/[0.06] p-3 text-xs text-gray-500 transition hover:text-white lg:block"
      >
        {sidebarOpen ? '← Contraer' : '→ Expandir'}
      </button>
    </div>
  );

  const LandingView = () => (
    <div>
      {landingSub === 'hero' ? (
        <>
          <section className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-charcoal via-obsidian to-black p-8 md:p-16">
            <div className="ls-glow -right-32 -top-32 h-96 w-96 bg-accent/15" />
            <div className="ls-glow -bottom-20 -left-20 h-64 w-64 bg-accent/10" />
            <div className="relative z-10 flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:gap-16">
              <Logo className="h-56 w-full max-w-[340px] shrink-0 sm:h-64 sm:max-w-[400px] lg:h-80 lg:max-w-[460px]" />
              <div className="max-w-3xl text-center lg:text-left">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-accent">
                <Flame size={14} /> Life & Soul · Functional Training
              </div>
              <h1 className="text-3xl font-black uppercase leading-[1.1] tracking-tight text-white md:text-5xl lg:text-6xl">
                ENTRENA COMO UN ATLETA DE ÉLITE DESDE CUALQUIER LUGAR
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-gray-400 md:text-lg">
                Seguimiento diario de WODs, coaching con IA, disciplinas personalizadas y
                fisioterapia integrada. Tu rendimiento, elevado al máximo nivel.
              </p>
              <button
                type="button"
                onClick={() => setLandingSub('checkout')}
                className="ls-btn-primary mt-10 focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-obsidian"
              >
                UNIRME AL TEAM AQUÍ
                <ChevronRight size={20} />
              </button>
              </div>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="ls-section-title mb-6 text-xl tracking-normal text-white normal-case">
              Todo lo que necesitas para rendir al máximo
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featureCards.map((feat) => (
                <div key={feat.title} className="ls-card ls-card-hover group p-6">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/15 transition-colors group-hover:bg-accent/25">
                    {feat.icon}
                  </div>
                  <h3 className="font-bold text-white">{feat.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-400">{feat.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <section className="mx-auto max-w-md">
          <button
            type="button"
            onClick={() => setLandingSub('hero')}
            className="mb-6 flex items-center gap-1 text-sm text-gray-400 transition hover:text-white"
          >
            <ChevronRight size={14} className="rotate-180" />
            Volver al inicio
          </button>
          <div className="ls-card p-8 shadow-2xl">
            <div className="mb-8 flex justify-center">
              <Logo className="h-44 w-full max-w-[280px]" />
            </div>
            <div className="mb-8 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-black text-white">Completa tu inscripción</h2>
                <p className="mt-1 text-sm text-gray-400">Acceso inmediato al panel de atleta</p>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg bg-obsidian px-3 py-1.5 text-xs font-medium text-gray-400">
                <Lock size={12} className="text-accent" />
                Stripe
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="ls-label">
                  <User size={12} /> Nombre
                </label>
                <input
                  type="text"
                  value={checkoutName}
                  onChange={(e) => setCheckoutName(e.target.value)}
                  placeholder="Tu nombre completo"
                  className="ls-input"
                />
              </div>
              <div>
                <label className="ls-label">
                  <Mail size={12} /> Email
                </label>
                <input
                  type="email"
                  value={checkoutEmail}
                  onChange={(e) => setCheckoutEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="ls-input"
                />
              </div>
              <div>
                <label className="ls-label">
                  <CreditCard size={12} /> Datos de tarjeta
                </label>
                <input
                  type="text"
                  value={checkoutCard}
                  onChange={(e) => setCheckoutCard(e.target.value)}
                  placeholder="4242 4242 4242 4242"
                  maxLength={19}
                  className="ls-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="ls-label">MM/AA</label>
                  <input
                    type="text"
                    value={checkoutExpiry}
                    onChange={(e) => setCheckoutExpiry(e.target.value)}
                    placeholder="12/28"
                    maxLength={5}
                    className="ls-input"
                  />
                </div>
                <div>
                  <label className="ls-label">CVC</label>
                  <input
                    type="text"
                    value={checkoutCvc}
                    onChange={(e) => setCheckoutCvc(e.target.value)}
                    placeholder="123"
                    maxLength={4}
                    className="ls-input"
                  />
                </div>
              </div>
              <button type="button" onClick={handleSubscribe} className="ls-btn-primary mt-2 w-full">
                PAGAR E INICIAR ENTRENAMIENTO
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );

  const DashboardView = () => (
    <div className="relative pb-28">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white md:text-3xl">Panel del Atleta</h1>
          <p className="text-sm text-gray-400">Tu tablero diario de entrenamiento</p>
          {activeProgram && (
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-accent/20 px-3 py-1 text-[10px] font-bold uppercase text-accent">
              <Upload size={10} /> Rutina del Profe · {activeProgram.title}
            </span>
          )}
        </div>
        <div className="rounded-xl border border-accent/30 bg-charcoal px-4 py-2 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Progreso hoy</p>
          <p className="text-2xl font-black text-accent">{completionPct}%</p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-1 rounded-2xl border border-white/[0.06] bg-charcoal p-1">
        {DISCIPLINES.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setDiscipline(d.id)}
            className={cn(
              'min-w-[100px] flex-1 rounded-xl px-3 py-3 text-xs font-bold uppercase transition-all duration-200 sm:text-sm',
              discipline === d.id
                ? 'bg-accent text-black shadow-lg shadow-accent/40'
                : 'text-muted hover:bg-white/5 hover:text-white'
            )}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="mb-8">
        <WeekDayStrip
          days={weekDays}
          selectedIndex={selectedDay}
          onSelectIndex={setSelectedDay}
        />
      </div>

      <div className="space-y-5">
        <div className="ls-card p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="ls-section-title flex items-center gap-2">
              <Activity size={16} /> A. Calentamiento
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={openWodVideo}
                className="flex items-center gap-2 rounded-xl border border-accent/40 bg-accent/20 px-4 py-2 text-xs font-bold text-accent transition hover:bg-accent/30"
              >
                🎥 Ver Video Técnica
              </button>
              <button
                type="button"
                onClick={() => setWarmupDone(!warmupDone)}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-xl transition',
                  warmupDone
                    ? 'bg-accent text-black shadow-md shadow-accent/40'
                    : 'border border-white/15 text-gray-500 hover:border-accent/50'
                )}
              >
                <Check size={16} />
              </button>
            </div>
          </div>
          <p className="leading-relaxed text-gray-300">{wod.warmup}</p>
        </div>

        <div className="ls-card p-6">
          <h3 className="ls-section-title mb-1 flex items-center gap-2">
            <Dumbbell size={16} /> B. Fuerza
          </h3>
          <p className="mb-5 text-sm text-gray-400">
            {wod.strengthLabel} — {wod.strength}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] text-left text-xs uppercase tracking-wider text-gray-500">
                  <th className="pb-3 pr-4">#</th>
                  <th className="pb-3 pr-4">Series</th>
                  <th className="pb-3 pr-4">Reps</th>
                  <th className="pb-3 pr-4">% Objetivo</th>
                  <th className="pb-3">✓</th>
                </tr>
              </thead>
              <tbody>
                {STRENGTH_ROWS.map((row) => (
                  <tr key={row.id} className="border-b border-white/[0.04]">
                    <td className="py-3.5 pr-4 font-bold text-white">{row.id}</td>
                    <td className="py-3.5 pr-4 text-gray-300">{row.sets}</td>
                    <td className="py-3.5 pr-4 text-gray-300">{row.reps}</td>
                    <td className="py-3.5 pr-4 font-bold text-accent">{row.pct}</td>
                    <td className="py-3.5">
                      <button
                        type="button"
                        onClick={() =>
                          setStrengthChecks((prev) => ({ ...prev, [row.id]: !prev[row.id] }))
                        }
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-lg transition',
                          strengthChecks[row.id]
                            ? 'bg-accent text-black shadow-md shadow-accent/30'
                            : 'border border-white/15 hover:border-accent/50'
                        )}
                      >
                        {strengthChecks[row.id] && <Check size={14} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="ls-card p-6">
          <h3 className="ls-section-title mb-4 flex items-center gap-2">
            <Zap size={16} /> C. Metcon (Circuito)
          </h3>
          <p className="mb-6 leading-relaxed text-gray-300">{wod.metcon}</p>
          <div className="rounded-2xl border border-accent/25 bg-obsidian p-6">
            <p className="mb-4 text-xs font-black uppercase tracking-widest text-gray-500">
              ⏱ Cronómetro WOD
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <span className="font-mono text-6xl font-black tabular-nums text-accent">
                {formatTime(timerSeconds)}
              </span>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setTimerRunning(!timerRunning)}
                  className="flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-black text-black shadow-lg shadow-accent/30 transition hover:bg-accent-light"
                >
                  {timerRunning ? <Pause size={18} /> : <Play size={18} />}
                  {timerRunning ? 'Pausar' : 'Play'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTimerRunning(false);
                    setTimerSeconds(0);
                  }}
                  className="ls-btn-ghost"
                >
                  <RotateCcw size={18} />
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setView('coach')}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-3"
      >
        <span className="hidden max-w-[200px] rounded-2xl border border-accent/40 bg-charcoal px-4 py-2.5 text-xs font-bold leading-snug text-white shadow-2xl sm:block">
          ¿Dudas con el WOD? Pregúntame
        </span>
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-accent opacity-30" />
          <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-[3px] border-accent/50 bg-black p-1 shadow-2xl shadow-accent/40">
            <Logo className="h-[72px] w-[72px] max-w-none" />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-[8px] font-black text-white">
              IA
            </span>
          </div>
        </div>
      </button>
    </div>
  );

  const CoachView = () => (
    <div className="flex h-[calc(100vh-7rem)] flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-obsidian">
      <div className="flex items-center gap-4 border-b border-white/[0.06] bg-charcoal px-5 py-4">
        <div className="relative">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-accent/40 bg-black p-1 shadow-lg shadow-accent/30">
            <Logo className="h-14 w-14 max-w-none" />
          </div>
          <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-charcoal bg-green-500" />
        </div>
        <div>
          <h2 className="font-black text-white">Coach Ángel (Avatar IA)</h2>
          <p className="text-xs text-gray-400">
            Tu coach de confianza — técnica, sustituciones y motivación 24/7
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1">
          <span className="h-2 w-2 rounded-full bg-green-500 shadow-sm shadow-green-500/50" />
          <span className="text-xs font-bold text-green-400">En línea</span>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto bg-[radial-gradient(circle_at_20%_50%,rgba(255,87,34,0.03)_0%,transparent_50%)] p-5">
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={cn('flex', msg.sender === 'user' ? 'justify-end' : 'justify-start')}
          >
            {msg.sender === 'coach' && (
              <div className="mr-2 flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-accent/30 bg-black p-0.5 shadow-md shadow-accent/20">
                <Logo className="h-9 w-9 max-w-none" />
              </div>
            )}
            <div
              className={cn(
                'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                msg.sender === 'user'
                  ? 'rounded-br-sm bg-[#1a3a2f] text-white'
                  : 'rounded-bl-sm border border-accent/25 bg-charcoal text-gray-200'
              )}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="flex gap-3 border-t border-white/[0.06] bg-charcoal p-4">
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
          placeholder="Escribe tu duda aquí (ej: No tengo barra, ¿con qué la cambio?)..."
          className="ls-input flex-1 text-sm"
        />
        <button
          type="button"
          onClick={handleSendChat}
          disabled={!chatInput.trim()}
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-black shadow-lg shadow-accent/30 transition hover:bg-accent-light disabled:opacity-40"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );

  const KitchenView = () => (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white md:text-3xl">Cocina Digital</h1>
        <p className="text-sm text-gray-400">Nutrición de alto rendimiento para atletas elite</p>
      </div>

      <div className="mb-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-accent/35 bg-gradient-to-br from-accent/15 to-charcoal p-6">
        <div>
          <p className="text-lg font-black text-white">Guía Nutricional Base</p>
          <p className="text-sm text-gray-400">Macros, timing y protocolos para atletas de élite</p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-black text-black shadow-lg shadow-accent/30 transition hover:bg-accent-light"
        >
          📥 Descargar Guía Nutricional Base.pdf
          <Download size={18} />
        </button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {RECIPES.map((recipe) => (
          <button
            key={recipe.id}
            type="button"
            onClick={() => setSelectedRecipe(recipe)}
            className="ls-card ls-card-hover group p-5 text-left"
          >
            <div className="mb-4 flex h-36 items-center justify-center rounded-xl bg-obsidian text-6xl transition-colors group-hover:bg-elevated">
              {recipe.emoji}
            </div>
            <h3 className="font-bold text-white">{recipe.name}</h3>
            <div className="mt-2 flex items-center gap-2">
              <span className="rounded-full bg-accent/20 px-2.5 py-0.5 text-[10px] font-bold uppercase text-accent">
                {recipe.tag}
              </span>
              <span className="text-sm font-black text-accent">{recipe.calories} kcal</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const PhysioView = () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white md:text-3xl">Hub de Fisioterapia</h1>
        <p className="text-sm text-gray-400">
          Prevención clínica con enfoque atlético — rendimiento sostenible
        </p>
      </div>

      <div className="ls-card p-6">
        <div className="mb-5 flex items-center gap-3">
          <Shield size={22} className="text-accent" />
          <div>
            <h2 className="font-black text-white">A. Rutinas Preventivas</h2>
            <p className="text-xs text-gray-400">Movilidad y prevención de lesiones</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {PREVENTION_ROUTINES.map((routine) => (
            <div
              key={routine.id}
              className="rounded-xl border border-white/[0.06] bg-obsidian p-5 transition hover:border-accent/30"
            >
              <div className="mb-3 flex items-center justify-between">
                <Stethoscope size={20} className="text-accent" />
                <span className="text-xs font-bold text-gray-500">{routine.duration}</span>
              </div>
              <h3 className="font-bold text-white">{routine.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-400">{routine.desc}</p>
              <button
                type="button"
                onClick={() => setPreventionVideo(routine.id)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-accent/20 py-2 text-xs font-bold text-accent transition hover:bg-accent/30"
              >
                🎥 Ver protocolo
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="ls-card p-6">
        <div className="mb-6 flex items-center gap-3">
          <Target size={22} className="text-accent" />
          <h2 className="font-black text-white">B. Agendar una Descarga / Cita de Fisioterapia</h2>
        </div>

        {physioBooked ? (
          <div className="rounded-xl border border-accent/35 bg-accent/10 p-8 text-center">
            <Check className="mx-auto mb-3 text-accent" size={40} />
            <p className="text-lg font-black text-accent">¡Cita reservada con éxito!</p>
            <p className="mt-2 text-sm text-gray-400">
              {physioDate} · {physioSlot} · Confirmación por email
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <label className="ls-label">Tipo de tratamiento</label>
              <select
                value={physioTherapy}
                onChange={(e) => setPhysioTherapy(e.target.value)}
                className="ls-input"
              >
                <option value="descarga">Descarga muscular</option>
                <option value="eval">Evaluación de lesión</option>
                <option value="terapia">Terapia física</option>
              </select>
            </div>
            <div>
              <label className="ls-label">
                <Calendar size={12} /> Fecha
              </label>
              <DatePicker
                value={physioDate}
                onChange={setPhysioDate}
                placeholder="Clic para elegir fecha"
              />
            </div>
            <div>
              <label className="ls-label">
                <Clock size={12} /> Horario disponible
              </label>
              <div className="flex flex-wrap gap-2">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setPhysioSlot(slot)}
                    className={cn(
                      'rounded-xl border px-5 py-2.5 text-sm font-semibold transition',
                      physioSlot === slot
                        ? 'border-accent bg-accent text-black shadow-md shadow-accent/30'
                        : 'border-white/10 text-muted hover:border-accent/50 hover:text-white'
                    )}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => physioDate && physioSlot && setPhysioBooked(true)}
              disabled={!physioDate || !physioSlot}
              className="ls-btn-primary w-full disabled:scale-100 disabled:opacity-40 disabled:shadow-none"
            >
              Confirmar cita
            </button>
          </div>
        )}
      </div>

      <div className="ls-card p-6">
        <div className="mb-5 flex items-center gap-3">
          <FileText size={22} className="text-accent" />
          <div>
            <h2 className="font-black text-white">C. Notas del Fisioterapeuta</h2>
            <p className="text-xs text-gray-400">Feedback sobre recuperaciones activas</p>
          </div>
        </div>
        <div className="space-y-4">
          {THERAPIST_NOTES.map((note) => (
            <div
              key={note.title}
              className={cn(
                'rounded-xl border bg-obsidian p-5',
                note.status === 'Activa' ? 'border-accent/40' : 'border-white/[0.06]'
              )}
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-white">{note.title}</h3>
                  <p className="text-xs text-gray-500">{note.date}</p>
                </div>
                <span
                  className={cn(
                    'rounded-full px-3 py-1 text-[10px] font-black uppercase',
                    note.status === 'Activa'
                      ? 'bg-accent/20 text-accent'
                      : 'bg-white/[0.06] text-gray-500'
                  )}
                >
                  {note.status}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-gray-400">{note.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const ProfessorView = () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white md:text-3xl">Panel del Profesor</h1>
        <p className="text-sm text-gray-400">
          Sube rutinas con video — aparecen automáticamente en el Panel del Atleta
        </p>
      </div>

      <div className="ls-card p-6">
        <div className="mb-6 flex items-center gap-3">
          <Upload size={22} className="text-accent" />
          <div>
            <h2 className="font-black text-white">A. Publicar rutina del día</h2>
            <p className="text-xs text-gray-400">Calentamiento, fuerza, metcon y video técnica</p>
          </div>
        </div>

        {profSaved && (
          <div className="mb-5 rounded-xl border border-accent/35 bg-accent/10 px-4 py-3 text-center text-sm font-bold text-accent">
            ✓ Rutina publicada — ya visible para los atletas
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="ls-label">Disciplina</label>
              <select
                value={profForm.discipline}
                onChange={(e) =>
                  setProfForm((f) => ({ ...f, discipline: e.target.value as Discipline }))
                }
                className="ls-input"
              >
                {DISCIPLINES.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="ls-label">
                <Calendar size={12} /> Fecha de la rutina
              </label>
              <DatePicker
                value={profForm.date}
                onChange={(date) => setProfForm((f) => ({ ...f, date }))}
                placeholder="Toca para elegir fecha"
              />
              <div className="mt-4">
                <WeekDayStrip
                  days={weekDays}
                  selectedIso={profForm.date}
                  onSelectIso={(iso) => setProfForm((f) => ({ ...f, date: iso }))}
                />
              </div>
            </div>
            <div>
              <label className="ls-label">Título de la sesión</label>
              <input
                type="text"
                value={profForm.title}
                onChange={(e) => setProfForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Ej: WOD Martes — Hyrox"
                className="ls-input"
              />
            </div>
            <div>
              <label className="ls-label">
                <Link size={12} /> URL del video (YouTube / Drive)
              </label>
              <input
                type="url"
                value={profForm.videoUrl}
                onChange={(e) => setProfForm((f) => ({ ...f, videoUrl: e.target.value }))}
                placeholder="https://youtube.com/watch?v=..."
                className="ls-input"
              />
            </div>
            <div>
              <label className="ls-label">Nombre del video</label>
              <input
                type="text"
                value={profForm.videoTitle}
                onChange={(e) => setProfForm((f) => ({ ...f, videoTitle: e.target.value }))}
                placeholder="Ej: Técnica Back Squat"
                className="ls-input"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="ls-label">
                <Activity size={12} /> A. Calentamiento
              </label>
              <textarea
                value={profForm.warmup}
                onChange={(e) => setProfForm((f) => ({ ...f, warmup: e.target.value }))}
                rows={3}
                placeholder="Descripción del calentamiento..."
                className="ls-input resize-none"
              />
            </div>
            <div>
              <label className="ls-label">
                <Dumbbell size={12} /> B. Fuerza — movimiento principal
              </label>
              <input
                type="text"
                value={profForm.strengthLabel}
                onChange={(e) => setProfForm((f) => ({ ...f, strengthLabel: e.target.value }))}
                placeholder="Ej: Back Squat"
                className="ls-input mb-2"
              />
              <textarea
                value={profForm.strength}
                onChange={(e) => setProfForm((f) => ({ ...f, strength: e.target.value }))}
                rows={2}
                placeholder="Series, reps, %..."
                className="ls-input resize-none"
              />
            </div>
            <div>
              <label className="ls-label">
                <Zap size={12} /> C. Metcon (Circuito)
              </label>
              <textarea
                value={profForm.metcon}
                onChange={(e) => setProfForm((f) => ({ ...f, metcon: e.target.value }))}
                rows={3}
                placeholder="AMRAP, EMOM, for time..."
                className="ls-input resize-none"
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePublishProgram}
          disabled={!profForm.date || !profForm.title || !profForm.warmup}
          className="ls-btn-primary mt-6 w-full disabled:scale-100 disabled:opacity-40"
        >
          <Plus size={18} /> PUBLICAR RUTINA PARA ATLETAS
        </button>
      </div>

      <div className="ls-card p-6">
        <div className="mb-5 flex items-center gap-3">
          <Video size={22} className="text-accent" />
          <div>
            <h2 className="font-black text-white">B. Rutinas publicadas</h2>
            <p className="text-xs text-gray-400">
              {programs.filter((p) => p.published).length} rutinas activas con video
            </p>
          </div>
        </div>

        {programs.filter((p) => p.published).length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/10 bg-obsidian p-8 text-center text-sm text-gray-500">
            Aún no hay rutinas. Publica la primera arriba.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {programs
              .filter((p) => p.published)
              .map((prog) => (
                <div
                  key={prog.id}
                  className="rounded-xl border border-white/[0.06] bg-obsidian p-5 transition hover:border-accent/30"
                >
                  <div className="mb-3 flex aspect-video items-center justify-center rounded-lg bg-black">
                    {prog.videoUrl ? (
                      <a
                        href={prog.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-2 text-accent transition hover:text-accent-light"
                      >
                        <Play size={32} />
                        <span className="text-[10px] font-bold uppercase">Ver video</span>
                      </a>
                    ) : (
                      <Video size={32} className="text-gray-600" />
                    )}
                  </div>
                  <div className="mb-2 flex flex-wrap gap-1">
                    <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold uppercase text-accent">
                      {DISCIPLINES.find((d) => d.id === prog.discipline)?.label}
                    </span>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-gray-400">
                      {prog.date}
                    </span>
                  </div>
                  <h3 className="font-bold text-white">{prog.title}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-gray-500">{prog.warmup}</p>
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setProfForm({
                          discipline: prog.discipline,
                          date: prog.date,
                          title: prog.title,
                          warmup: prog.warmup,
                          strength: prog.strength,
                          strengthLabel: prog.strengthLabel,
                          metcon: prog.metcon,
                          videoUrl: prog.videoUrl,
                          videoTitle: prog.videoTitle,
                        });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="flex-1 rounded-lg bg-accent/20 py-2 text-xs font-bold text-accent transition hover:bg-accent/30"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProgram(prog.id)}
                      className="rounded-lg border border-red-500/30 px-3 py-2 text-red-400 transition hover:bg-red-500/10"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderView = () => {
    if (!isSubscribed && view !== 'landing' && view !== 'professor') {
      return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Lock className="mb-4 text-gray-600" size={48} />
          <p className="text-gray-400">Completa el checkout para acceder a esta sección.</p>
          <button
            type="button"
            onClick={() => setView('landing')}
            className="mt-4 font-bold text-accent hover:underline"
          >
            Ir al checkout →
          </button>
        </div>
      );
    }
    switch (view) {
      case 'landing':
        return <LandingView />;
      case 'dashboard':
        return <DashboardView />;
      case 'coach':
        return <CoachView />;
      case 'kitchen':
        return <KitchenView />;
      case 'physio':
        return <PhysioView />;
      case 'professor':
        return <ProfessorView />;
      default:
        return <LandingView />;
    }
  };

  return (
    <div className="flex min-h-screen bg-obsidian font-sans">
      {mobileSidebar && (
        <div
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          onClick={() => setMobileSidebar(false)}
          role="presentation"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 transform border-r border-white/[0.06] bg-charcoal transition-all duration-300 lg:relative lg:translate-x-0',
          mobileSidebar ? 'translate-x-0' : '-translate-x-full',
          sidebarOpen ? 'w-72' : 'w-[80px]'
        )}
      >
        <SidebarContent />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/[0.06] bg-obsidian/95 px-4 py-3 backdrop-blur-md lg:px-8">
          <button
            type="button"
            onClick={() => setMobileSidebar(true)}
            className="rounded-xl p-2 text-gray-400 transition hover:bg-white/5 hover:text-white lg:hidden"
          >
            <Menu size={22} />
          </button>
          <div className="hidden lg:flex">
            <Logo className="h-16 w-full max-w-[200px]" />
          </div>
          {isSubscribed && (
            <div className="hidden items-center gap-2 rounded-full bg-accent/15 px-3 py-1 text-xs font-bold text-accent sm:flex">
              <BookOpen size={12} /> Miembro Elite
            </div>
          )}
        </header>

        <main className="flex-1 overflow-y-auto bg-obsidian bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:40px_40px] p-4 lg:p-8">
          {renderView()}
        </main>
      </div>

      {videoModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setVideoModalOpen(false)}
          role="presentation"
        >
          <div
            className="ls-card w-full max-w-2xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-black text-white">{activeVideoTitle}</h3>
                <p className="text-xs text-gray-400">
                  {activeProgram?.videoUrl
                    ? 'Video subido por el profesor'
                    : 'Demostración del movimiento — sesión grabada'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setVideoModalOpen(false)}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-white/5 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-xl bg-obsidian">
              {activeProgram?.videoUrl ? (
                <iframe
                  title={activeVideoTitle}
                  src={toEmbedUrl(activeProgram.videoUrl)}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-full bg-accent/25 transition hover:scale-110 hover:bg-accent/35">
                      <Play size={36} className="ml-1 text-accent" />
                    </div>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-5">
                    <div className="mb-2 h-1.5 rounded-full bg-white/20">
                      <div className="h-full w-2/5 rounded-full bg-accent" />
                    </div>
                    <span className="text-xs text-gray-400">02:34 / 08:15</span>
                  </div>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setVideoModalOpen(false);
                setWarmupDone(true);
              }}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-black text-black shadow-lg shadow-accent/30 transition hover:bg-accent-light"
            >
              <Check size={16} /> Marcar calentamiento completado
            </button>
          </div>
        </div>
      )}

      {selectedRecipe && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setSelectedRecipe(null)}
          role="presentation"
        >
          <div
            className="ls-card max-h-[90vh] w-full max-w-md overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="mb-2 text-5xl">{selectedRecipe.emoji}</div>
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-xl font-black text-white">{selectedRecipe.name}</h3>
                <span className="mt-1 inline-block rounded-full bg-accent/20 px-2.5 py-0.5 text-[10px] font-bold uppercase text-accent">
                  {selectedRecipe.tag}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecipe(null)}
                className="text-gray-400 transition hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
            <p className="mb-5 text-3xl font-black text-accent">{selectedRecipe.calories} kcal</p>
            <h4 className="mb-3 text-xs font-black uppercase tracking-wider text-gray-500">Macros</h4>
            <div className="mb-6 grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-obsidian p-3 text-center">
                <p className="text-xl font-black text-accent">{selectedRecipe.protein}g</p>
                <p className="text-[10px] text-gray-500">Proteína</p>
              </div>
              <div className="rounded-xl bg-obsidian p-3 text-center">
                <p className="text-xl font-black text-white">{selectedRecipe.carbs}g</p>
                <p className="text-[10px] text-gray-500">Carbos</p>
              </div>
              <div className="rounded-xl bg-obsidian p-3 text-center">
                <p className="text-xl font-black text-muted">{selectedRecipe.fat}g</p>
                <p className="text-[10px] text-gray-500">Grasas</p>
              </div>
            </div>
            <h4 className="mb-3 text-xs font-black uppercase tracking-wider text-gray-500">
              Ingredientes
            </h4>
            <ul className="space-y-2">
              {selectedRecipe.ingredients.map((ing) => (
                <li key={ing} className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  {ing}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setSelectedRecipe(null)}
              className="mt-6 w-full rounded-xl border border-accent/50 py-3 text-sm font-bold text-accent transition hover:bg-accent/10"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {preventionVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setPreventionVideo(null)}
          role="presentation"
        >
          <div
            className="ls-card w-full max-w-lg p-6"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="mb-4 flex justify-between">
              <h3 className="font-black text-white">
                {PREVENTION_ROUTINES.find((r) => r.id === preventionVideo)?.title}
              </h3>
              <button
                type="button"
                onClick={() => setPreventionVideo(null)}
                className="text-gray-400 transition hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex aspect-video items-center justify-center rounded-xl bg-obsidian">
              <Play size={48} className="text-accent" />
            </div>
            <p className="mt-4 text-sm text-gray-400">
              {PREVENTION_ROUTINES.find((r) => r.id === preventionVideo)?.desc}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
