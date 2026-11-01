import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { buildDemo } from "./demo";
import { canActivate, moveGoal as applyMove, type DayLog, type Goal, type GoalStatus, MAX_IN_PROGRESS } from "./energy";

const GUEST_KEY = "atempo:guest";
const VISITED_KEY = "atempo:visited";
export const RETURN_KEY = "atempo:return";

interface GuestData {
  logs: Record<string, DayLog>;
  goals: Goal[];
}

interface Ctx {
  ready: boolean;
  user: User | null;
  logs: Record<string, DayLog>;
  goals: Goal[];
  demo: boolean;
  setDemo: (v: boolean) => void;
  saveLog: (log: DayLog) => Promise<boolean>;
  deleteLog: (date: string) => Promise<boolean>;
  saveGoal: (goal: Goal) => Promise<boolean>;
  deleteGoal: (id: string) => Promise<boolean>;
  moveGoal: (id: string, to: GoalStatus) => Promise<boolean>;
  authPrompt: boolean;
  closeAuthPrompt: () => void;
  signOut: () => Promise<void>;
  reload: () => Promise<void>;
}

const AtempoContext = createContext<Ctx | null>(null);

function readGuest(): GuestData {
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return { logs: {}, goals: [] };
}
function writeGuest(d: GuestData) {
  localStorage.setItem(GUEST_KEY, JSON.stringify(d));
}
function hasGuestData(d: GuestData) {
  return Object.keys(d.logs).length > 0 || d.goals.length > 0;
}

type LogRow = { log_date: string; is_rest: boolean; notes: string; activities: unknown; updated_at: string };
type GoalRow = {
  id: string;
  name: string;
  description: string;
  energy: string;
  status: string;
  progress: number;
  completed_at: string | null;
  history: unknown;
  created_at: string;
};

const rowToLog = (r: LogRow): DayLog => ({
  date: r.log_date,
  isRest: r.is_rest,
  notes: r.notes,
  activities: (r.activities as DayLog["activities"]) ?? [],
  updatedAt: r.updated_at,
});
const rowToGoal = (r: GoalRow): Goal => ({
  id: r.id,
  name: r.name,
  description: r.description,
  energy: r.energy as Goal["energy"],
  status: r.status as GoalStatus,
  progress: r.progress,
  completedAt: r.completed_at,
  history: (r.history as Goal["history"]) ?? [],
  createdAt: r.created_at,
});
const logToRow = (l: DayLog, userId: string) => ({
  user_id: userId,
  log_date: l.date,
  is_rest: l.isRest,
  notes: l.notes,
  activities: l.activities as never,
  updated_at: l.updatedAt,
});
const goalToRow = (g: Goal, userId: string) => ({
  id: g.id,
  user_id: userId,
  name: g.name,
  description: g.description,
  energy: g.energy,
  status: g.status,
  progress: g.progress,
  completed_at: g.completedAt,
  history: g.history as never,
  created_at: g.createdAt,
});

export function AtempoProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [logs, setLogs] = useState<Record<string, DayLog>>({});
  const [goals, setGoals] = useState<Goal[]>([]);
  const [demo, setDemo] = useState(false);
  const [authPrompt, setAuthPrompt] = useState(false);
  const promptedRef = useRef(false);
  const userRef = useRef<User | null>(null);
  const demoData = useMemo(() => buildDemo(), []);

  const loadRemote = useCallback(async () => {
    const [l, g] = await Promise.all([
      supabase.from("day_logs").select("*"),
      supabase.from("goals").select("*").order("created_at"),
    ]);
    if (l.error || g.error) {
      toast.error("No pudimos cargar tus datos. Intenta de nuevo.");
      return;
    }
    setLogs(Object.fromEntries((l.data as LogRow[]).map((r) => [r.log_date, rowToLog(r)])));
    setGoals((g.data as GoalRow[]).map(rowToGoal));
  }, []);

  const migrateGuest = useCallback(async (u: User) => {
    const guest = readGuest();
    if (!hasGuestData(guest)) return;
    const logRows = Object.values(guest.logs).map((l) => logToRow(l, u.id));
    if (logRows.length) {
      const { error } = await supabase.from("day_logs").upsert(logRows, { onConflict: "user_id,log_date" });
      if (error) {
        toast.error("No pudimos guardar tus registros temporales. Siguen en este navegador.");
        return;
      }
    }
    // Respect the 3-in-progress limit across existing + migrated goals.
    const { count } = await supabase.from("goals").select("id", { count: "exact", head: true }).eq("status", "proceso");
    let slots = MAX_IN_PROGRESS - (count ?? 0);
    const goalRows = guest.goals.map((g) => {
      if (g.status === "proceso") {
        if (slots > 0) slots--;
        else return goalToRow({ ...g, status: "idea" }, u.id);
      }
      return goalToRow(g, u.id);
    });
    if (goalRows.length) {
      const { error } = await supabase.from("goals").upsert(goalRows);
      if (error) {
        toast.error("No pudimos guardar tus metas temporales. Siguen en este navegador.");
        return;
      }
    }
    localStorage.removeItem(GUEST_KEY);
    toast.success("Guardamos en tu cuenta lo que habías registrado.");
  }, []);

  const applyUser = useCallback(
    async (u: User | null) => {
      userRef.current = u;
      setUser(u);
      if (u) {
        localStorage.setItem(VISITED_KEY, "1");
        await migrateGuest(u);
        await loadRemote();
      } else {
        const g = readGuest();
        setLogs(g.logs);
        setGoals(g.goals);
      }
      setReady(true);
    },
    [loadRemote, migrateGuest],
  );

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "INITIAL_SESSION") {
        const next = session?.user ?? null;
        if (event === "SIGNED_IN" && userRef.current?.id === next?.id) return;
        setTimeout(() => void applyUser(next), 0);
      }
      if (event === "USER_UPDATED" && session?.user) setUser(session.user);
    });
    return () => sub.subscription.unsubscribe();
  }, [applyUser]);

  const guard = () => {
    if (demo) {
      toast("Estás viendo un ejemplo", { description: "Sal de la vista de ejemplo para registrar tus propios datos." });
      return false;
    }
    return true;
  };

  const afterGuestSave = () => {
    if (!promptedRef.current) {
      promptedRef.current = true;
      setAuthPrompt(true);
    }
  };

  const saveLog: Ctx["saveLog"] = async (log) => {
    if (!guard()) return false;
    const clean: DayLog = log.isRest ? { ...log, activities: [] } : log;
    const isEmpty = !clean.isRest && clean.activities.length === 0;
    const u = userRef.current;
    if (u) {
      const res = isEmpty
        ? await supabase.from("day_logs").delete().eq("log_date", clean.date)
        : await supabase.from("day_logs").upsert(logToRow(clean, u.id), { onConflict: "user_id,log_date" });
      if (res.error) {
        toast.error("No pudimos guardar el registro.");
        return false;
      }
    }
    setLogs((prev) => {
      const next = { ...prev };
      if (isEmpty) delete next[clean.date];
      else next[clean.date] = clean;
      if (!u) writeGuest({ logs: next, goals });
      return next;
    });
    toast.success(u ? "Registro guardado" : "Registro guardado en este navegador");
    if (!u) afterGuestSave();
    return true;
  };

  const deleteLog: Ctx["deleteLog"] = async (date) => {
    if (!guard()) return false;
    const u = userRef.current;
    if (u) {
      const { error } = await supabase.from("day_logs").delete().eq("log_date", date);
      if (error) {
        toast.error("No pudimos eliminar el registro.");
        return false;
      }
    }
    setLogs((prev) => {
      const next = { ...prev };
      delete next[date];
      if (!u) writeGuest({ logs: next, goals });
      return next;
    });
    toast.success("Registro eliminado");
    return true;
  };

  const persistGoals = async (next: Goal[], changed: Goal | null, removedId?: string) => {
    const u = userRef.current;
    if (u) {
      const res = removedId
        ? await supabase.from("goals").delete().eq("id", removedId)
        : await supabase.from("goals").upsert(goalToRow(changed!, u.id));
      if (res.error) {
        toast.error(res.error.message.includes("Máximo") ? "Ya tienes tres metas en proceso." : "No pudimos guardar la meta.");
        return false;
      }
    } else {
      writeGuest({ logs, goals: next });
    }
    setGoals(next);
    if (!u && !removedId) afterGuestSave();
    return true;
  };

  const saveGoal: Ctx["saveGoal"] = async (goal) => {
    if (!guard()) return false;
    if (goal.status === "proceso" && !canActivate(goals, goal.id)) {
      toast.error("Ya tienes tres metas en proceso.");
      return false;
    }
    const exists = goals.some((g) => g.id === goal.id);
    const next = exists ? goals.map((g) => (g.id === goal.id ? goal : g)) : [...goals, goal];
    const ok = await persistGoals(next, goal);
    if (ok) toast.success(exists ? "Meta actualizada" : "Meta creada en Ideas");
    return ok;
  };

  const deleteGoal: Ctx["deleteGoal"] = async (id) => {
    if (!guard()) return false;
    const ok = await persistGoals(goals.filter((g) => g.id !== id), null, id);
    if (ok) toast.success("Meta eliminada");
    return ok;
  };

  const moveGoal: Ctx["moveGoal"] = async (id, to) => {
    if (!guard()) return false;
    const g = goals.find((x) => x.id === id);
    if (!g) return false;
    if (to === "proceso" && !canActivate(goals, id)) {
      toast.error("Ya tienes tres metas en proceso. Finaliza o devuelve una antes de activar otra.");
      return false;
    }
    const moved = applyMove(g, to);
    const ok = await persistGoals(goals.map((x) => (x.id === id ? moved : x)), moved);
    if (ok) toast.success(to === "finalizada" ? "¡Meta finalizada!" : to === "proceso" ? "Meta en proceso" : "Meta devuelta a Ideas");
    return ok;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Sesión cerrada");
  };

  const value: Ctx = {
    ready,
    user,
    logs: demo ? demoData.logs : logs,
    goals: demo ? demoData.goals : goals,
    demo,
    setDemo,
    saveLog,
    deleteLog,
    saveGoal,
    deleteGoal,
    moveGoal,
    authPrompt,
    closeAuthPrompt: () => setAuthPrompt(false),
    signOut,
    reload: loadRemote,
  };

  return <AtempoContext.Provider value={value}>{children}</AtempoContext.Provider>;
}

export function useAtempo() {
  const c = useContext(AtempoContext);
  if (!c) throw new Error("useAtempo must be used inside AtempoProvider");
  return c;
}

export function hasVisited() {
  return typeof window !== "undefined" && localStorage.getItem(VISITED_KEY) === "1";
}

export function displayName(user: User | null): string {
  if (!user) return "Invitado";
  const m = user.user_metadata as Record<string, string | undefined>;
  return m.full_name || m.name || user.email?.split("@")[0] || "Tú";
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}
