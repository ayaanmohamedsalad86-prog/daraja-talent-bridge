import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Moon, Sun, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

const ROLES = [
  { to: "/", label: "Talent" },
  { to: "/mentor", label: "Mentor" },
  { to: "/employer", label: "Employer" },
  { to: "/impact", label: "Impact Dashboard" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { reset } = useStore();
  const [dark, setDark] = useState(false);
  useEffect(() => { setDark(localStorage.getItem("daraja-theme") === "dark"); }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("daraja-theme", dark ? "dark" : "light");
  }, [dark]);
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">D</span>
            Daraja <span className="text-accent-strong">Talent</span>
          </Link>
          <nav aria-label="Switch role" className="order-3 flex w-full gap-1 overflow-x-auto rounded-xl bg-muted p-1 md:order-none md:ml-6 md:w-auto">
            {ROLES.map((r) => (
              <Link key={r.to} to={r.to} activeOptions={{ exact: true }}
                className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "bg-background text-foreground shadow-sm" }}>
                {r.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex gap-1">
            <Button variant="ghost" size="icon" aria-label="Reset demo data" title="Reset demo data" onClick={reset}><RotateCcw className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" aria-label="Toggle dark mode" onClick={() => setDark((d) => !d)}>
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        PLP × ILO PROSPECTS Hackathon · Track 3 · SDG 8 · SDG 10 · SDG 17
      </footer>
    </div>
  );
}

export function PageHeader({ eyebrow, title, desc, children }: { eyebrow: string; title: string; desc: string; children?: ReactNode }) {
  return (
    <div className="mb-6 grid gap-4 sm:flex sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent-strong">{eyebrow}</p>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{desc}</p>
      </div>
      {children}
    </div>
  );
}
