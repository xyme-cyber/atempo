import { describe, expect, it } from "vitest";
import {
  canActivate,
  dayCategory,
  dayDistribution,
  daysInMonth,
  monthStats,
  moveGoal,
  type Activity,
  type DayLog,
  type Goal,
} from "@/lib/energy";

const act = (energy: Activity["energy"], minutes = 30): Activity => ({
  id: Math.random().toString(),
  name: "x",
  energy,
  minutes,
});
const log = (date: string, activities: Activity[], isRest = false): DayLog => ({
  date,
  activities,
  isRest,
  notes: "",
  updatedAt: "",
});
const goal = (id: string, status: Goal["status"]): Goal => ({
  id,
  name: id,
  description: "",
  energy: "ligero",
  status,
  progress: 0,
  completedAt: null,
  history: [],
  createdAt: "",
});

describe("dayCategory", () => {
  it("predominant category wins", () => {
    expect(dayCategory(log("2026-09-01", [act("intenso"), act("intenso"), act("ligero")]))).toBe(
      "intenso",
    );
  });
  it("a tie is Diverso", () => {
    expect(dayCategory(log("2026-09-01", [act("intenso"), act("ligero")]))).toBe("diverso");
  });
  it("explicit rest is Descanso", () => {
    expect(dayCategory(log("2026-09-01", [], true))).toBe("descanso");
  });
  it("no log is Sin registro, not Descanso", () => {
    expect(dayCategory(undefined)).toBe("sin");
  });
});

describe("percentages", () => {
  it("daily distribution is by activity count, not minutes", () => {
    const d = dayDistribution([act("intenso", 100), act("ligero", 5)]);
    expect(d.intenso).toBe(50);
    expect(d.ligero).toBe(50);
  });
  it("monthly percentages sum to 100 over all days, including sin registro", () => {
    const logs = {
      "2026-09-01": log("2026-09-01", [act("intenso")]),
      "2026-09-02": log("2026-09-02", [], true),
      "2026-09-03": log("2026-09-03", [act("ligero")]),
    };
    const s = monthStats(logs, [], 2026, 8);
    expect(s.days).toBe(30);
    expect(s.counts.sin).toBe(27);
    expect(s.registered).toBe(3);
    expect(s.rest).toBe(1);
    expect(Object.values(s.percents).reduce((a, b) => a + b, 0)).toBeCloseTo(100, 5);
  });
  it("handles leap years", () => {
    expect(daysInMonth(2028, 1)).toBe(29);
    expect(daysInMonth(2026, 1)).toBe(28);
  });
});

describe("goals", () => {
  it("max three in progress", () => {
    const gs = [goal("a", "proceso"), goal("b", "proceso"), goal("c", "proceso"), goal("d", "idea")];
    expect(canActivate(gs, "d")).toBe(false);
    expect(canActivate(gs.slice(1), "d")).toBe(true);
  });
  it("reopening keeps completion history", () => {
    const done = moveGoal(goal("a", "proceso"), "finalizada", new Date("2026-09-24T10:00:00Z"));
    const back = moveGoal(done, "proceso", new Date("2026-09-25T10:00:00Z"));
    expect(back.status).toBe("proceso");
    expect(back.history).toHaveLength(1);
    expect(back.history[0].completedAt).toBe("2026-09-24T10:00:00.000Z");
  });
});
