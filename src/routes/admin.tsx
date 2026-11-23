import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Shell } from "@/components/Shell";
import { actions, brl, currentUser, ocupadas, useDB, type Modalidade } from "@/lib/store";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [
    { title: "Painel admin — Esportik" },
    { name: "description", content: "Gerencie modalidades e confirme pagamentos." },
    { property: "og:title", content: "Painel admin — Esportik" },
    { property: "og:description", content: "Gestão da Semana Acadêmica." },
  ] }),
  component: Admin,
});

function Admin() {
  const s = useDB(); const u = currentUser(s);
  const [edit, setEdit] = useState<Partial<Modalidade> | null>(null);
  if (!s) return <Shell><p>Carregando…</p></Shell>;
  if (u?.role !== "ADMIN") return <Shell><p>Acesso restrito a administradores. <Link to="/login" className="underline">Entrar</Link></p></Shell>;
  const salvar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); const f = new FormData(e.currentTarget); const g = (k: string) => String(f.get(k));
    actions.salvarModalidade({ ...(edit?.id ? { id: edit.id } : {}), nome: g("nome"), descricao: g("descricao"), vagas: Number(g("vagas")), taxa: Number(g("taxa")), inicio: g("inicio"), fim: g("fim") });
    setEdit(null);
  };
  const pend = s.inscricoes.filter((i) => i.status === "PENDENTE");
  return (
    <Shell>
      <div className="mb-8 flex items-end justify-between">
        <h1 className="display text-5xl">Painel admin</h1>
        <button className="btn-accent" onClick={() => setEdit({})}>+ Nova modalidade</button>
      </div>
      <div className="mb-10 grid grid-cols-3 gap-4">
        {[["Modalidades", s.modalidades.length], ["Inscrições", s.inscricoes.length], ["Pagamentos pendentes", pend.length]].map(([l, v]) => (
          <div key={l} className="card p-4"><p className="label">{l}</p><p className="display text-4xl">{v}</p></div>
        ))}
      </div>
      {edit && (
        <form onSubmit={salvar} className="card mb-10 grid grid-cols-2 gap-4 p-5">
          <h2 className="display col-span-2 text-2xl">{edit.id ? "Editar" : "Nova"} modalidade</h2>
          <div className="col-span-2"><label className="label">Nome</label><input name="nome" required defaultValue={edit.nome} className="field" /></div>
          <div className="col-span-2"><label className="label">Descrição</label><input name="descricao" defaultValue={edit.descricao} className="field" /></div>
          <div><label className="label">Vagas</label><input name="vagas" type="number" min={1} required defaultValue={edit.vagas} className="field" /></div>
          <div><label className="label">Taxa (R$)</label><input name="taxa" type="number" min={0} step="0.01" required defaultValue={edit.taxa} className="field" /></div>
          <div><label className="label">Início das inscrições</label><input name="inicio" type="date" required defaultValue={edit.inicio} className="field" /></div>
          <div><label className="label">Fim das inscrições</label><input name="fim" type="date" required defaultValue={edit.fim} className="field" /></div>
          <div className="col-span-2 flex gap-2"><button className="btn-primary">Salvar</button><button type="button" className="btn-ghost" onClick={() => setEdit(null)}>Cancelar</button></div>
        </form>
      )}
      <h2 className="display mb-3 text-2xl">Modalidades</h2>
      <div className="card mb-10 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase"><tr><th className="p-3">Nome</th><th>Vagas</th><th>Taxa</th><th>Período</th><th></th></tr></thead>
          <tbody>{s.modalidades.map((m) => (
            <tr key={m.id} className="border-t border-border">
              <td className="p-3 font-semibold">{m.nome}</td><td>{ocupadas(s, m.id)}/{m.vagas}</td><td>{brl(m.taxa)}</td><td>{m.inicio} → {m.fim}</td>
              <td className="space-x-2 p-2 text-right"><button className="btn-ghost" onClick={() => setEdit(m)}>Editar</button><button className="btn-danger" onClick={() => confirm(`Excluir ${m.nome}?`) && actions.excluirModalidade(m.id)}>Excluir</button></td>
            </tr>))}</tbody>
        </table>
      </div>
      <h2 className="display mb-3 text-2xl">Inscrições</h2>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase"><tr><th className="p-3">Aluno</th><th>Matrícula</th><th>Modalidade</th><th>Status</th><th></th></tr></thead>
          <tbody>{s.inscricoes.map((i) => { const a = s.users.find((x) => x.id === i.userId); const m = s.modalidades.find((x) => x.id === i.modalidadeId); return (
            <tr key={i.id} className="border-t border-border">
              <td className="p-3">{a?.nome}</td><td>{a?.matricula}</td><td>{m?.nome}</td><td className="font-semibold">{i.status}</td>
              <td className="p-2 text-right">{i.status === "PENDENTE" && <button className="btn-accent" onClick={() => actions.confirmarPagamento(i.id)}>Confirmar pagamento</button>}</td>
            </tr>); })}
            {s.inscricoes.length === 0 && <tr><td colSpan={5} className="p-4 text-muted-foreground">Nenhuma inscrição ainda.</td></tr>}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
