import { Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { actions, currentUser, useDB } from "@/lib/store";

export function Shell({ children }: { children: ReactNode }) {
  const s = useDB(); const u = currentUser(s); const nav = useNavigate();
  const link = "text-sm font-semibold uppercase tracking-wide hover:text-accent";
  return (
    <div className="min-h-screen font-sans">
      <header className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-6 px-6 py-4">
          <Link to="/" className="display text-3xl">Esport<span className="text-accent">ik</span></Link>
          <nav className="flex flex-1 gap-5">
            <Link to="/" className={link}>Modalidades</Link>
            {u && <Link to="/minhas" className={link}>Minhas inscrições</Link>}
            {u?.role === "ADMIN" && <Link to="/admin" className={link}>Painel admin</Link>}
          </nav>
          {u ? (
            <div className="flex items-center gap-3 text-sm">
              <span>{u.nome} <span className="rounded-sm bg-accent px-1.5 py-0.5 text-xs font-bold text-accent-foreground">{u.role}</span></span>
              <button className="btn border border-primary-foreground/40" onClick={() => { actions.logout(); nav({ to: "/" }); }}>Sair</button>
            </div>
          ) : <Link to="/login" className="btn-accent">Entrar</Link>}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Protótipo · Semana Acadêmica de Educação Física · Faculdade Católica da Paraíba ·{" "}
        <button className="underline" onClick={() => actions.resetar()}>restaurar dados de exemplo</button>
      </footer>
    </div>
  );
}
