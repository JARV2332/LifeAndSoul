export type Discipline = 'hyrox' | 'crossfit' | 'strength' | 'athletics';

export interface WorkoutProgram {
  id: string;
  discipline: Discipline;
  date: string;
  title: string;
  warmup: string;
  strength: string;
  strengthLabel: string;
  metcon: string;
  videoUrl: string;
  videoTitle: string;
  published: boolean;
  createdAt: string;
}

const STORAGE_KEY = 'life-soul-programs';

export function loadPrograms(): WorkoutProgram[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as WorkoutProgram[];
  } catch {
    return [];
  }
}

export function savePrograms(programs: WorkoutProgram[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(programs));
}

export function findProgram(
  programs: WorkoutProgram[],
  discipline: Discipline,
  date: string
): WorkoutProgram | undefined {
  return programs.find((p) => p.published && p.discipline === discipline && p.date === date);
}
