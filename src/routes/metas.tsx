import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Pencil, Trash2, Play, Check, Undo2, Eye, Lightbulb, Loader, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CAT_STYLES, CatIcon, EmptyState, PageHeader } from "@/components/atempo/ui";
import { useAtempo } from "@/lib/store";
import { CATEGORY_LABEL, ENERGIES, GOAL_NAME_MAX, MAX_IN_PROGRESS, canActivate, uid, type Energy, type Goal, type GoalStatus } from "@/lib/energy";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/metas")({
  head: () => ({
    meta: [
      { title: "Metas — Atempo" },
      { name: "description", content: "Organiza tus metas: de una idea a un hábito, con un máximo de tres en proceso." },
      { property: "og:title", content: "Metas — Atempo" },
      { property: "og:description", content: "Pocas metas a la vez, bien cuidadas. Ideas, en proceso y finalizadas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Metas,
});

const STATUS_LABEL: Record<GoalStatus, string> = { idea: "Ideas", proceso: "En proceso", finalizada: "Finalizadas" };
const STATUS_ICON: Record<GoalStatus, typeof Lightbulb> = { idea: Lightbulb, proceso: Loader, finalizada: Trophy };

function Metas() {
  const { goals, saveGoal, deleteGoal, moveGoal, demo, setDemo } = useAtempo();
  const [editing, setEditing] = useState<Goal | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Goal | null>(null);

  const byStatus = (s: GoalStatus) => goals.filter((g) => g.status === s);
  const inProgress = byStatus("proceso").length;

  return (
    <>
      <PageHeader
        eyebrow="Pocas cosas, bien cuidadas"
        title="Metas"
        subtitle={`De una idea a un hábito. Puedes tener hasta ${MAX_IN_PROGRESS} metas en proceso a la vez.`}
        action={
          <div className="flex flex-wrap gap-2">
            {goals.length === 0 && !demo && (
              <Button variant="outline" onClick={() => setDemo(true)}>
                <Eye /> Ver un ejemplo
              </Button>
            )}
            <Button size="lg" onClick={() => setCreating(true)}>
              <Plus /> Nueva meta
            </Button>
          </div>
        }
      />

      {goals.length === 0 ? (
        <EmptyState
          icon={<Lightbulb className="size-8 text-primary" />}
          title="Aún no tienes metas"
          text="Empieza con una idea sencilla. No hace falta un plan perfecto: solo un primer paso."
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus /> Crear mi primera meta
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {(["idea", "proceso", "finalizada"] as const).map((status) => {
            const Icon = STATUS_ICON[status];
            const list = byStatus(status);
            return (
              <section key={status} className="surface p-5" aria-label={STATUS_LABEL[status]}>
                <header className="mb-4 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-xl">
                    <Icon className="size-5 text-primary" /> {STATUS_LABEL[status]}
                  </h2>
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-sm font-semibold">
                    {list.length}
                    {status === "proceso" ? ` / ${MAX_IN_PROGRESS}` : ""}
                  </span>
                </header>
                {list.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                    {status === "idea" && "Aquí nacen las metas. Crea una para empezar."}
                    {status === "proceso" && "Activa una idea para ponerla en marcha."}
                    {status === "finalizada" && "Lo que completes aparecerá aquí."}
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {list.map((g) => (
                      <GoalCard
                        key={g.id}
                        goal={g}
                        canActivate={canActivate(goals, g.id)}
                        onEdit={() => setEditing(g)}
                        onDelete={() => setDeleting(g)}
                        onMove={(to) => void moveGoal(g.id, to)}
                      />
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}

      <GoalForm
        open={creating || !!editing}
        goal={editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        onSave={async (g) => {
          const ok = await saveGoal(g);
          if (ok) {
            setCreating(false);
            setEditing(null);
          }
        }}
      />

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar “{deleting?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>Se borrará la meta y su historial. Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleting) void deleteGoal(deleting.id);
                setDeleting(null);
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <span className="sr-only" aria-live="polite">
        {inProgress} de {MAX_IN_PROGRESS} metas en proceso
      </span>
    </>
  );
}

function GoalCard({ goal, canActivate: canGo, onEdit, onDelete, onMove }: { goal: Goal; canActivate: boolean; onEdit: () => void; onDelete: () => void; onMove: (to: GoalStatus) => void }) {
  return (
    <li className="lift rounded-lg border border-border bg-background/50 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold leading-snug">{goal.name}</p>
          {goal.description && <p className="mt-1 text-sm text-muted-foreground">{goal.description}</p>}
        </div>
        <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", CAT_STYLES[goal.energy].bg)}>
          <CatIcon cat={goal.energy} />
        </span>
      </div>

      {goal.status === "proceso" && (
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span>Progreso</span>
            <span>{goal.progress} %</span>
          </div>
          <Progress value={goal.progress} className="h-2" />
        </div>
      )}
      {goal.status === "finalizada" && goal.completedAt && (
        <p className="mt-2 text-xs text-muted-foreground">
          Finalizada el {new Date(goal.completedAt).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {goal.status === "idea" && (
          <Button size="sm" variant="outline" disabled={!canGo} title={canGo ? undefined : `Ya tienes ${MAX_IN_PROGRESS} metas en proceso`} onClick={() => onMove("proceso")}>
            <Play /> Activar
          </Button>
        )}
        {goal.status === "proceso" && (
          <>
            <Button size="sm" onClick={() => onMove("finalizada")}>
              <Check /> Finalizar
            </Button>
            <Button size="sm" variant="outline" onClick={() => onMove("idea")}>
              <Undo2 /> Devolver
            </Button>
          </>
        )}
        {goal.status === "finalizada" && (
          <Button size="sm" variant="outline" onClick={() => onMove("proceso")}>
            <Undo2 /> Reabrir
          </Button>
        )}
        <Button size="sm" variant="ghost" aria-label={`Editar ${goal.name}`} onClick={onEdit}>
          <Pencil />
        </Button>
        <Button size="sm" variant="ghost" aria-label={`Eliminar ${goal.name}`} onClick={onDelete}>
          <Trash2 className="text-terracotta" />
        </Button>
      </div>
    </li>
  );
}

function GoalForm({ open, goal, onClose, onSave }: { open: boolean; goal: Goal | null; onClose: () => void; onSave: (g: Goal) => Promise<void> }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [energy, setEnergy] = useState<Energy>("intermedio");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);

  // Initialize the form when a different goal (or "new") opens.
  const key = open ? (goal?.id ?? "new") : null;
  if (key !== loadedFor) {
    setLoadedFor(key);
    setName(goal?.name ?? "");
    setDescription(goal?.description ?? "");
    setEnergy(goal?.energy ?? "intermedio");
    setError("");
  }

  const submit = async () => {
    if (!name.trim()) {
      setError("Dale un nombre a tu meta.");
      return;
    }
    setSaving(true);
    const now = new Date().toISOString();
    await onSave(
      goal
        ? { ...goal, name: name.trim(), description: description.trim(), energy }
        : { id: uid(), name: name.trim(), description: description.trim(), energy, status: "idea", progress: 0, completedAt: null, history: [], createdAt: now },
    );
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg bg-card p-8">
        <DialogTitle className="font-display text-3xl font-bold">{goal ? "Editar meta" : "Nueva meta"}</DialogTitle>
        <DialogDescription>Las metas nuevas nacen como ideas. Actívalas cuando quieras ponerlas en marcha.</DialogDescription>
        <div className="mt-4 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="goal-name">Nombre</Label>
            <Input id="goal-name" value={name} maxLength={GOAL_NAME_MAX} onChange={(e) => setName(e.target.value)} placeholder="Ej. Caminar 12 días" aria-invalid={!!error} />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="goal-desc">
              Descripción <span className="font-normal text-muted-foreground">(opcional)</span>
            </Label>
            <Textarea id="goal-desc" rows={3} maxLength={300} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="¿Qué significa lograrla?" />
          </div>
          <div className="space-y-2">
            <Label>Energía que pide</Label>
            <Select value={energy} onValueChange={(v) => setEnergy(v as Energy)}>
              <SelectTrigger className={cn(CAT_STYLES[energy].bg)}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENERGIES.map((e) => (
                  <SelectItem key={e} value={e}>
                    <span className="flex items-center gap-2">
                      <CatIcon cat={e} />
                      {CATEGORY_LABEL[e]}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-3">
            <Button className="flex-1" onClick={() => void submit()} disabled={saving}>
              {saving ? "Guardando…" : goal ? "Guardar cambios" : "Crear meta"}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
