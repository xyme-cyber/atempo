import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogIn, UserPlus, Mail, Lock, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brand } from "@/components/atempo/ui";
import { supabase } from "@/integrations/supabase/client";
import { RETURN_KEY, useAtempo } from "@/lib/store";

type Mode = "login" | "signup";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { mode: Mode } => ({
    mode: s["mode"] === "signup" ? "signup" : "login",
  }),
  head: () => ({
    meta: [
      { title: "Tu cuenta — Atempo" },
      { name: "description", content: "Inicia sesión o crea tu cuenta para conservar tus registros, metas y progreso." },
      { property: "og:title", content: "Tu cuenta — Atempo" },
      { property: "og:description", content: "Guarda lo que vas construyendo: tus registros y metas, siempre contigo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Auth,
});

function Auth() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const { user, ready } = useAtempo();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  // Already signed in: go back to where the user came from.
  useEffect(() => {
    if (ready && user) {
      const ret = sessionStorage.getItem(RETURN_KEY);
      sessionStorage.removeItem(RETURN_KEY);
      navigate({ to: ret && ret !== "/auth" ? ret : "/" });
    }
  }, [ready, user, navigate]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e["email"] = "Escribe un correo válido.";
    if (password.length < 6) e["password"] = "Mínimo 6 caracteres.";
    if (mode === "signup" && password !== password2) e["password2"] = "Las contraseñas no coinciden.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setBusy(true);
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) {
        toast.error(error.message === "Invalid login credentials" ? "Correo o contraseña incorrectos." : "No pudimos iniciar sesión. Intenta de nuevo.");
        return;
      }
      toast.success("Bienvenido de nuevo");
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      setBusy(false);
      if (error) {
        toast.error(error.message.includes("already registered") ? "Este correo ya tiene una cuenta. Inicia sesión." : "No pudimos crear tu cuenta. Intenta de nuevo.");
        return;
      }
      toast.success("Cuenta creada", { description: "Revisa tu correo si te pedimos confirmarla." });
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="surface p-8">
        <Brand />
        <h1 className="mt-8 text-3xl">{mode === "login" ? "Iniciar sesión" : "Crear cuenta"}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "login"
            ? "Retoma tus registros, metas y progreso donde los dejaste."
            : "Lo que ya registraste como invitado se guardará en tu cuenta automáticamente."}
        </p>

        <form
          className="mt-6 space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="email">Correo</Label>
            <div className="relative">
              <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" className="pr-10" aria-invalid={!!errors["email"]} />
              <Mail className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            {errors["email"] && <p className="text-xs text-destructive">{errors["email"]}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input id="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pr-10" aria-invalid={!!errors["password"]} />
              <Lock className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            {errors["password"] && <p className="text-xs text-destructive">{errors["password"]}</p>}
          </div>
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="password2">Repite tu contraseña</Label>
              <Input id="password2" type="password" autoComplete="new-password" value={password2} onChange={(e) => setPassword2(e.target.value)} placeholder="••••••••" aria-invalid={!!errors["password2"]} />
              {errors["password2"] && <p className="text-xs text-destructive">{errors["password2"]}</p>}
            </div>
          )}
          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            {mode === "login" ? <LogIn /> : <UserPlus />}
            {busy ? "Un momento…" : mode === "login" ? "Entrar" : "Crear mi cuenta"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "login" ? "¿Aún no tienes cuenta? " : "¿Ya tienes cuenta? "}
          <button
            className="font-semibold text-primary underline-offset-4 hover:underline"
            onClick={() => navigate({ to: "/auth", search: { mode: mode === "login" ? "signup" : "login" } })}
          >
            {mode === "login" ? "Crea una" : "Inicia sesión"}
          </button>
        </p>
      </div>

      <Button variant="ghost" className="mt-4" onClick={() => navigate({ to: "/" })}>
        <ArrowLeft /> Volver al inicio
      </Button>
    </div>
  );
}
