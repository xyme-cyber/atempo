import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Plus, ArrowUpRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CAT_STYLES, CatBadge, CatIcon, PageHeader } from "@/components/atempo/ui";
import { useAtempo } from "@/lib/store";
import { CATEGORY_LABEL, CATEGORY_ORDER, MONTHS, WEEKDAYS, cap, dayCategory, daysInMonth, fromKey, monthGrid, monthStats, nextMonth, prevMonth, toKey, totalMinutes } from "@/lib/energy";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/calendario")({
  head: () => ({
    meta: [
      { title: "Calendario — Atempo" },
      { name: "description", content: "Observa tus días según su energía y consulta los detalles de cada registro." },
      { property: "og:title", content: "Calendario — Atempo" },
      { property: "og:description", content: "Tu mes de un vistazo: intenso, intermedio, ligero, diverso, descanso o sin registro." },
    ],
  }),
  component: Calendario,
});

const DOW = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function Calendario() {
  const { logs, goals, demo, setDemo } = useAtempo();
  const today = new Date();
  const todayKey = toKey(today);
  const [ym, setYm] = useState({ year: today.getFullYear(), month0: today.getMonth() });
  const [selected, setSelected] = useState(todayKey);
  const grid = useMemo(() => monthGrid(ym.year, ym.month0), [ym]);
  const stats = monthStats(logs, goals, ym.year, ym.month0);
  const selLog = logs[selected];
  const selCat = dayCategory(selLog);
  const selDate = fromKey(selected);
  const years = Array.from({ length: 7 }, (_, i) => today.getFullYear() - 4 + i);
  const hasAny = Object.keys(logs).length > 0;

  return (
    <>
      <PageHeader
        eyebrow="Tu energía, a tu ritmo"
        title="Calendario"
        subtitle="Observa tus hábitos, reconoce tu energía y encuentra tu propio equilibrio."
        action={
          <div className="flex flex-wrap gap-2">
            {!hasAny && !demo && (
              <Button variant="outline" onClick={() => setDemo(true)}>
                <Eye /> Ver un ejemplo
              </Button>
            )}
            <Button asChild size="lg">
              <Link to="/registro" search={{ date: todayKey }}>
                <Plus /> Registrar día de hoy
              </Link>
            </Button>
          </div>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <section className="surface p-4 md:p-6" aria-label="Calendario mensual">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-baseline gap-3">
              <h2 className="text-2xl">
                {cap(MONTHS[ym.month0])} {ym.year}
              </h2>
              <span className="text-sm text-muted-foreground">{daysInMonth(ym.year, ym.month0)} días</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Button variant="ghost" size="icon" aria-label="Mes anterior" onClick={() => setYm(prevMonth(ym.year, ym.month0))}>
                <ChevronLeft />
              </Button>
              <Select value={String(ym.month0)} onValueChange={(v) => setYm({ ...ym, month0: Number(v) })}>
                <SelectTrigger className="h-9 w-32" aria-label="Mes"><SelectValue /></SelectTrigger>
                <SelectContent>{MONTHS.map((m, i) => <SelectItem key={m} value={String(i)}>{cap(m)}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={String(ym.year)} onValueChange={(v) => setYm({ ...ym, year: Number(v) })}>
                <SelectTrigger className="h-9 w-24" aria-label="Año"><SelectValue /></SelectTrigger>
                <SelectContent>{years.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => { setYm({ year: today.getFullYear(), month0: today.getMonth() }); setSelected(todayKey); }}>
                Hoy
              </Button>
              <Button variant="ghost" size="icon" aria-label="Mes siguiente" onClick={() => setYm(nextMonth(ym.year, ym.month0))}>
                <ChevronRight />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 md:gap-2" role="grid">
            {DOW.map((d) => (
              <div key={d} className="pb-1 text-center text-xs font-semibold uppercase text-muted-foreground">{d}</div>
            ))}
            {grid.map((d) => {
              const key = toKey(d);
              const inMonth = d.getMonth() === ym.month0;
              const cat = dayCategory(logs[key]);
              const isToday = key === todayKey;
              const isSel = key === selected;
              return (
                <button
                  key={key}
                  onClick={() => { setSelected(key); if (!inMonth) setYm({ year: d.getFullYear(), month0: d.getMonth() }); }}
                  aria-label={`${d.getDate()} de ${MONTHS[d.getMonth()]}: ${CATEGORY_LABEL[cat]}`}
                  aria-pressed={isSel}
                  className={cn(
                    "lift flex aspect-square flex-col justify-between rounded-lg border p-1.5 text-left md:aspect-auto md:min-h-20 md:p-2.5",
                    inMonth ? CAT_STYLES[cat].bg : "bg-transparent opacity-40",
                    inMonth && cat !== "sin" ? CAT_STYLES[cat].border : "border-border",
                    isSel && "ring-2 ring-foreground ring-offset-1 ring-offset-card",
                  )}
                >
                  <span className="flex items-center justify-between text-sm">
                    <span className={cn(isToday && "font-bold")}>{d.getDate()}</span>
                    {isToday && <span className="hidden text-[10px] font-bold uppercase md:inline">Hoy</span>}
                  </span>
                  {inMonth && (cat !== "sin" || logs[key]) && <CatIcon cat={cat} className="self-center md:self-end" />}
                </button>
              );
            })}
          </div>

          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm" aria-label="Categorías de energía">
            {CATEGORY_ORDER.map((c) => (
              <li key={c} className="flex items-center gap-1.5">
                <span className={cn("flex size-6 items-center justify-center rounded-full border", CAT_STYLES[c].bg, CAT_STYLES[c].border)}>
                  <CatIcon cat={c} className="size-3.5" />
                </span>
                {CATEGORY_LABEL[c]}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">Diverso combina varios niveles de energía. Un día sin registro no significa descanso.</p>
        </section>

        <aside className="space-y-6">
          <section className="surface p-6" aria-live="polite">
            <p className="eyebrow">
              {selected === todayKey ? "Hoy · " : ""}
              {WEEKDAYS[selDate.getDay()]}
            </p>
            <p className="mt-3 text-5xl font-medium">{selDate.getDate()}</p>
            <p className="text-sm text-muted-foreground">de {MONTHS[selDate.getMonth()]} de {selDate.getFullYear()}</p>
            <div className="mt-4"><CatBadge cat={selCat} /></div>
            {selLog && !selLog.isRest && selLog.activities.length > 0 ? (
              <>
                <ul className="mt-4 divide-y divide-border text-sm">
                  {selLog.activities.map((a) => (
                    <li key={a.id} className="flex items-center justify-between gap-2 py-2">
                      <span className="flex items-center gap-2"><CatIcon cat={a.energy} />{a.name}</span>
                      <span className="text-muted-foreground">{a.minutes} min</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-sm font-medium">{totalMinutes(selLog.activities)} minutos en total</p>
              </>
            ) : (
              <p className="mt-4 text-sm text-foreground/80">
                {selLog?.isRest ? "Elegiste descansar este día. También cuenta." : "Aún no hay actividades registradas."}
              </p>
            )}
            <p className="mt-3 text-sm italic text-muted-foreground">
              {selLog?.notes ? `“${selLog.notes}”` : "Sin notas para este día."}
            </p>
            <Button asChild variant="outline" className="mt-5 w-full">
              <Link to="/registro" search={{ date: selected }}>
                <ArrowUpRight /> {selLog ? "Ver detalle del día" : "Registrar este día"}
              </Link>
            </Button>
          </section>
          <section className="rounded-xl bg-secondary p-6">
            <p className="font-semibold">
              {stats.registered} {stats.registered === 1 ? "día registrado" : "días registrados"}
            </p>
            <p className="mt-2 text-sm text-foreground/80">
              {stats.registered === 0 ? "Comienza registrando tu primer día para ver tu progreso." : `Cubres el ${stats.coverage.toLocaleString("es-MX")} % de ${MONTHS[ym.month0]}.`}
            </p>
            <Link to="/analisis" className="mt-4 inline-flex items-center gap-1.5 font-semibold text-primary hover:underline">
              Explorar mi análisis <ArrowUpRight className="size-4" />
            </Link>
          </section>
        </aside>
      </div>
    </>
  );
}
