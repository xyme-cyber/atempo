import { toKey, daysInMonth, type DayLog, type Goal, type Energy } from "./energy";

const ACTS: { name: string; energy: Energy }[] = [
  { name: "Estudiar", energy: "intenso" },
  { name: "Entrenar", energy: "intenso" },
  { name: "Caminar", energy: "intermedio" },
  { name: "Cocinar", energy: "intermedio" },
  { name: "Leer", energy: "ligero" },
  { name: "Meditar", energy: "ligero" },
];

// Deterministic pseudo-random so example views are stable.
function rng(seed: number) {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

/** Example data for the current and previous month. Never persisted. */
export function buildDemo(today = new Date()): { logs: Record<string, DayLog>; goals: Goal[] } {
  const logs: Record<string, DayLog> = {};
  const r = rng(7);
  for (const back of [1, 0]) {
    const y = today.getFullYear();
    const m = today.getMonth() - back;
    const d0 = new Date(y, m, 1);
    const total = daysInMonth(d0.getFullYear(), d0.getMonth());
    for (let d = 1; d <= total; d++) {
      const date = new Date(d0.getFullYear(), d0.getMonth(), d);
      if (date > today) break;
      const roll = r();
      const key = toKey(date);
      if (roll < 0.17) continue; // sin registro
      if (roll < 0.28) {
        logs[key] = { date: key, isRest: true, notes: "", activities: [], updatedAt: date.toISOString() };
        continue;
      }
      const n = 1 + Math.floor(r() * 3);
      const picks = Array.from({ length: n }, (_, i) => {
        const a = ACTS[Math.floor(r() * ACTS.length)] ?? ACTS[0]!;
        return { id: `${key}-${i}`, name: a.name, energy: a.energy, minutes: 15 + Math.floor(r() * 6) * 10 };
      });
      logs[key] = {
        date: key,
        isRest: false,
        notes: d % 5 === 0 ? "Salir a caminar me ayudó a despejar la mente." : "",
        activities: picks,
        updatedAt: date.toISOString(),
      };
    }
  }
  const at = (day: number) => new Date(today.getFullYear(), today.getMonth(), Math.min(day, today.getDate()), 12).toISOString();
  const base = { history: [], createdAt: at(1), completedAt: null };
  const goals: Goal[] = [
    { ...base, id: "d1", name: "Correr 5 kilómetros", description: "Empezar con recorridos cortos, sin buscar una marca.", energy: "intenso", status: "idea", progress: 0 },
    { ...base, id: "d2", name: "Cocinar algo nuevo", description: "Reservar un momento a la semana para experimentar.", energy: "intermedio", status: "idea", progress: 0 },
    { ...base, id: "d3", name: "Caminar 12 días", description: "Salir al menos 30 minutos y cambiar de aire.", energy: "intermedio", status: "proceso", progress: 67 },
    { ...base, id: "d4", name: "Leer 15 días", description: "Un rato de lectura, aunque sean unas páginas.", energy: "ligero", status: "proceso", progress: 40 },
    { id: "d5", name: "Dormir sin pantallas", description: "Cinco noches con una pausa digital antes de dormir.", energy: "ligero", status: "finalizada", progress: 100, completedAt: at(10), history: [{ completedAt: at(10) }], createdAt: at(1) },
  ];
  return { logs, goals };
}
