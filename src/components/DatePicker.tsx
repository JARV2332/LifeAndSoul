import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';

export interface WeekDayItem {
  label: string;
  date: number;
  iso: string;
  isToday?: boolean;
}

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

interface WeekDayStripProps {
  days: WeekDayItem[];
  selectedIso?: string;
  selectedIndex?: number;
  onSelectIso?: (iso: string) => void;
  onSelectIndex?: (index: number) => void;
}

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function cn(...c: (string | false | undefined)[]) {
  return c.filter(Boolean).join(' ');
}

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDisplay(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  const date = new Date(`${iso}T12:00:00`);
  const weekday = WEEKDAYS[date.getDay()];
  return `${weekday}, ${d} ${MONTHS[parseInt(m, 10) - 1]?.slice(0, 3) ?? ''} ${y}`;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function DatePicker({ value, onChange, placeholder = 'Selecciona una fecha' }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() =>
    value ? new Date(`${value}T12:00:00`) : new Date()
  );
  const [pos, setPos] = useState({ top: 0, left: 0, width: 320, above: false });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const popH = 420;
    const spaceBelow = window.innerHeight - rect.bottom;
    const above = spaceBelow < popH && rect.top > popH;
    const width = Math.max(rect.width, 340);
    let left = rect.left;
    if (left + width > window.innerWidth - 12) left = window.innerWidth - width - 12;
    if (left < 12) left = 12;
    setPos({
      top: above ? rect.top - popH - 10 : rect.bottom + 10,
      left,
      width,
      above,
    });
  }, []);

  useEffect(() => {
    if (value) setViewDate(new Date(`${value}T12:00:00`));
  }, [value]);

  useEffect(() => {
    if (!open) return;
    updatePosition();
    const onScroll = () => updatePosition();
    const onResize = () => updatePosition();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onClickOutside = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        triggerRef.current?.contains(t) ||
        popoverRef.current?.contains(t)
      )
        return;
      setOpen(false);
    };
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClickOutside);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, [open, updatePosition]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const todayISO = toISO(new Date());

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const selectDay = (day: number) => {
    onChange(toISO(new Date(year, month, day)));
    setOpen(false);
  };

  const calendarPopover = open ? (
    <>
      <div
        className="ls-calendar-backdrop fixed inset-0 z-[9998] bg-black/50 backdrop-blur-[2px]"
        aria-hidden
      />
      <div
        ref={popoverRef}
        className="ls-calendar-popover fixed z-[9999] overflow-hidden rounded-2xl border border-accent/25 bg-charcoal shadow-[0_24px_80px_rgba(0,0,0,0.85),0_0_40px_rgba(164,255,0,0.08)]"
        style={{ top: pos.top, left: pos.left, width: pos.width }}
        role="dialog"
        aria-modal="true"
        aria-label="Calendario"
      >
        <div className="relative border-b border-white/[0.06] bg-gradient-to-r from-accent/15 via-charcoal to-charcoal px-5 py-4">
          <div className="ls-glow -right-10 -top-10 h-32 w-32 bg-accent/20" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-accent">
                Seleccionar fecha
              </p>
              <p className="mt-0.5 text-lg font-black text-white">
                {MONTHS[month]} {year}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-xl border border-white/10 p-2 text-gray-400 transition hover:border-accent/40 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
          <div className="relative mt-4 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-obsidian text-gray-300 transition hover:border-accent/50 hover:bg-accent/10 hover:text-accent"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex-1 text-center">
              <span className="inline-block rounded-full bg-accent/20 px-4 py-1 text-xs font-bold uppercase tracking-wider text-accent">
                {WEEKDAYS[new Date(year, month, 1).getDay()]} — {daysInMonth} días
              </span>
            </div>
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-obsidian text-gray-300 transition hover:border-accent/50 hover:bg-accent/10 hover:text-accent"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-2 grid grid-cols-7 gap-1">
            {WEEKDAYS.map((wd, i) => (
              <div
                key={wd}
                className={cn(
                  'py-2 text-center text-[10px] font-black uppercase tracking-wider',
                  i === 0 || i === 6 ? 'text-accent/70' : 'text-gray-500'
                )}
              >
                {wd}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {cells.map((day, i) => {
              if (day === null) return <div key={`e-${i}`} className="aspect-square" />;
              const iso = toISO(new Date(year, month, day));
              const isSelected = value === iso;
              const isToday = iso === todayISO;
              const dayOfWeek = new Date(year, month, day).getDay();
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => selectDay(day)}
                  className={cn(
                    'relative flex aspect-square items-center justify-center rounded-xl text-sm font-bold transition-all duration-150',
                    isSelected
                      ? 'scale-105 bg-gradient-to-br from-accent to-accent-light text-black shadow-lg shadow-accent/50'
                      : isToday
                        ? 'border-2 border-accent bg-accent/10 text-accent ring-2 ring-accent/20'
                        : isWeekend
                          ? 'text-gray-400 hover:bg-accent/10 hover:text-accent'
                          : 'text-gray-200 hover:bg-white/10 hover:text-white'
                  )}
                >
                  {day}
                  {isToday && !isSelected && (
                    <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-accent" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-2 border-t border-white/[0.06] bg-obsidian/80 p-4">
          <button
            type="button"
            onClick={() => {
              onChange(todayISO);
              setOpen(false);
            }}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-accent-light py-3 text-xs font-black uppercase tracking-wider text-black shadow-md shadow-accent/30 transition hover:scale-[1.02]"
          >
            <Calendar size={14} />
            Hoy
          </button>
          <button
            type="button"
            onClick={() => {
              onChange('');
              setOpen(false);
            }}
            className="flex-1 rounded-xl border border-white/10 py-3 text-xs font-bold uppercase tracking-wider text-gray-400 transition hover:border-white/20 hover:text-white"
          >
            Limpiar
          </button>
        </div>
      </div>
    </>
  ) : null;

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          if (!open) setTimeout(updatePosition, 0);
        }}
        className={cn(
          'group flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all duration-200',
          open
            ? 'border-accent/60 bg-accent/5 ring-2 ring-accent/30'
            : 'border-white/10 bg-obsidian hover:border-accent/40 hover:bg-elevated'
        )}
      >
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition',
            open ? 'bg-accent text-black' : 'bg-accent/15 text-accent group-hover:bg-accent/25'
          )}
        >
          <Calendar size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
            Fecha
          </p>
          <p className={cn('truncate text-sm font-semibold', value ? 'text-white' : 'text-gray-600')}>
            {value ? formatDisplay(value) : placeholder}
          </p>
        </div>
        <ChevronRight
          size={18}
          className={cn(
            'shrink-0 text-gray-500 transition-transform duration-200',
            open && 'rotate-90 text-accent'
          )}
        />
      </button>

      {typeof document !== 'undefined' && createPortal(calendarPopover, document.body)}
    </div>
  );
}

export function WeekDayStrip({
  days,
  selectedIso,
  selectedIndex,
  onSelectIso,
  onSelectIndex,
}: WeekDayStripProps) {
  const isSelected = (day: WeekDayItem, index: number) =>
    selectedIso !== undefined ? selectedIso === day.iso : selectedIndex === index;

  const handleSelect = (day: WeekDayItem, index: number) => {
    onSelectIso?.(day.iso);
    onSelectIndex?.(index);
  };

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-charcoal/80 p-2 backdrop-blur-sm">
      <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
        Semana de entrenamiento
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {days.map((day, i) => {
          const active = isSelected(day, i);
          return (
            <button
              key={day.iso}
              type="button"
              onClick={() => handleSelect(day, i)}
              className={cn(
                'group relative flex min-w-[92px] flex-col items-center rounded-2xl px-4 py-4 transition-all duration-300',
                active
                  ? 'bg-gradient-to-b from-accent to-accent-light text-black shadow-lg shadow-accent/40 scale-[1.02]'
                  : 'border border-white/[0.08] bg-obsidian text-muted hover:border-accent/40 hover:bg-elevated'
              )}
            >
              {day.isToday && !active && (
                <span className="absolute -top-1 right-2 h-2 w-2 rounded-full bg-accent shadow-[0_0_8px_#a4ff00]" />
              )}
              <span
                className={cn(
                  'text-[10px] font-black uppercase tracking-widest',
                  active ? 'text-black/70' : 'text-gray-500 group-hover:text-accent'
                )}
              >
                {day.label}
              </span>
              <span
                className={cn(
                  'mt-1 text-3xl font-black tabular-nums',
                  active ? 'text-black' : 'text-white'
                )}
              >
                {day.date}
              </span>
              {day.isToday && (
                <span
                  className={cn(
                    'mt-2 rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider',
                    active ? 'bg-black/20 text-black' : 'bg-accent/20 text-accent'
                  )}
                >
                  Hoy
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
