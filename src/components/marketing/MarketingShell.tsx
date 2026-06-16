import { useState, type ReactNode } from 'react';
import { Menu, X } from 'lucide-react';

const LOGO_SRC = '/logo.png';

function cn(...c: (string | false | undefined)[]) {
  return c.filter(Boolean).join(' ');
}

interface MarketingShellProps {
  children: ReactNode;
  onNavigate: (view: 'landing' | 'about') => void;
  onEnterApp: () => void;
  onEnterAdmin?: () => void;
  onStartFree: () => void;
  activeView: 'landing' | 'about';
}

export function MarketingShell({
  children,
  onNavigate,
  onEnterApp,
  onEnterAdmin,
  onStartFree,
  activeView,
}: MarketingShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLink = (id: 'landing' | 'about', label: string) => (
    <button
      type="button"
      onClick={() => {
        onNavigate(id);
        setMenuOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      className={cn(
        'text-xs font-bold uppercase tracking-wider transition',
        activeView === id ? 'text-[#A3E635]' : 'text-gray-400 hover:text-white'
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#0B0B0C] font-sans text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-[#0B0B0C]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 lg:px-6">
          <button type="button" onClick={() => onNavigate('landing')} className="shrink-0">
            <img src={LOGO_SRC} alt="Life & Soul" className="h-10 w-auto max-w-[140px] object-contain lg:h-12 lg:max-w-[160px]" />
          </button>

          <nav className="hidden items-center gap-8 md:flex">
            {navLink('landing', 'Programas')}
            {navLink('about', 'Conócenos')}
            <button
              type="button"
              onClick={onEnterApp}
              className="text-xs font-bold uppercase tracking-wider text-gray-400 transition hover:text-white"
            >
              Box Online
            </button>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <button type="button" onClick={onEnterApp} className="ls-btn-ghost text-xs px-4 py-2">
              Iniciar sesión
            </button>
            <button type="button" onClick={onStartFree} className="ls-btn-primary text-xs px-5 py-2.5">
              Empezar gratis
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg p-2 text-gray-400 md:hidden"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-zinc-800 bg-[#161618] px-4 py-4 md:hidden">
            <div className="flex flex-col gap-4">
              {navLink('landing', 'Programas')}
              {navLink('about', 'Conócenos')}
              <button type="button" onClick={() => { onEnterApp(); setMenuOpen(false); }} className="text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                Box Online
              </button>
              <button type="button" onClick={() => { onStartFree(); setMenuOpen(false); }} className="ls-btn-primary w-full">
                Empezar gratis
              </button>
            </div>
          </div>
        )}
      </header>

      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-[#0B0B0C]">
        <div className="mx-auto max-w-6xl px-4 py-12 lg:px-6">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <img src={LOGO_SRC} alt="Life & Soul" className="mb-4 h-12 w-auto" />
              <p className="text-xs leading-relaxed text-gray-500">
                Forjamos carácter y propósito. Entrenamiento funcional de élite desde Guatemala para el mundo.
              </p>
            </div>
            <div>
              <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-[#A3E635]">Programas</p>
              <ul className="space-y-2 text-xs text-gray-400">
                <li>Hyrox</li>
                <li>CrossFit</li>
                <li>Fuerza Aplicada</li>
                <li>Atletismo</li>
              </ul>
            </div>
            <div>
              <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-[#A3E635]">Plataforma</p>
              <ul className="space-y-2 text-xs text-gray-400">
                <li><button type="button" onClick={onEnterApp} className="hover:text-white">Box Online</button></li>
                {onEnterAdmin && (
                  <li><button type="button" onClick={onEnterAdmin} className="hover:text-white">Admin · Panel Profe</button></li>
                )}
                <li>Coach Ángel IA</li>
                <li>Cocina Digital</li>
                <li>Hub Fisioterapia</li>
              </ul>
            </div>
            <div>
              <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-[#A3E635]">Contacto</p>
              <ul className="space-y-2 text-xs text-gray-400">
                <li>(502) 3405 2488</li>
                <li>angelifeandsoul@gmail.com</li>
                <li>Guatemala</li>
              </ul>
            </div>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-zinc-800 pt-6">
            <p className="text-[10px] text-gray-600">© {new Date().getFullYear()} Life & Soul Functional Training</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
              Levántate. Entrena fuerte. Cree en ti.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
