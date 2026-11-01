import { useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Home, CalendarDays, PenLine, Flag, PieChart, Menu, X, ChevronDown, User, Settings, LogOut, LogIn, UserPlus, ShieldCheck, Info, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Brand } from "./ui";
import { RETURN_KEY, displayName, initials, useAtempo } from "@/lib/store";

export const NAV = [
  { to: "/", label: "Inicio", icon: Home },
  { to: "/calendario", label: "Calendario", icon: CalendarDays },
  { to: "/registro", label: "Registro diario", icon: PenLine },
  { to: "/metas", label: "Metas", icon: Flag },
  { to: "/analisis", label: "Análisis", icon: PieChart },
] as const;

function isActive(pathname: string, to: string) {
  return to === "/" ? pathname === "/" : pathname.startsWith(to);
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation();
  return (
    <nav aria-label="Secciones" className="flex flex-col gap-1.5">
      {NAV.map(({ to, label, icon: Icon }) => {
        const active = isActive(pathname, to);
        return (
          <Button key={to} asChild variant="nav" size="nav" data-active={active}>
            <Link to={to} onClick={onNavigate} aria-current={active ? "page" : undefined}>
              <Icon />
              {label}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}

export function rememberReturn(path: string) {
  if (!path.startsWith("/auth") && !path.startsWith("/reset-password")) sessionStorage.setItem(RETURN_KEY, path);
}

function ProfileMenu() {
  const { user, signOut } = useAtempo();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const name = displayName(user);
  const goAuth = (mode: "login" | "signup") => {
    rememberReturn(pathname);
    navigate({ to: "/auth", search: { mode } });
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2 px-2" aria-label="Menú de perfil">
          <span className="flex size-8 items-center justify-center rounded-full border border-border bg-secondary text-xs font-bold">
            {user ? initials(name) : <User className="size-4" />}
          </span>
          <span className="hidden font-medium sm:inline">{name}</span>
          <ChevronDown className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {user ? (
          <>
            <DropdownMenuLabel className="truncate font-normal text-muted-foreground">{user.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => navigate({ to: "/cuenta", search: { tab: "cuenta" } })}>
              <User /> Mi cuenta
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => navigate({ to: "/cuenta", search: { tab: "config" } })}>
              <Settings /> Configuración
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => void signOut()}>
              <LogOut /> Cerrar sesión
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuLabel className="font-normal text-muted-foreground">Estás explorando como invitado</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => goAuth("login")}>
              <LogIn /> Iniciar sesión
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => goAuth("signup")}>
              <UserPlus /> Crear cuenta
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AuthPrompt() {
  const { authPrompt, closeAuthPrompt } = useAtempo();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const go = (mode: "login" | "signup") => {
    rememberReturn(pathname);
    closeAuthPrompt();
    navigate({ to: "/auth", search: { mode } });
  };
  return (
    <Dialog open={authPrompt} onOpenChange={(o) => !o && closeAuthPrompt()}>
      <DialogContent className="max-w-lg bg-card p-8">
        <span className="flex size-14 items-center justify-center rounded-xl bg-secondary">
          <ShieldCheck className="size-6 text-primary" />
        </span>
        <p className="eyebrow mt-2">Guarda lo que vas construyendo</p>
        <DialogTitle className="font-display text-3xl font-bold">Tu progreso merece quedarse.</DialogTitle>
        <DialogDescription className="text-foreground/80">
          Una cuenta te permite conservar tus registros diarios, metas y progreso para retomarlos cuando quieras. Lo que ya hiciste se guardará automáticamente al entrar.
        </DialogDescription>
        <div className="flex gap-3 rounded-lg border border-border p-4 text-sm">
          <Info className="mt-0.5 size-4 shrink-0 text-terracotta" />
          Sin una cuenta, tus datos solo se guardan en este navegador y podrían perderse.
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Button variant="outline" onClick={() => go("login")}>
            Iniciar sesión
          </Button>
          <Button onClick={() => go("signup")}>
            <ArrowRight /> Crear cuenta
          </Button>
        </div>
        <button onClick={closeAuthPrompt} className="text-center text-sm text-muted-foreground underline-offset-4 hover:underline">
          Seguir como invitado
        </button>
      </DialogContent>
    </Dialog>
  );
}

function DemoBanner() {
  const { demo, setDemo } = useAtempo();
  if (!demo) return null;
  return (
    <div role="status" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-e-diverso bg-e-diverso-soft px-4 py-3 text-sm">
      <span>
        <strong>Vista de ejemplo.</strong> Estos datos son ficticios y no se guardan en tu cuenta.
      </span>
      <Button size="sm" variant="outline" onClick={() => setDemo(false)}>
        Salir del ejemplo
      </Button>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[17rem_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-border bg-card px-5 py-6 lg:flex">
        <Link to="/" className="mb-10 px-1">
          <Brand />
        </Link>
        <NavList />
        <p className="mt-auto px-1 text-xs text-muted-foreground">Cada día cuenta. También los de descanso.</p>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-3 px-4 md:px-8">
            <div className="flex items-center gap-2 lg:hidden">
              <Button variant="ghost" size="icon" aria-label={open ? "Cerrar menú" : "Abrir menú"} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
                {open ? <X /> : <Menu />}
              </Button>
              <Link to="/" onClick={() => setOpen(false)}>
                <Brand sub="" />
              </Link>
            </div>
            <p className="hidden text-sm text-muted-foreground lg:block">Encuentra tu manera de avanzar</p>
            <ProfileMenu />
          </div>
          {open && (
            <div className="animate-in fade-in slide-in-from-top-2 border-t border-border bg-card px-4 py-3 duration-200 lg:hidden">
              <NavList onNavigate={() => setOpen(false)} />
            </div>
          )}
        </header>

        <main key={pathname} className="page-enter mx-auto w-full max-w-7xl flex-1 px-4 py-8 md:px-8 md:py-10">
          <DemoBanner />
          {children}
        </main>

        <footer className="border-t border-border px-4 py-5 text-sm text-muted-foreground md:px-8">
          <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-2">
            <span>Atempo · hábitos y energía</span>
            <span>Cada día cuenta. También los de descanso.</span>
          </div>
        </footer>
      </div>
      <AuthPrompt />
    </div>
  );
}
