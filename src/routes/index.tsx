import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/Shell";
import { actions, brl, currentUser, ocupadas, statusPeriodo, useDB } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Esportik — Modalidades da Semana Acadêmica" },
    { name: "description", content: "Busque e inscreva-se nas modalidades da Semana Acadêmica de Educação Física." },
    { property: "og:title", content: "Esportik — Modalidades" },
    { property: "og:description", content: "Inscrições da Semana Acadêmica de Educação Física." },
  ] }),
  component: Index,
});

const badge = { ABERTA: "bg-accent text-accent-foreground", EM_BREVE: "bg-warning text-foreground", ENCERRADA: "bg-muted text-muted-foreground" } as const;
const rotulo = { ABERTA: "Inscrições abertas", EM_BREVE: "Em breve", ENCERRADA: "Encerrada" } as const;

function Index() {
  const s = useDB(); const [q, setQ] = useState(""); const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  if (!s) return <Shell><p>Carregando…</p></Shell>;
  const u = currentUser(s);
  const lista = s.modalidades.filter((m) => m.nome.toLowerCase().includes(q.toLowerCase()));
  const inscrever = (id: string) => { try { actions.inscrever(id); setMsg({ ok: true, t: "Inscrição realizada! Pague a taxa para confirmar sua vaga." }); } catch (e) { setMsg({ ok: false, t: (e as Error).message }); } };
  return (
    <Shell>
      <section className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Semana Acadêmica · Educação Física</p>
        <h1 className="display mt-2 text-6xl md:text-8xl">Escolha sua <span className="bg-accent px-2">modalidade</span></h1>
      </section>
      <input className="field mb-6 max-w-md" placeholder="Buscar modalidade…" value={q} onChange={(e) => setQ(e.target.value)} />
      {msg && <div className={`mb-6 rounded-sm px-4 py-3 text-sm font-medium ${msg.ok ? "bg-accent text-accent-foreground" : "bg-destructive text-destructive-foreground"}`}>{msg.t}</div>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lista.map((m) => {
          const st = statusPeriodo(m); const occ = ocupadas(s, m.id); const livres = m.vagas - occ;
          const jaInscrito = u && s.inscricoes.some((i) => i.userId === u.id && i.modalidadeId === m.id);
          return (
            <article key={m.id} className="card flex flex-col p-5">
              <span className={`self-start rounded-sm px-2 py-0.5 text-xs font-bold uppercase ${badge[st]}`}>{rotulo[st]}</span>
              <h2 className="display mt-3 text-3xl">{m.nome}</h2>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">{m.descricao}</p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary" style={{ width: `${Math.min(100, (occ / m.vagas) * 100)}%` }} /></div>
              <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div><dt className="text-muted-foreground">Vagas</dt><dd className="font-bold">{livres}/{m.vagas}</dd></div>
                <div><dt className="text-muted-foreground">Taxa</dt><dd className="font-bold">{brl(m.taxa)}</dd></div>
                <div><dt className="text-muted-foreground">Período</dt><dd className="font-bold">{m.inicio.slice(8)}/{m.inicio.slice(5, 7)}–{m.fim.slice(8)}/{m.fim.slice(5, 7)}</dd></div>
              </dl>
              <button className="btn-primary mt-4" disabled={!!jaInscrito || st !== "ABERTA" || livres <= 0} onClick={() => inscrever(m.id)}>
                {jaInscrito ? "Inscrito" : livres <= 0 ? "Esgotado" : "Inscrever-se"}
              </button>
            </article>
          );
        })}
        {lista.length === 0 && <p className="text-muted-foreground">Nenhuma modalidade encontrada.</p>}
      </div>
    </Shell>
  );
}
