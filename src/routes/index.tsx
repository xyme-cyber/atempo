import { useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PenLine, Flag, Waves, PieChart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/atempo/ui";
import { RETURN_KEY, hasVisited, useAtempo } from "@/lib/store";
import calma from "@/assets/calma.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Atempo — Encuentra tu manera de avanzar" },
      { name: "description", content: "Una herramienta para reconocer tus ritmos, organizar tus prioridades y avanzar de manera consciente." },
      { property: "og:title", content: "Atempo — Encuentra tu manera de avanzar" },
      { property: "og:description", content: "Registra tus actividades, organiza tus metas y reconoce tus ritmos de energía." },
    ],
  }),
  component: Inicio,
});

const FEATURES = [
  { icon: PenLine, title: "Registrar actividades", text: "Anota lo que hiciste y con qué energía, en pocos pasos." },
  { icon: Flag, title: "Organizar metas", text: "De una idea a un hábito, con un máximo de tres en proceso." },
  { icon: Waves, title: "Reconocer ritmos", text: "Mira cómo se mueve tu energía a lo largo del mes." },
  { icon: PieChart, title: "Consultar el progreso", text: "Compara meses y celebra lo que vas logrando." },
];

function Inicio() {
  const { user, ready } = useAtempo();
  const navigate = useNavigate();

  useEffect(() => {
    if (!ready) return;
    const ret = sessionStorage.getItem(RETURN_KEY);
    if (user && ret) {
      sessionStorage.removeItem(RETURN_KEY);
      if (ret !== "/") navigate({ to: ret });
      return;
    }
    // Returning registered user lands on Calendario (once per browser session).
    if (user && hasVisited() && !sessionStorage.getItem("atempo:landed")) {
      sessionStorage.setItem("atempo:landed", "1");
      navigate({ to: "/calendario" });
    }
    sessionStorage.setItem("atempo:landed", "1");
  }, [ready, user, navigate]);

  return (
    <div className="space-y-14">
      <section className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <span className="inline-flex items-center gap-3">
            <Logo className="size-12" />
            <span className="font-display text-3xl font-bold text-primary">Atempo</span>
          </span>
          <h1 className="mt-8 text-4xl leading-tight md:text-6xl">Encuentra tu manera de avanzar.</h1>
          <p className="mt-5 max-w-xl text-lg text-foreground/80">
            Una herramienta para reconocer tus ritmos, organizar tus prioridades y avanzar de manera consciente. Sin presión por hacer más: descansar también cuenta.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/calendario">
                Explorar Atempo <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/metas">Comenzar a organizar mis metas</Link>
            </Button>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-border">
          <img src={calma} alt="Mesa tranquila junto a una ventana con una taza de té y una libreta abierta" width={1024} height={1344} className="h-80 w-full object-cover lg:h-[28rem]" />
          <p className="absolute bottom-0 left-0 right-0 bg-card/85 px-5 py-4 text-sm font-medium backdrop-blur">
            No se trata de hacer más. Se trata de conocerte mejor.
          </p>
        </div>
      </section>

      <section aria-labelledby="posibilidades">
        <h2 id="posibilidades" className="text-2xl">Lo que puedes hacer en Atempo</h2>
        <div className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, text }, i) => (
            <div key={title} className="bg-card p-6">
              <span className="text-xs font-semibold text-muted-foreground">0{i + 1}</span>
              <Icon className="mt-4 size-6 text-primary" />
              <h3 className="mt-4 text-lg">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
