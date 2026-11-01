export type Energy = "intenso" | "intermedio" | "ligero";
export type DayCategory = Energy | "diverso" | "descanso" | "sin";

export interface Activity {
  id: string;
  name: string;
  energy: Energy;
  minutes: number;
}

export interface DayLog {
  date: string; // YYYY-MM-DD local
  isRest: boolean;
  notes: string;
  activities: Activity[];
  updatedAt: string; // ISO
}

export type GoalStatus = "idea" | "proceso" | "finalizada";

export interface GoalHistoryEntry {
  completedAt: string;
  reopenedAt?: string;
}

export interface Goal {
  id: string;
  name: string;
  description: string;
  energy: Energy;
  status: GoalStatus;
  progress: number; // 0-100
  completedAt: string | null;
  history: GoalHistoryEntry[];
  createdAt: string;
}

export const MAX_IN_PROGRESS = 3;
export const GOAL_NAME_MAX = 60;

/** Fixed order used everywhere (charts, legends, tables). */
export const CATEGORY_ORDER: DayCategory[] = [
  "intenso",
  "intermedio",
  "ligero",
  "diverso",
  "descanso",
  "sin",
];

export const CATEGORY_LABEL: Record<DayCategory, string> = {
  intenso: "Intenso",
  intermedio: "Intermedio",
  ligero: "Ligero",
  diverso: "Diverso",
  descanso: "Descanso",
  sin: "Sin registro",
};

export const ENERGIES: Energy[] = ["intenso", "intermedio", "ligero"];

/* ---------- dates (always local) ---------- */

export function toKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function fromKey(key: string): Date {
  const [y = 0, m = 1, d = 1] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function daysInMonth(year: number, month0: number): number {
  return new Date(year, month0 + 1, 0).getDate();
}

export function prevMonth(year: number, month0: number) {
  return month0 === 0 ? { year: year - 1, month0: 11 } : { year, month0: month0 - 1 };
}

export function nextMonth(year: number, month0: number) {
  return month0 === 11 ? { year: year + 1, month0: 0 } : { year, month0: month0 + 1 };
}

export const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];
export const WEEKDAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function formatLong(key: string): string {
  const d = fromKey(key);
  return `${cap(WEEKDAYS[d.getDay()] ?? "")}, ${d.getDate()} de ${MONTHS[d.getMonth()] ?? ""} de ${d.getFullYear()}`;
}

/** Monday-first grid of 6x7 or 5x7 dates for a month. */
export function monthGrid(year: number, month0: number): Date[] {
  const first = new Date(year, month0, 1);
  const offset = (first.getDay() + 6) % 7;
  const total = daysInMonth(year, month0);
  const cells = Math.ceil((offset + total) / 7) * 7;
  return Array.from({ length: cells }, (_, i) => new Date(year, month0, 1 - offset + i));
}

/* ---------- rules ---------- */

export function dayCategory(log: DayLog | undefined): DayCategory {
  if (!log) return "sin";
  if (log.isRest) return "descanso";
  if (log.activities.length === 0) return "sin";
  const counts = countByEnergy(log.activities);
  const max = Math.max(...ENERGIES.map((e) => counts[e]));
  const top = ENERGIES.filter((e) => counts[e] === max);
  return top.length > 1 ? "diverso" : (top[0] ?? "diverso");
}

export function countByEnergy(activities: Activity[]): Record<Energy, number> {
  const c: Record<Energy, number> = { intenso: 0, intermedio: 0, ligero: 0 };
  for (const a of activities) c[a.energy]++;
  return c;
}

/** Percentage by number of activities per category. */
export function dayDistribution(activities: Activity[]): Record<Energy, number> {
  const c = countByEnergy(activities);
  const n = activities.length;
  return {
    intenso: n ? (c.intenso / n) * 100 : 0,
    intermedio: n ? (c.intermedio / n) * 100 : 0,
    ligero: n ? (c.ligero / n) * 100 : 0,
  };
}

export function totalMinutes(activities: Activity[]): number {
  return activities.reduce((s, a) => s + (Number.isFinite(a.minutes) ? a.minutes : 0), 0);
}

/** Round a list of percentages to 1 decimal so they add up exactly to 100. */
export function roundTo100(values: number[]): number[] {
  const sum = values.reduce((a, b) => a + b, 0);
  if (sum === 0) return values.map(() => 0);
  const scaled = values.map((v) => (v / sum) * 1000);
  const floors = scaled.map(Math.floor);
  let rest = 1000 - floors.reduce((a, b) => a + b, 0);
  const order = scaled
    .map((v, i) => ({ i, r: v - Math.floor(v) }))
    .sort((a, b) => b.r - a.r);
  for (const { i } of order) {
    if (rest <= 0) break;
    floors[i] = (floors[i] ?? 0) + 1;
    rest--;
  }
  return floors.map((f) => f / 10);
}

export interface MonthStats {
  year: number;
  month0: number;
  days: number;
  counts: Record<DayCategory, number>;
  percents: Record<DayCategory, number>;
  registered: number;
  coverage: number; // 0-100
  rest: number;
  goalsCompleted: Goal[];
}

export function isRegistered(log: DayLog | undefined): boolean {
  return !!log && (log.isRest || log.activities.length > 0);
}

export function monthStats(
  logs: Record<string, DayLog>,
  goals: Goal[],
  year: number,
  month0: number,
): MonthStats {
  const days = daysInMonth(year, month0);
  const counts: Record<DayCategory, number> = {
    intenso: 0,
    intermedio: 0,
    ligero: 0,
    diverso: 0,
    descanso: 0,
    sin: 0,
  };
  for (let d = 1; d <= days; d++) {
    counts[dayCategory(logs[toKey(new Date(year, month0, d))])]++;
  }
  const rounded = roundTo100(CATEGORY_ORDER.map((c) => counts[c]));
  const percents = Object.fromEntries(CATEGORY_ORDER.map((c, i) => [c, rounded[i]])) as Record<
    DayCategory,
    number
  >;
  const registered = days - counts.sin;
  const goalsCompleted = goals
    .filter((g) => g.status === "finalizada" && g.completedAt)
    .filter((g) => {
      const d = new Date(g.completedAt!);
      return d.getFullYear() === year && d.getMonth() === month0;
    })
    .sort((a, b) => a.completedAt!.localeCompare(b.completedAt!));
  return {
    year,
    month0,
    days,
    counts,
    percents,
    registered,
    coverage: Math.round((registered / days) * 1000) / 10,
    rest: counts.descanso,
    goalsCompleted,
  };
}

/** Whether a goal can be moved into "En proceso". */
export function canActivate(goals: Goal[], goalId: string): boolean {
  const active = goals.filter((g) => g.status === "proceso" && g.id !== goalId).length;
  return active < MAX_IN_PROGRESS;
}

/** Apply a status change, keeping completion history. */
export function moveGoal(goal: Goal, to: GoalStatus, now = new Date()): Goal {
  const iso = now.toISOString();
  if (to === goal.status) return goal;
  if (to === "finalizada") {
    return {
      ...goal,
      status: to,
      progress: 100,
      completedAt: iso,
      history: [...goal.history, { completedAt: iso }],
    };
  }
  if (goal.status === "finalizada") {
    const history = goal.history.map((h, i) =>
      i === goal.history.length - 1 && !h.reopenedAt ? { ...h, reopenedAt: iso } : h,
    );
    return { ...goal, status: to, completedAt: null, history };
  }
  return { ...goal, status: to };
}

export function fmtPct(n: number): string {
  return `${n.toLocaleString("es-MX", { maximumFractionDigits: 1 })} %`;
}

export function uid(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}
