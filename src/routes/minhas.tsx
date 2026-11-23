import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { brl, currentUser, useDB } from "@/lib/store";

export const Route = createFileRoute("/minhas")({
  head: () => ({ meta: [
    { title: "Minhas inscrições — Esportik" },
    { name: "description", content: "Acompanhe suas inscrições e ingressos." },
    { property: "og:title", content: "Minhas inscrições — Esportik" },
    { property: "og:description", content: "Status de pagamento e ingressos." },
  ] }),
  component: Minhas,
});

function Minhas() {
  const s = useDB(); const u = currentUser(s);
  if (!s) return <Shell><p>Carregando…</p></Shell>;
  if (!u) return <Shell><p>Faça <Link to="/login" className="underline">login</Link> para ver suas inscrições.</p></Shell>;
  const minhas = s.inscricoes.filter((i) => i.userId === u.id);
  return (
    <Shell>
      <h1 className="display mb-8 text-5xl">Minhas inscrições</h1>
      {minhas.length === 0 && <p className="text-muted-foreground">Você ainda não se inscreveu em nenhuma modalidade.</p>}
      <div className="grid gap-4 md:grid-cols-2">
        {minhas.map((i) => { const m = s.modalidades.find((x) => x.id === i.modalidadeId); const ok = i.status === "CONFIRMADA"; return (
          <div key={i.id} className={`card flex overflow-hidden ${ok ? "" : "opacity-90"}`}>
            <div className="flex-1 p-5">
              <h2 className="display text-3xl">{m?.nome}</h2>
              <p className="text-sm text-muted-foreground">Taxa: {m && brl(m.taxa)}</p>
              <span className={`mt-3 inline-block rounded-sm px-2 py-0.5 text-xs font-bold ${ok ? "bg-accent text-accent-foreground" : "bg-warning text-foreground"}`}>{ok ? "PAGAMENTO CONFIRMADO" : "AGUARDANDO PAGAMENTO"}</span>
            </div>
            <div className="flex w-40 flex-col items-center justify-center border-l-2 border-dashed border-border bg-muted p-4 text-center">
              <span className="text-xs uppercase text-muted-foreground">Ingresso</span>
              <span className="mt-1 font-mono text-sm font-bold">{ok ? i.codigo : "— bloqueado —"}</span>
            </div>
          </div>); })}
      </div>
    </Shell>
  );
}
