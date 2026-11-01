import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LogOut, LogIn, User, Settings, CalendarDays, Flag, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/atempo/ui";
import { displayName, initials, useAtempo } from "@/lib/store";
import { cn } from "@/lib/utils";

type Tab = "cuenta" | "config";

export const Route = createFileRoute("/cuenta")({
  validateSearch: (s: Record<string, unknown>): { tab: Tab } => ({
    tab: s["tab"] === "config" ? "config" : "cuenta",
  }),
  head: () => ({
    meta: [
      { title: "Mi cuenta — Atempo" },
      { name: "description", content: "Administra tu cuenta y revisa un resumen de tus datos en Atempo." },
      { property: "og:title", content: "Mi cuenta — Atempo" },
      { property: "og:description", content: "Tu cuenta, tus datos, tu ritmo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Cuenta,
});

const TABS: { id: Tab; label: string; icon: typeof User }[] = [
  { id: "cuenta", label: "Mi cuenta", icon: User },
  { id: "config", label: "Configuración", icon: Settings },
];

function Cuenta() {
  const { tab } = Route.useSearch();
  const navigate = useNavigate();
  const { user, ready, signOut, logs, goals } = useAtempo();
  const name = displayName(user);

  if (!ready) return null;

  if (!user) {
    return (
      <div className="mx-auto max-w-md">
        <section className="surface p-8 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-xl bg-secondary">
            <ShieldCheck className="size-6 text-primary" />
          </span>
          <h1 className="mt-4 text-3xl">Estás explorando como invitado</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Crea una cuenta o inicia sesión para conservar tus registros y metas en cualquier dispositivo.
          </p>
          <div className="mt-6 grid gap-3">
            <Button asChild size="lg">
              <Link to="/auth" search={{ mode: "signup" }}>
                Crear cuenta
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/auth" search={{ mode: "login" }}>
                <LogIn /> Iniciar sesión
              </Link>
            </Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <>
      <PageHeader eyebrow="Tu espacio" title="Mi cuenta" subtitle="Administra tu sesión y revisa un resumen de lo que llevas registrado." />

      <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
        <nav aria-label="Secciones de la cuenta" className="flex gap-2 lg:flex-col">
          {TABS.map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant="nav"
              size="nav"
              data-active={tab === id}
              onClick={() => navigate({ to: "/cuenta", search: { tab: id } })}
              aria-current={tab === id ? "page" : undefined}
            >
              <Icon /> {label}
            </Button>
          ))}
        </nav>

        {tab === "cuenta" ? (
          <section className="surface p-6 md:p-8" aria-label="Datos de la cuenta">
            <div className="flex items-center gap-4">
              <span className="flex size-14 items-center justify-center rounded-full border border-border bg-secondary text-lg font-bold">{initials(name)}</span>
              <div className="min-w-0">
                <p className="truncate text-xl font-semibold">{name}</p>
                <p className="truncate text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border p-4">
                <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="size-4" /> Días registrados
                </dt>
                <dd className="mt-1 text-2xl font-medium">{Object.keys(logs).length}</dd>
              </div>
              <div className="rounded-lg border border-border p-4">
                <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Flag className="size-4" /> Metas
                </dt>
                <dd className="mt-1 text-2xl font-medium">{goals.length}</dd>
              </div>
            </dl>
            <div className="mt-6 border-t border-border pt-6">
              <Button variant="outline" onClick={() => void signOut()}>
                <LogOut /> Cerrar sesión
              </Button>
            </div>
          </section>
        ) : (
          <section className="surface p-6 md:p-8" aria-label="Configuración">
            <h2 className="text-2xl">Configuración</h2>
            <ul className="mt-5 space-y-4 text-sm">
              <li className={cn("rounded-lg border border-border p-4")}>
                <p className="font-semibold">Tus datos</p>
                <p className="mt-1 text-muted-foreground">
                  Tus registros y metas se guardan en tu cuenta y solo tú puedes verlos. Al cerrar sesión, los datos de invitado de este navegador no se mezclan con tu cuenta.
                </p>
              </li>
              <li className="rounded-lg border border-border p-4">
                <p className="font-semibold">Límite de metas en proceso</p>
                <p className="mt-1 text-muted-foreground">
                  Atempo permite hasta tres metas en proceso a la vez, para que avances con calma y sin saturarte.
                </p>
              </li>
              <li className="rounded-lg border border-border p-4">
                <p className="font-semibold">Sesión</p>
                <p className="mt-1 text-muted-foreground">Conectado como {user.email}.</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => void signOut()}>
                  <LogOut /> Cerrar sesión
                </Button>
              </li>
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
