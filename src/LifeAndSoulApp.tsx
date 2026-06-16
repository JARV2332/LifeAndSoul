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
  HeartPulse,
  UtensilsCrossed,
  MessageCircle,
  LayoutDashboard,
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
import { MarketingShell } from './components/marketing/MarketingShell';
import { MarketingLanding } from './components/marketing/MarketingLanding';
import {
  type Discipline,
  type WorkoutProgram,
  loadPrograms,
  savePrograms,
  findProgram,
} from './lib/programs';

type View = 'landing' | 'about' | 'dashboard' | 'coach' | 'kitchen' | 'physio' | 'professor';
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

  const isMarketingView = view === 'landing' || view === 'about';

  const startFreeTrial = () => {
    setLandingSub('checkout');
    setView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const enterApp = () => {
    if (isSubscribed) {
      setView('dashboard');
    } else {
      startFreeTrial();
    }
  };

  const [chatLoading, setChatLoading] = useState(false);

  const handleSendChat = async () => {
    const trimmed = chatInput.trim();
    if (!trimmed || chatLoading) return;

    const userMsg: ChatMessage = { id: Date.now(), sender: 'user', text: trimmed };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    const history = [...chatMessages, userMsg].map((m) => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text,
    }));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, sender: 'coach', text: data.reply },
        ]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, sender: 'coach', text: '⚠️ Error al conectar con el coach. Intenta de nuevo.' },
        ]);
      }
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: 'coach', text: '⚠️ Sin conexión. Revisa tu red e intenta de nuevo.' },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const strengthDoneCount = Object.values(strengthChecks).filter(Boolean).length;
  const completionPct = Math.round(
    ((warmupDone ? 1 : 0) + strengthDoneCount + (timerSeconds > 0 ? 1 : 0)) / 7 * 100
  );

  const appNavItems: { id: View; label: string; icon: ReactNode; locked?: boolean; admin?: boolean }[] = [
    { id: 'dashboard', label: 'Panel Atleta', icon: <LayoutDashboard size={18} />, locked: !isSubscribed },
    { id: 'coach', label: 'Coach Ángel', icon: <MessageCircle size={18} />, locked: !isSubscribed },
    { id: 'kitchen', label: 'Cocina Digital', icon: <UtensilsCrossed size={18} />, locked: !isSubscribed },
    { id: 'physio', label: 'Hub Fisioterapia', icon: <HeartPulse size={18} />, locked: !isSubscribed },
    { id: 'professor', label: 'Admin · Panel Profe', icon: <ClipboardList size={18} />, admin: true },
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

  const [carouselIndex, setCarouselIndex] = useState(0);
  const TEAM_PHOTOS = Array.from({ length: 13 }, (_, i) => `/team/angel-${i + 1}.png`);

  const nextSlide = () => setCarouselIndex((prev) => (prev + 1) % TEAM_PHOTOS.length);
  const prevSlide = () => setCarouselIndex((prev) => (prev - 1 + TEAM_PHOTOS.length) % TEAM_PHOTOS.length);

  const AboutView = () => (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-[#161618]">
        <div className="ls-glow -right-20 -top-20 h-64 w-64 bg-[#A3E635]/8" />
        <div className="relative z-10 flex flex-col items-center gap-8 p-8 md:flex-row md:p-12">
          <div className="shrink-0">
            <img
              src="/team/angel-10.png"
              alt="Coach Ángel Campos"
              className="h-48 w-48 rounded-full border-4 border-[#A3E635]/40 object-cover shadow-2xl shadow-[#A3E635]/20 md:h-56 md:w-56"
            />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#A3E635] mb-2">Fundador & Director</p>
            <h1 className="font-black tracking-tighter uppercase text-white text-3xl md:text-4xl">
              Ángel Campos
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Entrenador de Atletismo · Functional Training · 40 años · 22 años dedicados al deporte
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-[#A3E635]/15 px-3 py-1 text-[10px] font-bold uppercase text-[#A3E635]">Campeón Centroamericano</span>
              <span className="rounded-full bg-[#A3E635]/15 px-3 py-1 text-[10px] font-bold uppercase text-[#A3E635]">Ex Velocista Nacional</span>
              <span className="rounded-full bg-[#A3E635]/15 px-3 py-1 text-[10px] font-bold uppercase text-[#A3E635]">Preparador Físico</span>
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
              <span>📞 (502) 3405 2488</span>
              <span>✉️ angelifeandsoul@gmail.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Carousel */}
      <div className="bg-[#161618] border border-zinc-800 rounded-xl p-6">
        <h2 className="font-black uppercase tracking-tighter text-white text-sm mb-4 flex items-center gap-2">
          <Flame size={16} className="text-[#A3E635]" /> Galería del Coach
        </h2>
        <div className="relative">
          <div className="overflow-hidden rounded-lg aspect-[16/9] bg-[#0B0B0C]">
            <img
              src={TEAM_PHOTOS[carouselIndex]}
              alt={`Coach Ángel - Foto ${carouselIndex + 1}`}
              className="h-full w-full object-contain"
            />
          </div>
          <button
            type="button"
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white hover:bg-[#A3E635] hover:text-black transition"
          >
            <ChevronRight size={18} className="rotate-180" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white hover:bg-[#A3E635] hover:text-black transition"
          >
            <ChevronRight size={18} />
          </button>
        </div>
        {/* Thumbnail strip */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {TEAM_PHOTOS.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setCarouselIndex(i)}
              className={cn(
                'flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all',
                carouselIndex === i ? 'border-[#A3E635] scale-105' : 'border-zinc-800 opacity-60 hover:opacity-100'
              )}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Story */}
      <div className="bg-[#161618] border border-zinc-800 rounded-xl p-6">
        <h2 className="font-black uppercase tracking-tighter text-white text-sm mb-4 flex items-center gap-2">
          <BookOpen size={16} className="text-[#A3E635]" /> Mi Historia
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-gray-300">
          <p>
            Mi historia no empezó con una victoria, sino con una necesidad urgente de cambio. Hace más de 22 años, me miré al espejo y no vi a un atleta; vi a un joven con sobrepeso y problemas de salud que sabía que debía tomar una decisión. Lo que empezó como una lucha personal por sanar, terminó convirtiéndose en mi misión de vida.
          </p>
          <p>
            A los 18 años, en 2004, dejé de entrenar solo para mí. Empecé a compartir lo que aprendía, ayudando a fundar los primeros clubes de atletismo en Guatemala, como Corredores por la Paz y Street Running. En el gimnasio, en las pistas, y como velocista, entendí que el cuerpo es la herramienta más poderosa que tenemos para transformar nuestro destino.
          </p>
          <p>
            Pasé por el culturismo, el fútbol, el CrossFit y el entrenamiento funcional. Cada caída me enseñó algo nuevo y cada disciplina me dio una pieza del rompecabezas que, en 2014, se convirtió en <span className="text-[#A3E635] font-bold">Life and Soul</span>.
          </p>
          <p>
            No quería abrir solo un gimnasio. Quería crear un espacio donde forjáramos carácter y propósito. Diseñé un método que fusiona la alta intensidad con la técnica pura del atletismo, porque creo que todos — seas un bombero, un futbolista de élite o alguien que nunca ha corrido — merecemos ser la versión más fuerte y capaz de nosotros mismos.
          </p>
          <p className="text-white font-semibold italic border-l-4 border-[#A3E635] pl-4">
            "Mientras alguien esté dispuesto a levantarse, a correr más fuerte y a creer en sí mismo… nosotros estaremos ahí para impulsarlo."
          </p>
        </div>
      </div>

      {/* Credentials Grid */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Experience */}
        <div className="bg-[#161618] border border-zinc-800 rounded-xl p-6">
          <h2 className="font-black uppercase tracking-tighter text-white text-sm mb-4 flex items-center gap-2">
            <Activity size={16} className="text-[#A3E635]" /> Experiencia Laboral
          </h2>
          <div className="space-y-4">
            <div className="border-l-2 border-[#A3E635] pl-4">
              <p className="text-xs font-black text-white">Centro de Entrenamiento Life & Soul</p>
              <p className="text-[10px] text-[#A3E635] font-bold">2015 — Presente · Director</p>
            </div>
            <div className="border-l-2 border-zinc-700 pl-4">
              <p className="text-xs font-black text-white">Colegio Americano de Guatemala</p>
              <p className="text-[10px] text-gray-400">2019 – 2022 · Coach de Atletismo</p>
            </div>
            <div className="border-l-2 border-zinc-700 pl-4">
              <p className="text-xs font-black text-white">Instituto Guatemalteco Israelí</p>
              <p className="text-[10px] text-gray-400">2015 – 2020 · Profesor de Educación Física</p>
            </div>
            <div className="border-l-2 border-zinc-700 pl-4">
              <p className="text-xs font-black text-white">Banco Industrial</p>
              <p className="text-[10px] text-gray-400">2011 – 2015 · Analista de Riesgos</p>
            </div>
          </div>
        </div>

        {/* Formation */}
        <div className="bg-[#161618] border border-zinc-800 rounded-xl p-6">
          <h2 className="font-black uppercase tracking-tighter text-white text-sm mb-4 flex items-center gap-2">
            <BookOpen size={16} className="text-[#A3E635]" /> Formación
          </h2>
          <div className="space-y-3 text-xs text-gray-300">
            <div className="bg-[#0B0B0C] border border-zinc-800 rounded-lg p-3">
              <p className="font-bold text-white">Fuerza aplicada al deporte, biomecánica y pliometría</p>
              <p className="text-[10px] text-gray-500">2019 · CDAG & Comité Olímpico Guatemalteco</p>
            </div>
            <div className="bg-[#0B0B0C] border border-zinc-800 rounded-lg p-3">
              <p className="font-bold text-white">Acondicionamiento y planificación deportiva</p>
              <p className="text-[10px] text-gray-500">2020 · Dr. David García López (ESP) · Sport Science</p>
            </div>
            <div className="bg-[#0B0B0C] border border-zinc-800 rounded-lg p-3">
              <p className="font-bold text-white">Taller de Atletismo — USAC</p>
              <p className="text-[10px] text-gray-500">2015 · Programa de Cursos Libres</p>
            </div>
            <div className="bg-[#0B0B0C] border border-zinc-800 rounded-lg p-3">
              <p className="font-bold text-white">Nutrición Deportiva</p>
              <p className="text-[10px] text-gray-500">2015 · Club Atlético "Guayo" · Lic. Mynor Montúfar</p>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-[#161618] border border-zinc-800 rounded-xl p-6">
        <h2 className="font-black uppercase tracking-tighter text-white text-sm mb-4 flex items-center gap-2">
          <Target size={16} className="text-[#A3E635]" /> Palmarés Competitivo
        </h2>
        <div className="mb-4">
          <img src="/team/medals.png" alt="Medallas Coach Ángel" className="w-full max-w-md rounded-lg border border-zinc-800" />
        </div>
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
          <div className="rounded-lg bg-[#0B0B0C] border border-[#A3E635]/30 p-4">
            <p className="text-[10px] font-bold uppercase text-[#A3E635]">2019 · Centroamericano Máster</p>
            <p className="text-xs text-white font-bold mt-1">🥇 Oro — Relevos 4×100m</p>
            <p className="text-xs text-gray-300">🥈 Plata — Relevos 4×400m</p>
            <p className="text-xs text-gray-300">🥉 Bronce — 200m y 400m planos</p>
          </div>
          <div className="rounded-lg bg-[#0B0B0C] border border-zinc-800 p-4">
            <p className="text-[10px] font-bold uppercase text-gray-400">2021 · Nacional Mayor</p>
            <p className="text-xs text-white font-bold mt-1">🥇 Oro — 200m y 400m (M35)</p>
            <p className="text-xs text-gray-300">🥈 Plata — 100m planos</p>
            <p className="text-xs text-gray-300">🥉 Bronce — Relevos 4×100m</p>
          </div>
          <div className="rounded-lg bg-[#0B0B0C] border border-zinc-800 p-4">
            <p className="text-[10px] font-bold uppercase text-gray-400">2019 · Nacional Máster (M30)</p>
            <p className="text-xs text-white font-bold mt-1">🥇 4 Oros — 4×100, 4×400, 200m, 400m</p>
            <p className="text-xs text-gray-300">🥈 Plata — 100m planos</p>
          </div>
          <div className="rounded-lg bg-[#0B0B0C] border border-zinc-800 p-4">
            <p className="text-[10px] font-bold uppercase text-gray-400">2016-2017 · Desafío Lava Trail</p>
            <p className="text-xs text-white font-bold mt-1">🥈 2do Lugar — 10km Volcán Pacaya (2016)</p>
            <p className="text-xs text-gray-300">🥉 3er Lugar — 10km Volcán Pacaya (2017)</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center bg-[#161618] border border-zinc-800 rounded-xl p-8">
        <h2 className="font-black tracking-tighter uppercase text-white text-xl mb-2">¿Listo para transformar tu vida?</h2>
        <p className="text-sm text-gray-400 mb-6">Únete al equipo Life & Soul y entrena con los mejores</p>
        <button type="button" onClick={() => { startFreeTrial(); }} className="ls-btn-primary">
          UNIRME AL TEAM
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );

  const DashboardView = () => (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-black tracking-tighter uppercase text-white text-2xl">Panel del Atleta</h1>
          <p className="text-sm text-gray-400">Tu tablero diario de entrenamiento</p>
          {activeProgram && (
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#A3E635]/15 px-3 py-1 text-[10px] font-bold uppercase text-[#A3E635]">
              <Upload size={10} /> Rutina del Profe · {activeProgram.title}
            </span>
          )}
        </div>
        <div className="rounded-xl border border-[#A3E635]/30 bg-[#161618] px-4 py-2 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Progreso hoy</p>
          <p className="text-2xl font-black text-[#A3E635]">{completionPct}%</p>
        </div>
      </div>

      {/* Discipline Tabs */}
      <div className="mb-5 flex flex-wrap gap-1 rounded-lg border border-zinc-800 bg-[#0B0B0C] p-1">
        {DISCIPLINES.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setDiscipline(d.id)}
            className={cn(
              'flex-1 min-w-[80px] rounded-lg px-3 py-2.5 text-xs font-bold uppercase transition-all duration-200',
              discipline === d.id
                ? 'bg-[#A3E635] text-black font-extrabold shadow-lg shadow-[#A3E635]/30'
                : 'text-gray-400 hover:bg-[#242427] hover:text-white'
            )}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Weekly Calendar — Horizontal flex row */}
      <div className="flex flex-row overflow-x-auto gap-2 pb-4 mb-6">
        {weekDays.map((day, i) => (
          <button
            key={day.iso}
            type="button"
            onClick={() => setSelectedDay(i)}
            className={cn(
              'flex-shrink-0 w-14 h-16 flex flex-col items-center justify-center rounded-lg text-xs font-bold font-mono transition-all duration-200',
              selectedDay === i
                ? 'bg-[#A3E635] text-black shadow-lg shadow-[#A3E635]/30'
                : day.isToday
                  ? 'border border-[#A3E635] text-[#A3E635] font-bold bg-[#161618]'
                  : 'bg-[#161618] border border-[#242427] text-gray-400 hover:border-[#A3E635]/40'
            )}
          >
            <span className="text-[10px] uppercase tracking-wider">{day.label}</span>
            <span className="text-lg font-black">{day.date}</span>
            {day.isToday && selectedDay !== i && (
              <span className="text-[8px] uppercase text-[#A3E635]">Hoy</span>
            )}
          </button>
        ))}
      </div>

      {/* 3-Column Grid: 2 cols workout + 1 col sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Workout — 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* A. Warm-up Card */}
          <div className="bg-[#161618] border border-zinc-800 rounded-xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h3 className="ls-section-title flex items-center gap-2">
                <Activity size={16} /> A. Calentamiento
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={openWodVideo}
                  className="flex items-center gap-2 rounded-lg border border-[#A3E635]/40 bg-[#A3E635]/10 px-3 py-1.5 text-xs font-bold text-[#A3E635] transition hover:bg-[#A3E635]/20"
                >
                  🎥 Ver Video
                </button>
                <button
                  type="button"
                  onClick={() => setWarmupDone(!warmupDone)}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg transition',
                    warmupDone
                      ? 'bg-[#A3E635] text-black'
                      : 'border border-[#242427] text-gray-500 hover:border-[#A3E635]/50'
                  )}
                >
                  <Check size={14} />
                </button>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-gray-300">{wod.warmup}</p>
          </div>

          {/* B. Strength Card */}
          <div className="bg-[#161618] border border-zinc-800 rounded-xl p-6">
            <h3 className="ls-section-title mb-1 flex items-center gap-2">
              <Dumbbell size={16} /> B. Fuerza
            </h3>
            <p className="mb-4 text-sm text-gray-400">
              {wod.strengthLabel} — {wod.strength}
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-left text-xs uppercase tracking-wider text-gray-500">
                    <th className="pb-2 pr-4">#</th>
                    <th className="pb-2 pr-4">Series</th>
                    <th className="pb-2 pr-4">Reps</th>
                    <th className="pb-2 pr-4">%</th>
                    <th className="pb-2">✓</th>
                  </tr>
                </thead>
                <tbody>
                  {STRENGTH_ROWS.map((row) => (
                    <tr key={row.id} className="border-b border-zinc-800/50">
                      <td className="py-2.5 pr-4 font-bold text-white">{row.id}</td>
                      <td className="py-2.5 pr-4 text-gray-300">{row.sets}</td>
                      <td className="py-2.5 pr-4 text-gray-300">{row.reps}</td>
                      <td className="py-2.5 pr-4 font-bold text-[#A3E635]">{row.pct}</td>
                      <td className="py-2.5">
                        <button
                          type="button"
                          onClick={() => setStrengthChecks((prev) => ({ ...prev, [row.id]: !prev[row.id] }))}
                          className={cn(
                            'flex h-7 w-7 items-center justify-center rounded-md transition',
                            strengthChecks[row.id]
                              ? 'bg-[#A3E635] text-black'
                              : 'border border-[#242427] hover:border-[#A3E635]/50'
                          )}
                        >
                          {strengthChecks[row.id] && <Check size={12} />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* C. Metcon Card */}
          <div className="bg-[#161618] border border-zinc-800 rounded-xl p-6">
            <h3 className="ls-section-title mb-3 flex items-center gap-2">
              <Zap size={16} /> C. Metcon (Circuito)
            </h3>
            <p className="text-sm leading-relaxed text-gray-300">{wod.metcon}</p>
          </div>
        </div>

        {/* Sidebar Widgets — 1 column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Timer Widget */}
          <div className="bg-[#0B0B0C] border border-zinc-800 rounded-xl p-6 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
              ⏱ Cronómetro WOD
            </p>
            <p className="font-mono text-5xl font-black text-[#A3E635] tracking-wider my-4">
              {formatTime(timerSeconds)}
            </p>
            <div className="flex gap-2 justify-center">
              <button
                type="button"
                onClick={() => setTimerRunning(!timerRunning)}
                className="ls-btn-primary text-sm px-4 py-2"
              >
                {timerRunning ? <Pause size={16} /> : <Play size={16} />}
                {timerRunning ? 'PAUSA' : 'PLAY'}
              </button>
              <button
                type="button"
                onClick={() => { setTimerRunning(false); setTimerSeconds(0); }}
                className="ls-btn-ghost text-sm px-3 py-2"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>

          {/* Nutrition Summary Widget */}
          <div className="bg-[#0B0B0C] border border-zinc-800 rounded-xl p-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">
              Nutrición Hoy
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Proteína</span>
                <span className="text-sm font-black text-[#A3E635]">142g</span>
              </div>
              <div className="h-1.5 rounded-full bg-zinc-800">
                <div className="h-full w-3/4 rounded-full bg-[#A3E635]" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Calorías</span>
                <span className="text-sm font-black text-white">2,180 kcal</span>
              </div>
              <div className="h-1.5 rounded-full bg-zinc-800">
                <div className="h-full w-4/5 rounded-full bg-white/60" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Hidratación</span>
                <span className="text-sm font-black text-blue-400">2.4L</span>
              </div>
              <div className="h-1.5 rounded-full bg-zinc-800">
                <div className="h-full w-3/5 rounded-full bg-blue-400/70" />
              </div>
            </div>
          </div>

          {/* Quick Coach CTA */}
          <button
            type="button"
            onClick={() => setView('coach')}
            className="w-full bg-[#161618] border border-zinc-800 rounded-xl p-5 text-left hover:border-[#A3E635]/40 transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#A3E635]/40 bg-[#0B0B0C]">
                <Logo className="h-8 w-8 max-w-none" />
              </div>
              <div>
                <p className="text-xs font-black uppercase text-white">Coach Ángel</p>
                <p className="text-[10px] text-gray-400">¿Dudas con el WOD?</p>
              </div>
              <span className="ml-auto h-2 w-2 rounded-full bg-[#A3E635] animate-pulse" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const CoachView = () => (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="h-[550px] bg-[#161618] border border-zinc-800 rounded-xl flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="flex items-center gap-3 border-b border-zinc-800 bg-[#161618] px-5 py-3">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[#A3E635]/40 bg-[#0B0B0C] p-0.5">
              <Logo className="h-8 w-8 max-w-none" />
            </div>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#161618] bg-[#A3E635] animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-tighter text-white">Coach Ángel (Avatar IA)</h2>
            <p className="text-[10px] text-gray-400">Técnica, sustituciones y motivación 24/7</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 rounded-full bg-[#A3E635]/10 px-2.5 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#A3E635] animate-pulse" />
            <span className="text-[10px] font-bold text-[#A3E635]">En Línea</span>
          </div>
        </div>

        {/* Messages — scrollable */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={cn('flex', msg.sender === 'user' ? 'justify-end' : 'justify-start')}
            >
              {msg.sender === 'coach' && (
                <div className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#A3E635]/30 bg-[#0B0B0C]">
                  <Logo className="h-6 w-6 max-w-none" />
                </div>
              )}
              <div
                className={cn(
                  'max-w-[80%] rounded-xl px-4 py-3 text-[13px] leading-relaxed whitespace-pre-line break-words',
                  msg.sender === 'user'
                    ? 'bg-[#242427] text-white rounded-br-sm'
                    : 'bg-[#0B0B0C] border-l-4 border-[#A3E635] text-gray-100 rounded-bl-sm'
                )}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {chatLoading && (
            <div className="flex justify-start">
              <div className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#A3E635]/30 bg-[#0B0B0C]">
                <Logo className="h-7 w-7 max-w-none" />
              </div>
              <div className="rounded-xl bg-[#0B0B0C] border-l-4 border-[#A3E635] px-4 py-3 text-sm text-gray-400">
                <span className="inline-flex gap-1">
                  <span className="animate-pulse">●</span>
                  <span className="animate-pulse [animation-delay:0.2s]">●</span>
                  <span className="animate-pulse [animation-delay:0.4s]">●</span>
                </span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="flex gap-2 border-t border-zinc-800 bg-[#161618] p-3">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
            placeholder="Escribe tu duda aquí..."
            className="ls-input flex-1 text-sm"
          />
          <button
            type="button"
            onClick={handleSendChat}
            disabled={!chatInput.trim()}
            className="ls-btn-primary disabled:opacity-40 px-4"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  const KitchenView = () => (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="font-black tracking-tighter uppercase text-white text-2xl">Cocina Digital</h1>
        <p className="text-sm text-gray-400">Nutrición de alto rendimiento para atletas elite</p>
      </div>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 bg-[#161618] border border-zinc-800 rounded-xl p-6">
        <div>
          <p className="text-base font-black uppercase tracking-tighter text-white">Guía Nutricional Base</p>
          <p className="text-xs text-gray-400">Macros, timing y protocolos para atletas de élite</p>
        </div>
        <button type="button" className="ls-btn-primary text-sm">
          📥 Descargar PDF
          <Download size={16} />
        </button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {RECIPES.map((recipe) => (
          <button
            key={recipe.id}
            type="button"
            onClick={() => setSelectedRecipe(recipe)}
            className="bg-[#161618] border border-zinc-800 rounded-xl p-5 text-left hover:border-[#333] transition-all duration-300 group"
          >
            <div className="mb-3 flex h-28 items-center justify-center rounded-lg bg-[#0B0B0C] text-5xl group-hover:bg-[#1F1F22] transition">
              {recipe.emoji}
            </div>
            <h3 className="font-bold text-white text-sm">{recipe.name}</h3>
            <div className="mt-2 flex items-center gap-2">
              <span className="rounded-full bg-[#A3E635]/15 px-2 py-0.5 text-[10px] font-bold uppercase text-[#A3E635]">
                {recipe.tag}
              </span>
              <span className="text-xs font-black text-[#A3E635]">{recipe.calories} kcal</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const PhysioView = () => (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="font-black tracking-tighter uppercase text-white text-2xl">Hub de Fisioterapia</h1>
        <p className="text-sm text-gray-400">Prevención clínica con enfoque atlético — rendimiento sostenible</p>
      </div>

      {/* Prevention Routines */}
      <div className="bg-[#161618] border border-zinc-800 rounded-xl p-6">
        <div className="mb-4 flex items-center gap-3">
          <Shield size={20} className="text-[#A3E635]" />
          <h2 className="font-black uppercase tracking-tighter text-white text-sm">A. Rutinas Preventivas</h2>
        </div>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          {PREVENTION_ROUTINES.map((routine) => (
            <div key={routine.id} className="rounded-lg border border-zinc-800 bg-[#0B0B0C] p-4 hover:border-[#A3E635]/30 transition">
              <div className="mb-2 flex items-center justify-between">
                <Stethoscope size={16} className="text-[#A3E635]" />
                <span className="text-[10px] font-bold text-gray-500">{routine.duration}</span>
              </div>
              <h3 className="font-bold text-white text-sm">{routine.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-gray-400">{routine.desc}</p>
              <button
                type="button"
                onClick={() => setPreventionVideo(routine.id)}
                className="mt-3 flex w-full items-center justify-center gap-1 rounded-md bg-[#A3E635]/10 py-1.5 text-[10px] font-bold text-[#A3E635] hover:bg-[#A3E635]/20 transition"
              >
                🎥 Ver protocolo
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Book Appointment */}
      <div className="bg-[#161618] border border-zinc-800 rounded-xl p-6">
        <div className="mb-5 flex items-center gap-3">
          <Target size={20} className="text-[#A3E635]" />
          <h2 className="font-black uppercase tracking-tighter text-white text-sm">B. Agendar Cita</h2>
        </div>

        {physioBooked ? (
          <div className="rounded-lg border border-[#A3E635]/35 bg-[#A3E635]/10 p-6 text-center">
            <Check className="mx-auto mb-2 text-[#A3E635]" size={32} />
            <p className="text-base font-black text-[#A3E635]">¡Cita reservada!</p>
            <p className="mt-1 text-xs text-gray-400">{physioDate} · {physioSlot}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="ls-label">Tipo de tratamiento</label>
              <select value={physioTherapy} onChange={(e) => setPhysioTherapy(e.target.value)} className="ls-input">
                <option value="descarga">Descarga muscular</option>
                <option value="eval">Evaluación de lesión</option>
                <option value="terapia">Terapia física</option>
              </select>
            </div>
            <div>
              <label className="ls-label"><Calendar size={12} /> Fecha</label>
              <DatePicker value={physioDate} onChange={setPhysioDate} placeholder="Clic para elegir fecha" />
            </div>
            <div>
              <label className="ls-label"><Clock size={12} /> Horario</label>
              <div className="flex flex-wrap gap-2">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setPhysioSlot(slot)}
                    className={cn(
                      'rounded-lg border px-4 py-2 text-xs font-bold transition',
                      physioSlot === slot
                        ? 'border-[#A3E635] bg-[#A3E635] text-black'
                        : 'border-[#242427] text-gray-400 hover:border-[#A3E635]/50'
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
              className="ls-btn-primary w-full disabled:opacity-40"
            >
              CONFIRMAR CITA
            </button>
          </div>
        )}
      </div>

      {/* Therapist Notes */}
      <div className="bg-[#161618] border border-zinc-800 rounded-xl p-6">
        <div className="mb-4 flex items-center gap-3">
          <FileText size={20} className="text-[#A3E635]" />
          <h2 className="font-black uppercase tracking-tighter text-white text-sm">C. Notas del Fisioterapeuta</h2>
        </div>
        <div className="space-y-3">
          {THERAPIST_NOTES.map((note) => (
            <div
              key={note.title}
              className={cn(
                'rounded-lg border bg-[#0B0B0C] p-4',
                note.status === 'Activa' ? 'border-[#A3E635]/40' : 'border-zinc-800'
              )}
            >
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-white text-sm">{note.title}</h3>
                  <p className="text-[10px] text-gray-500">{note.date}</p>
                </div>
                <span className={cn(
                  'rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase',
                  note.status === 'Activa' ? 'bg-[#A3E635]/15 text-[#A3E635]' : 'bg-[#242427] text-gray-500'
                )}>
                  {note.status}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-gray-400">{note.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const ProfessorView = () => (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="font-black tracking-tighter uppercase text-white text-2xl">Panel del Profesor</h1>
        <p className="text-sm text-gray-400">Sube rutinas con video — aparecen automáticamente en el Panel del Atleta</p>
      </div>

      <div className="bg-[#161618] border border-zinc-800 rounded-xl p-6">
        <div className="mb-5 flex items-center gap-3">
          <Upload size={20} className="text-[#A3E635]" />
          <h2 className="font-black uppercase tracking-tighter text-white text-sm">A. Publicar rutina del día</h2>
        </div>

        {profSaved && (
          <div className="mb-4 rounded-lg border border-[#A3E635]/35 bg-[#A3E635]/10 px-4 py-2 text-center text-xs font-bold text-[#A3E635]">
            ✓ Rutina publicada — ya visible para los atletas
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="ls-label">Disciplina</label>
              <select
                value={profForm.discipline}
                onChange={(e) => setProfForm((f) => ({ ...f, discipline: e.target.value as Discipline }))}
                className="ls-input"
              >
                {DISCIPLINES.map((d) => (
                  <option key={d.id} value={d.id}>{d.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="ls-label"><Calendar size={12} /> Fecha de la rutina</label>
              <DatePicker value={profForm.date} onChange={(date) => setProfForm((f) => ({ ...f, date }))} placeholder="Toca para elegir fecha" />
              <div className="mt-3">
                <WeekDayStrip days={weekDays} selectedIso={profForm.date} onSelectIso={(iso) => setProfForm((f) => ({ ...f, date: iso }))} />
              </div>
            </div>
            <div>
              <label className="ls-label">Título de la sesión</label>
              <input type="text" value={profForm.title} onChange={(e) => setProfForm((f) => ({ ...f, title: e.target.value }))} placeholder="Ej: WOD Martes — Hyrox" className="ls-input" />
            </div>
            <div>
              <label className="ls-label"><Link size={12} /> URL del video</label>
              <input type="url" value={profForm.videoUrl} onChange={(e) => setProfForm((f) => ({ ...f, videoUrl: e.target.value }))} placeholder="https://youtube.com/watch?v=..." className="ls-input" />
            </div>
            <div>
              <label className="ls-label">Nombre del video</label>
              <input type="text" value={profForm.videoTitle} onChange={(e) => setProfForm((f) => ({ ...f, videoTitle: e.target.value }))} placeholder="Ej: Técnica Back Squat" className="ls-input" />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="ls-label"><Activity size={12} /> A. Calentamiento</label>
              <textarea value={profForm.warmup} onChange={(e) => setProfForm((f) => ({ ...f, warmup: e.target.value }))} rows={3} placeholder="Descripción del calentamiento..." className="ls-input resize-none" />
            </div>
            <div>
              <label className="ls-label"><Dumbbell size={12} /> B. Fuerza</label>
              <input type="text" value={profForm.strengthLabel} onChange={(e) => setProfForm((f) => ({ ...f, strengthLabel: e.target.value }))} placeholder="Ej: Back Squat" className="ls-input mb-2" />
              <textarea value={profForm.strength} onChange={(e) => setProfForm((f) => ({ ...f, strength: e.target.value }))} rows={2} placeholder="Series, reps, %..." className="ls-input resize-none" />
            </div>
            <div>
              <label className="ls-label"><Zap size={12} /> C. Metcon</label>
              <textarea value={profForm.metcon} onChange={(e) => setProfForm((f) => ({ ...f, metcon: e.target.value }))} rows={3} placeholder="AMRAP, EMOM, for time..." className="ls-input resize-none" />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePublishProgram}
          disabled={!profForm.date || !profForm.title || !profForm.warmup}
          className="ls-btn-primary mt-5 w-full disabled:opacity-40"
        >
          <Plus size={16} /> PUBLICAR RUTINA
        </button>
      </div>

      {/* Published Programs */}
      <div className="bg-[#161618] border border-zinc-800 rounded-xl p-6">
        <div className="mb-4 flex items-center gap-3">
          <Video size={20} className="text-[#A3E635]" />
          <h2 className="font-black uppercase tracking-tighter text-white text-sm">B. Rutinas publicadas</h2>
          <span className="text-[10px] text-gray-500">{programs.filter((p) => p.published).length} activas</span>
        </div>

        {programs.filter((p) => p.published).length === 0 ? (
          <p className="rounded-lg border border-dashed border-zinc-800 bg-[#0B0B0C] p-6 text-center text-xs text-gray-500">
            Aún no hay rutinas. Publica la primera arriba.
          </p>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {programs.filter((p) => p.published).map((prog) => (
              <div key={prog.id} className="rounded-lg border border-zinc-800 bg-[#0B0B0C] p-4 hover:border-[#A3E635]/30 transition">
                <div className="mb-2 flex aspect-video items-center justify-center rounded-md bg-[#161618]">
                  {prog.videoUrl ? (
                    <a href={prog.videoUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 text-[#A3E635] hover:text-[#bef264] transition">
                      <Play size={24} />
                      <span className="text-[9px] font-bold uppercase">Ver video</span>
                    </a>
                  ) : (
                    <Video size={24} className="text-gray-600" />
                  )}
                </div>
                <div className="mb-1.5 flex flex-wrap gap-1">
                  <span className="rounded-full bg-[#A3E635]/15 px-2 py-0.5 text-[9px] font-bold uppercase text-[#A3E635]">
                    {DISCIPLINES.find((d) => d.id === prog.discipline)?.label}
                  </span>
                  <span className="rounded-full bg-[#242427] px-2 py-0.5 text-[9px] font-bold text-gray-400">
                    {prog.date}
                  </span>
                </div>
                <h3 className="font-bold text-white text-xs">{prog.title}</h3>
                <p className="mt-0.5 line-clamp-2 text-[10px] text-gray-500">{prog.warmup}</p>
                <div className="mt-3 flex gap-2">
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
                    className="flex-1 rounded-md bg-[#A3E635]/15 py-1.5 text-[10px] font-bold text-[#A3E635] hover:bg-[#A3E635]/25 transition"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteProgram(prog.id)}
                    className="rounded-md border border-red-500/30 px-2.5 py-1.5 text-red-400 hover:bg-red-500/10 transition"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderAppView = () => {
    if (!isSubscribed && view !== 'professor') {
      return (
        <div className="flex flex-col items-center justify-center py-24 text-center px-4">
          <Lock className="mb-4 text-gray-600" size={48} />
          <p className="text-gray-400">Activa tu membresía para acceder al Box Online.</p>
          <button type="button" onClick={startFreeTrial} className="mt-4 font-bold text-[#A3E635] hover:underline">
            Empezar gratis →
          </button>
        </div>
      );
    }
    switch (view) {
      case 'dashboard': return DashboardView();
      case 'coach': return CoachView();
      case 'kitchen': return KitchenView();
      case 'physio': return PhysioView();
      case 'professor': return ProfessorView();
      default: return DashboardView();
    }
  };

  /* ─── MARKETING SITE (HWPO-style) ─── */
  if (isMarketingView) {
    return (
      <MarketingShell
        activeView={view === 'about' ? 'about' : 'landing'}
        onNavigate={(v) => setView(v)}
        onEnterApp={enterApp}
        onEnterAdmin={() => setView('professor')}
        onStartFree={startFreeTrial}
      >
        {view === 'landing' ? (
          <MarketingLanding
            landingSub={landingSub}
            setLandingSub={setLandingSub}
            onStartFree={startFreeTrial}
            onMeetCoach={() => setView('about')}
            checkoutName={checkoutName}
            setCheckoutName={setCheckoutName}
            checkoutEmail={checkoutEmail}
            setCheckoutEmail={setCheckoutEmail}
            checkoutCard={checkoutCard}
            setCheckoutCard={setCheckoutCard}
            checkoutExpiry={checkoutExpiry}
            setCheckoutExpiry={setCheckoutExpiry}
            checkoutCvc={checkoutCvc}
            setCheckoutCvc={setCheckoutCvc}
            onSubscribe={handleSubscribe}
          />
        ) : (
          AboutView()
        )}
      </MarketingShell>
    );
  }

  /* ─── APP / LMS SHELL ─── */
  return (
    <div className="flex min-h-screen bg-[#0B0B0C] font-sans">
      {mobileSidebar && (
        <div className="fixed inset-0 z-40 bg-black/70 lg:hidden" onClick={() => setMobileSidebar(false)} role="presentation" />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 transform border-r border-zinc-800 bg-[#161618] transition-all duration-300 lg:relative lg:translate-x-0',
          mobileSidebar ? 'translate-x-0' : '-translate-x-full',
          sidebarOpen ? 'w-64' : 'w-[72px]'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-zinc-800 px-3 py-4">
            <Logo className={cn('mx-auto', sidebarOpen || mobileSidebar ? 'h-32 w-full max-w-[200px]' : 'h-12 w-12 max-w-[48px]')} />
            {(sidebarOpen || mobileSidebar) && (
              <p className="mt-2 text-center text-[9px] font-black uppercase tracking-widest text-[#A3E635]">Box Online</p>
            )}
          </div>
          <nav className="flex-1 space-y-1 px-2 py-3">
            {appNavItems.map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={item.locked}
                onClick={() => { if (!item.locked) { setView(item.id); setMobileSidebar(false); } }}
                className={cn(
                  'group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200',
                  view === item.id
                    ? 'bg-[#A3E635] text-black font-extrabold'
                    : item.locked
                      ? 'cursor-not-allowed text-gray-600 opacity-50'
                      : item.admin
                        ? 'text-amber-400/90 hover:bg-amber-500/10 hover:text-amber-300'
                        : 'text-gray-400 hover:bg-[#242427] hover:text-white'
                )}
              >
                {item.icon}
                {(sidebarOpen || mobileSidebar) && <span>{item.label}</span>}
              </button>
            ))}
          </nav>
          {isSubscribed && (sidebarOpen || mobileSidebar) && (
            <div className="mx-2 mb-2 rounded-lg border border-[#A3E635]/30 bg-[#A3E635]/10 p-2.5">
              <p className="text-[9px] font-bold uppercase tracking-wider text-[#A3E635]">Miembro activo</p>
              <p className="mt-0.5 text-[10px] text-gray-400">Plan Elite · Acceso completo</p>
            </div>
          )}
          <button
            type="button"
            onClick={() => setView('landing')}
            className="mx-2 mb-2 rounded-lg border border-zinc-800 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-500 transition hover:border-[#A3E635]/40 hover:text-white"
          >
            {sidebarOpen || mobileSidebar ? '← Volver al sitio' : '←'}
          </button>
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden border-t border-zinc-800 p-2.5 text-[10px] text-gray-500 transition hover:text-white lg:block"
          >
            {sidebarOpen ? '← Contraer' : '→'}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-800 bg-[#0B0B0C]/95 px-4 py-2.5 backdrop-blur-md lg:px-6">
          <button type="button" onClick={() => setMobileSidebar(true)} className="rounded-lg p-2 text-gray-400 hover:bg-[#242427] hover:text-white lg:hidden">
            <Menu size={20} />
          </button>
          <div className="hidden lg:flex items-center gap-3">
            <Logo className="h-10 w-full max-w-[140px]" />
            <span className="rounded-full bg-[#A3E635]/10 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#A3E635]">
              LMS · Box Online
            </span>
          </div>
          {isSubscribed && (
            <div className="hidden items-center gap-1.5 rounded-full bg-[#A3E635]/10 px-3 py-1 text-[10px] font-bold text-[#A3E635] sm:flex">
              <BookOpen size={10} /> Miembro Elite
            </div>
          )}
        </header>

        <main className="flex-1 overflow-y-auto bg-[#0B0B0C]">
          {renderAppView()}
        </main>
      </div>

      {/* Video Técnica Modal */}
      {videoModalOpen && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50" onClick={() => setVideoModalOpen(false)} role="presentation">
          <div className="bg-[#161618] p-4 rounded-xl max-w-2xl w-full border border-zinc-800" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="font-black uppercase tracking-tighter text-white text-sm">{activeVideoTitle}</h3>
                <p className="text-[10px] text-gray-400">
                  {activeProgram?.videoUrl ? 'Video subido por el profesor' : 'Demostración del movimiento'}
                </p>
              </div>
              <button type="button" onClick={() => setVideoModalOpen(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-[#242427] hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-lg bg-[#0B0B0C] border border-zinc-800">
              {activeProgram?.videoUrl ? (
                <iframe title={activeVideoTitle} src={toEmbedUrl(activeProgram.videoUrl)} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              ) : (
                <>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-full bg-[#A3E635]/20 hover:scale-110 hover:bg-[#A3E635]/30 transition">
                      <Play size={28} className="ml-0.5 text-[#A3E635]" />
                    </div>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                    <div className="mb-1.5 h-1 rounded-full bg-zinc-800"><div className="h-full w-2/5 rounded-full bg-[#A3E635]" /></div>
                    <span className="text-[10px] text-gray-400">02:34 / 08:15</span>
                  </div>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={() => { setVideoModalOpen(false); setWarmupDone(true); }}
              className="ls-btn-primary mt-3 w-full text-sm"
            >
              <Check size={14} /> MARCAR CALENTAMIENTO COMPLETADO
            </button>
          </div>
        </div>
      )}

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setSelectedRecipe(null)} role="presentation">
          <div className="bg-[#161618] border border-zinc-800 rounded-xl max-h-[85vh] w-full max-w-sm overflow-y-auto p-5" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="mb-2 text-4xl">{selectedRecipe.emoji}</div>
            <div className="mb-3 flex items-start justify-between">
              <div>
                <h3 className="text-base font-black uppercase tracking-tighter text-white">{selectedRecipe.name}</h3>
                <span className="inline-block rounded-full bg-[#A3E635]/15 px-2 py-0.5 text-[9px] font-bold uppercase text-[#A3E635]">{selectedRecipe.tag}</span>
              </div>
              <button type="button" onClick={() => setSelectedRecipe(null)} className="text-gray-400 hover:text-white"><X size={16} /></button>
            </div>
            <p className="mb-4 text-2xl font-black text-[#A3E635]">{selectedRecipe.calories} kcal</p>
            <div className="mb-4 grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-[#0B0B0C] border border-zinc-800 p-2.5 text-center">
                <p className="text-base font-black text-[#A3E635]">{selectedRecipe.protein}g</p>
                <p className="text-[9px] text-gray-500">Proteína</p>
              </div>
              <div className="rounded-lg bg-[#0B0B0C] border border-zinc-800 p-2.5 text-center">
                <p className="text-base font-black text-white">{selectedRecipe.carbs}g</p>
                <p className="text-[9px] text-gray-500">Carbos</p>
              </div>
              <div className="rounded-lg bg-[#0B0B0C] border border-zinc-800 p-2.5 text-center">
                <p className="text-base font-black text-gray-400">{selectedRecipe.fat}g</p>
                <p className="text-[9px] text-gray-500">Grasas</p>
              </div>
            </div>
            <h4 className="mb-2 text-[10px] font-black uppercase tracking-wider text-gray-500">Ingredientes</h4>
            <ul className="space-y-1.5">
              {selectedRecipe.ingredients.map((ing) => (
                <li key={ing} className="flex items-center gap-2 text-xs text-gray-300">
                  <span className="h-1 w-1 rounded-full bg-[#A3E635]" />
                  {ing}
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => setSelectedRecipe(null)} className="ls-btn-ghost mt-4 w-full justify-center text-xs">
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Prevention Video Modal */}
      {preventionVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setPreventionVideo(null)} role="presentation">
          <div className="bg-[#161618] border border-zinc-800 rounded-xl w-full max-w-lg p-5" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="mb-3 flex justify-between">
              <h3 className="font-black uppercase tracking-tighter text-white text-sm">
                {PREVENTION_ROUTINES.find((r) => r.id === preventionVideo)?.title}
              </h3>
              <button type="button" onClick={() => setPreventionVideo(null)} className="text-gray-400 hover:text-white"><X size={16} /></button>
            </div>
            <div className="flex aspect-video items-center justify-center rounded-lg bg-[#0B0B0C] border border-zinc-800">
              <Play size={40} className="text-[#A3E635]" />
            </div>
            <p className="mt-3 text-xs text-gray-400">
              {PREVENTION_ROUTINES.find((r) => r.id === preventionVideo)?.desc}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
