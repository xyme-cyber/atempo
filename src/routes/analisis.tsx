import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Plus, Trophy, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CAT_STYLES, CatIcon, CountUp, Donut, EmptyState, PageHeader } from "@/components/atempo/ui";
import { useAtempo } from "@/lib/store";
import { CATEGORY_LABEL, CATEGORY_ORDER, MONTHS, cap, fmtPct, monthStats, nextMonth, prevMonth, toKey, totalMinutes } from "@/lib/energy";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/analisis")({
  head: () => ({
    meta: [
      { title: "Análisis — Atempo" },
      { name: "description", content: "Compara tus meses: distribución de energía, cobertura de registros y metas logradas." },
      { property: "og:title", content: "Análisis — Atempo" },
      { property: "og:description", content: "Tu mes en perspectiva: energía, descanso y progreso." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Analisis,
});

function Analisis() {
  const { logs, goals, demo, setDemo } = useAtempo();
  const today = new Date();
  const [ym, setYm] = useState({ year: today.getFullYear(), month0: today.getMonth() });
  const stats = useMemo(() => monthStats(logs, goals, ym.year, ym.month0), [logs, goals, ym]);
  const prev = prevMonth(ym.year, ym.month0);
  const prevStats = useMemo(() => monthStats(logs, goals, prev.year, prev.month0), [logs, goals, prev.year, prev.month0]);
  const isCurrent = ym.year === today.getFullYear() && ym.month0 === today.getMonth();
  const hasAny = Object.keys(logs).length > 0;

  const minutes = useMemo(
    () =>
      Object.values(logs)
        .filter((l) => {
          const d = new Date(`${l.date}T12:00:00`);
          return d.getFullYear() === ym.year && d.getMonth() === ym.month0;
        })
        .reduce((s, l) => s + totalMinutes(l.activities), 0),
    [logs, ym],
  );

  return (
    <>
      <PageHeader
        eyebrow="Conocerte es avanzar"
        title="Análisis"
        subtitle="Tu mes en perspectiva: energía, descanso y progreso."
        action={
          <div className="flex flex-wrap items-center gap-2">
            {!hasAny && !demo && (
              <Button variant="outline" onClick={() => setDemo(true)}>
                <Eye /> Ver un ejemplo
              </Button>
            )}
            <Button variant="ghost" size="icon" aria-label="Mes anterior" onClick={() => setYm(prevMonth(ym.year, ym.month0))}>
              <ChevronLeft />
            </Button>
            <span className="min-w-36 text-center font-semibold">
              {cap(MONTHS[ym.month0] ?? "")} {ym.year}
            </span>
            <Button variant="ghost" size="icon" aria-label="Mes siguiente" disabled={isCurrent} onClick={() => setYm(nextMonth(ym.year, ym.month0))}>
              <ChevronRight />
            </Button>
          </div>
        }
      />

      {stats.registered === 0 ? (
        <EmptyState
          title="Este mes aún no tiene registros"
          text="Registra algunos días para ver cómo se mueve tu energía."
          action={
            <Button asChild>
              <Link to="/registro" search={{ date: toKey(today) }}>
                <Plus /> Registrar mi día
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
            <section className="surface flex flex-col items-center gap-6 p-6 sm:flex-row md:p-8" aria-label="Distribución del mes">
              <Donut
                label="Distribución de días por categoría"
                size={220}
                stroke={26}
                segments={CATEGORY_ORDER.map((c) => ({ key: c, value: stats.counts[c], color: CAT_STYLES[c].solid }))}
              >
                <span className="text-4xl font-medium">
                  <CountUp value={stats.coverage} decimals={1} />
                  <span className="text-xl">%</span>
                </span>
                <span className="text-xs text-muted-foreground">del mes registrado</span>
              </Donut>
              <ul className="w-full max-w-xs space-y-2 text-sm">
                {CATEGORY_ORDER.map((c) => (
                  <li key={c} className="flex items-center gap-2">
                    <span className={cn("flex size-7 items-center justify-center rounded-full border", CAT_STYLES[c].bg, CAT_STYLES[c].border)}>
                      <CatIcon cat={c} className="size-3.5" />
                    </span>
                    <span className="flex-1">{CATEGORY_LABEL[c]}</span>
                    <span className="text-muted-foreground">
                      {stats.counts[c]} {stats.counts[c] === 1 ? "día" : "días"}
                    </span>
                    <strong className="w-16 text-right">{fmtPct(stats.percents[c])}</strong>
                  </li>
                ))}
              </ul>
            </section>

            <div className="grid content-start gap-6 sm:grid-cols-2">
              <StatCard label="Días registrados" value={<CountUp value={stats.registered} />} detail={`de ${stats.days} días`} />
              <StatCard label="Minutos en actividades" value={<CountUp value={minutes} />} detail={`${Math.round(minutes / 60)} horas aprox.`} />
              <StatCard label="Días de descanso" value={<CountUp value={stats.rest} />} detail="Descansar también cuenta" />
              <StatCard
                label="Metas finalizadas"
                value={<CountUp value={stats.goalsCompleted.length} />}
                detail={stats.goalsCompleted.length === 1 ? "meta lograda este mes" : "metas logradas este mes"}
              />
            </div>
          </div>

          <section className="surface p-6 md:p-8" aria-label="Comparación con el mes anterior">
            <h2 className="text-2xl">Comparado con {MONTHS[prev.month0]}</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <CompareRow label="Cobertura" current={stats.coverage} previous={prevStats.coverage} suffix="%" decimals={1} />
              <CompareRow label="Días registrados" current={stats.registered} previous={prevStats.registered} />
              <CompareRow label="Días de descanso" current={stats.rest} previous={prevStats.rest} />
            </div>
          </section>

          {stats.goalsCompleted.length > 0 && (
            <section className="rounded-xl bg-secondary p-6 md:p-8" aria-label="Metas logradas">
              <h2 className="flex items-center gap-2 text-2xl">
                <Trophy className="size-6 text-primary" /> Lo que lograste en {MONTHS[ym.month0]}
              </h2>
              <ul className="mt-4 space-y-2">
                {stats.goalsCompleted.map((g) => (
                  <li key={g.id} className="flex items-center gap-3 rounded-lg bg-card px-4 py-3">
                    <span className={cn("flex size-8 items-center justify-center rounded-lg", CAT_STYLES[g.energy].bg)}>
                      <CatIcon cat={g.energy} />
                    </span>
                    <span className="flex-1 font-medium">{g.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {g.completedAt ? new Date(g.completedAt).toLocaleDateString("es-MX", { day: "numeric", month: "long" }) : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </>
  );
}

function StatCard({ label, value, detail }: { label: string; value: React.ReactNode; detail: string }) {
  return (
    <section className="surface p-6">
      <p className="eyebrow">{label}</p>
      <p className="mt-2 text-4xl font-medium">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
    </section>
  );
}

function CompareRow({ label, current, previous, suffix = "", decimals = 0 }: { label: string; current: number; previous: number; suffix?: string; decimals?: number }) {
  const diff = current - previous;
  const fmt = (n: number) => `${n.toLocaleString("es-MX", { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}${suffix ? ` ${suffix}` : ""}`;
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-medium">{fmt(current)}</p>
      <p className={cn("mt-1 text-sm", diff > 0 ? "text-primary" : diff < 0 ? "text-terracotta" : "text-muted-foreground")}>
        {diff === 0 ? "Igual que el mes pasado" : `${diff > 0 ? "+" : ""}${fmt(diff)} vs. mes pasado`}
      </p>
    </div>
  );
}
