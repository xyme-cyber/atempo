import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, Plus, Trash2, Pencil, Moon, Heart, CheckCircle2, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CAT_STYLES, CatBadge, CatIcon, Donut, EmptyState, PageHeader } from "@/components/atempo/ui";
import { useAtempo } from "@/lib/store";
import { CATEGORY_LABEL, CATEGORY_ORDER, ENERGIES, dayCategory, dayDistribution, formatLong, fromKey, toKey, totalMinutes, uid, type Activity, type DayLog, type Energy } from "@/lib/energy";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/registro")({
  validateSearch: (s: Record<string, unknown>): { date?: string } => ({
    date: typeof s.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s.date) ? s.date : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Registro diario — Atempo" },
      { name: "description", content: "Registra tus actividades, su energía y duración, o marca un día de descanso." },
      { property: "og:title", content: "Registro diario — Atempo" },
      { property: "og:description", content: "Tu día, en perspectiva: actividades, energía y notas." },
    ],
  }),
  component: Registro,
});

const SUGGESTED = ["Estudiar", "Trabajar", "Caminar", "Entrenar", "Leer", "Cocinar", "Meditar", "Limpiar", "Convivir", "Crear"];

function Registro() {
  const { date: qDate } = Route.useSearch();
  const navigate = useNavigate();
  const { logs, saveLog, deleteLog } = useAtempo();
  const date = qDate ?? toKey(new Date());
  const existing = logs[date];
  const [editing, setEditing] = useState(!existing);
  const [acts, setActs] = useState<Activity[]>([]);
  const [notes, setNotes] = useState("");
  const [isRest, setIsRest] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmDel, setConfirmDel] = useState(false);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setActs(existing?.activities.map((a) => ({ ...a })) ?? []);
    setNotes(existing?.notes ?? "");
    setIsRest(existing?.isRest ?? false);
    setErrors({});
  };
  useEffect(() => {
    reset();
    setEditing(!logs[date]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, existing?.updatedAt]);

  const draft: DayLog = { date, isRest, notes, activities: isRest ? [] : acts, updatedAt: existing?.updatedAt ?? "" };
  const draftCat = dayCategory(isRest || acts.length ? draft : undefined);
  const shown = editing ? draft : existing;

  const update = (id: string, patch: Partial<Activity>) => setActs((a) => a.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const add = () => setActs((a) => [...a, { id: uid(), name: "", energy: "intermedio", minutes: 30 }]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!isRest) {
      acts.forEach((a) => {
        if (!a.name.trim()) e[`${a.id}-name`] = "Escribe o elige una actividad.";
        if (!Number.isFinite(a.minutes) || a.minutes < 1 || a.minutes > 1440) e[`${a.id}-min`] = "Entre 1 y 1440 minutos.";
      });
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSave = async () => {
    if (!validate()) return;
    setSaving(true);
    const ok = await saveLog({ ...draft, notes: notes.trim(), activities: isRest ? [] : acts.map((a) => ({ ...a, name: a.name.trim() })), updatedAt: new Date().toISOString() });
    setSaving(false);
    if (ok) setEditing(false);
  };

  const onCancel = () => {
    if (existing) {
      reset();
      setEditing(false);
    } else navigate({ to: "/calendario" });
  };

  return (
    <>
      <PageHeader
        eyebrow="Escucha cómo te sientes"
        title="Tu día, en perspectiva."
        subtitle="Registra lo que hiciste y deja espacio para lo que necesitas."
        action={
          <Button asChild variant="outline">
            <Link to="/calendario"><ArrowLeft /> Volver al calendario</Link>
          </Button>
        }
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="surface p-5 md:p-7">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl">Registrar mi día</h2>
            <span className="text-xs font-semibold uppercase text-muted-foreground">{existing ? (editing ? "Edición" : "Guardado") : "Nuevo"}</span>
          </div>

          <div className="mt-6 space-y-2">
            <Label>Fecha</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-11 w-full justify-between font-normal">
                  {formatLong(date)} <CalendarIcon className="text-primary" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  locale={es}
                  weekStartsOn={1}
                  selected={fromKey(date)}
                  onSelect={(d) => d && navigate({ to: "/registro", search: { date: toKey(d) } })}
                  className="pointer-events-auto p-3"
                />
              </PopoverContent>
            </Popover>
          </div>

          <fieldset disabled={!editing} className="mt-6 space-y-6 disabled:opacity-70">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <Label className="text-base">¿Qué actividades hiciste?</Label>
                <span className="text-sm text-muted-foreground">{isRest ? 0 : acts.length} {acts.length === 1 ? "actividad" : "actividades"}</span>
              </div>
              {isRest ? (
                <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">Marcaste este día como descanso, así que no se registran actividades.</p>
              ) : (
                <ul className="space-y-3">
                  {acts.map((a) => (
                    <li key={a.id} className="rounded-lg border border-border bg-background/50 p-3">
                      <div className="grid gap-2 sm:grid-cols-[1fr_9rem_6.5rem_auto]">
                        <div>
                          <Input aria-label="Actividad" list="atempo-acts" placeholder="Actividad" value={a.name} maxLength={40} onChange={(e) => update(a.id, { name: e.target.value })} aria-invalid={!!errors[`${a.id}-name`]} />
                          {errors[`${a.id}-name`] && <p className="mt-1 text-xs text-destructive">{errors[`${a.id}-name`]}</p>}
                        </div>
                        <Select value={a.energy} onValueChange={(v) => update(a.id, { energy: v as Energy })}>
                          <SelectTrigger aria-label="Categoría energética" className={cn(CAT_STYLES[a.energy].bg)}><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {ENERGIES.map((e) => (
                              <SelectItem key={e} value={e}><span className="flex items-center gap-2"><CatIcon cat={e} />{CATEGORY_LABEL[e]}</span></SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div>
                          <div className="relative">
                            <Input aria-label="Duración en minutos" type="number" min={1} max={1440} value={Number.isFinite(a.minutes) ? a.minutes : ""} onChange={(e) => update(a.id, { minutes: e.target.valueAsNumber })} className="pr-10" aria-invalid={!!errors[`${a.id}-min`]} />
                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">min</span>
                          </div>
                          {errors[`${a.id}-min`] && <p className="mt-1 text-xs text-destructive">{errors[`${a.id}-min`]}</p>}
                        </div>
                        <Button variant="ghost" size="icon" aria-label={`Eliminar ${a.name || "actividad"}`} onClick={() => setActs((x) => x.filter((y) => y.id !== a.id))}>
                          <Trash2 className="text-terracotta" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <datalist id="atempo-acts">{SUGGESTED.map((s) => <option key={s} value={s} />)}</datalist>
              {!isRest && (
                <Button variant="ghost" className="mt-2 px-1" onClick={add}><Plus /> Agregar actividad</Button>
              )}
            </div>

            <div>
              <Label className="text-base">Categoría energética del día</Label>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3" aria-live="polite">
                {CATEGORY_ORDER.map((c) => (
                  <div key={c} className={cn("flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors", CAT_STYLES[c].bg, draftCat === c ? "border-2 border-foreground font-semibold" : "border-transparent opacity-70")}>
                    <span className="flex items-center gap-2"><CatIcon cat={c} />{CATEGORY_LABEL[c]}</span>
                    {draftCat === c && <Check className="size-4" />}
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Se calcula automáticamente con la energía predominante de tus actividades. Si hay empate, el día es Diverso.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notas" className="text-base">Notas del día <span className="font-normal text-muted-foreground">(opcional)</span></Label>
              <Textarea id="notas" rows={3} maxLength={500} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="¿Algo que quieras recordar de hoy?" />
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-4">
              <Checkbox checked={isRest} onCheckedChange={(v) => setIsRest(v === true)} />
              <span className="flex-1">
                <span className="block font-semibold">Marcar descanso</span>
                <span className="text-sm text-muted-foreground">Guarda el día como descanso, sin actividades.</span>
              </span>
              <Moon className="size-5 text-muted-foreground" />
            </label>
          </fieldset>

          {editing ? (
            <div className="mt-6 flex gap-3">
              <Button size="lg" className="flex-1" onClick={onSave} disabled={saving}><Check /> {saving ? "Guardando…" : "Guardar registro"}</Button>
              <Button size="lg" variant="outline" onClick={onCancel}>Cancelar</Button>
            </div>
          ) : (
            <Button size="lg" variant="outline" className="mt-6 w-full" onClick={() => setEditing(true)}><Pencil /> Editar registro</Button>
          )}
          {editing && !isRest && acts.length === 0 && (
            <p className="mt-3 text-xs text-muted-foreground">Sin actividades ni descanso, el día queda como “Sin registro”.</p>
          )}
        </section>

        <div className="space-y-6">
          <DayDetail log={shown} date={date} onEdit={() => setEditing(true)} onDelete={() => setConfirmDel(true)} canDelete={!!existing} isDraft={editing} />
          <p className="flex gap-3 rounded-xl bg-secondary p-5 text-foreground/90">
            <Heart className="mt-0.5 size-5 shrink-0 text-primary" />
            Tu energía cambia cada día. Este registro es una forma de escucharte, no de evaluarte.
          </p>
        </div>
      </div>

      <AlertDialog open={confirmDel} onOpenChange={setConfirmDel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar el registro de este día?</AlertDialogTitle>
            <AlertDialogDescription>Se borrarán sus actividades y notas. El día volverá a quedar sin registro.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => void deleteLog(date)}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function DayDetail({ log, date, onEdit, onDelete, canDelete, isDraft }: { log?: DayLog; date: string; onEdit: () => void; onDelete: () => void; canDelete: boolean; isDraft: boolean }) {
  const acts = log?.isRest ? [] : (log?.activities ?? []);
  const cat = dayCategory(log && (log.isRest || acts.length) ? log : undefined);
  const dist = useMemo(() => dayDistribution(acts), [acts]);
  const total = totalMinutes(acts);
  const d = fromKey(date);
  return (
    <section className="surface p-5 md:p-7">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-2xl">Detalle del día</h2>
        {log?.updatedAt && !isDraft && (
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground"><CheckCircle2 className="size-4 text-primary" /> Guardado · {format(new Date(log.updatedAt), "d MMM, HH:mm", { locale: es })}</span>
        )}
        {isDraft && <span className="text-sm text-muted-foreground">Vista previa</span>}
      </div>
      <p className="mt-4 font-medium">{formatLong(date).replace(` de ${d.getFullYear()}`, "")}</p>
      <p className="text-sm text-muted-foreground">
        {d.getFullYear()} · {acts.length} {acts.length === 1 ? "actividad" : "actividades"} · {total} minutos en total
      </p>

      {acts.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title={log?.isRest ? "Un día para descansar" : "Aún no hay actividades"}
            text={log?.isRest ? "Descansar también es parte de avanzar." : "Agrega tu primera actividad para ver aquí su energía y duración."}
            action={<CatBadge cat={cat} />}
          />
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row">
            <Donut key={acts.map((a) => a.energy).join()} label="Distribución por categoría" size={180} stroke={22} segments={ENERGIES.map((e) => ({ key: e, value: dist[e], color: CAT_STYLES[e].solid }))}>
              <span className="text-3xl font-medium">{total}</span>
              <span className="text-xs text-muted-foreground">minutos</span>
            </Donut>
            <div className="space-y-3">
              <CatBadge cat={cat} />
              <ul className="space-y-1 text-sm">
                {ENERGIES.map((e) => (
                  <li key={e} className="flex items-center gap-2"><CatIcon cat={e} />{CATEGORY_LABEL[e]}: <strong>{Math.round(dist[e] * 10) / 10} %</strong></li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground">Porcentaje según el número de actividades de cada categoría.</p>
            </div>
          </div>
          <ul className="mt-6 divide-y divide-border">
            {acts.map((a) => (
              <li key={a.id} className="flex items-center gap-3 py-3">
                <span className={cn("flex size-9 items-center justify-center rounded-lg", CAT_STYLES[a.energy].bg)}><CatIcon cat={a.energy} /></span>
                <span className="flex-1">
                  <span className="block">{a.name || "Sin nombre"}</span>
                  <span className="text-sm text-muted-foreground">{CATEGORY_LABEL[a.energy]}</span>
                </span>
                <span className="text-sm">{Number.isFinite(a.minutes) ? a.minutes : 0} min</span>
              </li>
            ))}
          </ul>
        </>
      )}
      {log?.notes && (
        <div className="mt-4 rounded-lg bg-background/60 p-4">
          <p className="eyebrow">Mi nota</p>
          <p className="mt-2 text-sm italic">“{log.notes}”</p>
        </div>
      )}
      {!isDraft && canDelete && (
        <div className="mt-6 grid grid-cols-[1fr_auto] gap-3">
          <Button variant="outline" onClick={onEdit}><Pencil /> Editar</Button>
          <Button variant="outline" onClick={onDelete}><Trash2 className="text-terracotta" /> Eliminar</Button>
        </div>
      )}
    </section>
  );
}
