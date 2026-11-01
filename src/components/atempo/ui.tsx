import { useEffect, useState, type ReactNode } from "react";
import { Zap, Waves, Leaf, Shapes, Moon, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORY_LABEL, type DayCategory } from "@/lib/energy";

export function Logo({ className }: { className?: string }) {
  // Open "A" made of two soft curved strokes and a short crossbar.
  return (
    <svg viewBox="0 0 40 40" className={cn("size-8", className)} aria-hidden="true" fill="none">
      <path d="M7 34 C 12 22, 15 12, 20 6 C 24 12, 27 22, 33 34" stroke="var(--color-primary)" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M13.5 24 C 18 22.6, 22 22.6, 26 24.2" stroke="var(--color-terracotta)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function Brand({ sub = "Hábitos y energía" }: { sub?: string }) {
  return (
    <span className="flex items-center gap-2.5">
      <Logo />
      <span className="leading-tight">
        <span className="block font-display text-2xl font-bold text-primary">Atempo</span>
        {sub && <span className="block text-xs text-muted-foreground">{sub}</span>}
      </span>
    </span>
  );
}

const ICONS: Record<DayCategory, typeof Zap> = {
  intenso: Zap,
  intermedio: Waves,
  ligero: Leaf,
  diverso: Shapes,
  descanso: Moon,
  sin: Minus,
};

export const CAT_STYLES: Record<DayCategory, { bg: string; fg: string; solid: string; border: string }> = {
  intenso: { bg: "bg-e-intenso-soft", fg: "text-e-intenso", solid: "var(--e-intenso)", border: "border-e-intenso/40" },
  intermedio: { bg: "bg-e-intermedio-soft", fg: "text-e-intermedio", solid: "var(--e-intermedio)", border: "border-e-intermedio/40" },
  ligero: { bg: "bg-e-ligero-soft", fg: "text-e-ligero", solid: "var(--e-ligero)", border: "border-e-ligero/40" },
  diverso: { bg: "bg-e-diverso-soft", fg: "text-[var(--e-diverso-ink)]", solid: "var(--e-diverso)", border: "border-e-diverso" },
  descanso: { bg: "bg-e-descanso-soft", fg: "text-e-descanso", solid: "var(--e-descanso)", border: "border-e-descanso/50" },
  sin: { bg: "bg-e-sin-soft", fg: "text-e-sin", solid: "var(--border)", border: "border-border" },
};

export function CatIcon({ cat, className }: { cat: DayCategory; className?: string }) {
  const I = ICONS[cat];
  return <I className={cn("size-4", CAT_STYLES[cat].fg, className)} aria-hidden="true" />;
}

export function CatBadge({ cat, className }: { cat: DayCategory; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-medium", CAT_STYLES[cat].bg, className)}>
      <CatIcon cat={cat} className="size-3.5" />
      <span className="text-foreground">{CATEGORY_LABEL[cat]}</span>
    </span>
  );
}

export function PageHeader({ eyebrow, title, subtitle, action }: { eyebrow: string; title: string; subtitle: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="eyebrow text-foreground/80">{eyebrow}</p>
        <h1 className="mt-2 text-3xl md:text-4xl">{title}</h1>
        <p className="mt-2 text-muted-foreground">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

export function useCountUp(target: number, duration = 800) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setV(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const from = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const e = 1 - Math.pow(1 - p, 3);
      setV(from + (target - from) * e);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
}

export function CountUp({ value, decimals = 0, suffix = "" }: { value: number; decimals?: number; suffix?: string }) {
  const v = useCountUp(value);
  return (
    <span>
      {v.toLocaleString("es-MX", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}

/** One-shot animated donut. segments in order; values are weights. */
export function Donut({ segments, size = 200, stroke = 26, children, label }: { segments: { value: number; color: string; key: string }[]; size?: number; stroke?: number; children?: ReactNode; label: string }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const gap = segments.filter((s) => s.value > 0).length > 1 ? 3 : 0;
  let offset = 0;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={label}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-muted)" strokeWidth={stroke} />
        {segments.map((s) => {
          const len = (s.value / total) * c;
          const dash = Math.max(0, len - gap);
          const el = (
            <circle
              key={s.key}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              strokeDasharray={`${shown ? dash : 0} ${c}`}
              strokeDashoffset={-offset}
              style={{ transition: "stroke-dasharray 900ms cubic-bezier(0.2,0.7,0.2,1)" }}
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}

export function EmptyState({ icon, title, text, action }: { icon?: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border px-6 py-10 text-center">
      {icon}
      <p className="font-display text-lg font-bold">{title}</p>
      <p className="max-w-sm text-sm text-muted-foreground">{text}</p>
      {action}
    </div>
  );
}
