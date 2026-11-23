import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Shell } from "@/components/Shell";
import { actions } from "@/lib/store";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [
    { title: "Entrar — Esportik" },
    { name: "description", content: "Entre, cadastre-se ou recupere sua senha no Esportik." },
    { property: "og:title", content: "Entrar — Esportik" },
    { property: "og:description", content: "Acesso à plataforma de inscrições Esportik." },
  ] }),
  component: Login,
});

function Login() {
  const [aba, setAba] = useState<"login" | "cadastro" | "recuperar">("login");
  const [erro, setErro] = useState(""); const [info, setInfo] = useState("");
  const [codigo, setCodigo] = useState<string | null>(null); const [emailRec, setEmailRec] = useState("");
  const nav = useNavigate();
  const run = (fn: (f: FormData) => void) => (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setErro(""); setInfo("");
    try { fn(new FormData(e.currentTarget)); } catch (x) { setErro((x as Error).message); }
  };
  const g = (f: FormData, k: string) => String(f.get(k) ?? "");
  const F = ({ n, l, t = "text" }: { n: string; l: string; t?: string }) => (<div><label className="label">{l}</label><input required name={n} type={t} className="field" /></div>);
  return (
    <Shell>
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex border-b border-border">
          {(["login", "cadastro", "recuperar"] as const).map((a) => (
            <button key={a} onClick={() => { setAba(a); setErro(""); setInfo(""); setCodigo(null); }} className={`flex-1 py-3 text-sm font-semibold uppercase ${aba === a ? "border-b-4 border-accent" : "text-muted-foreground"}`}>
              {a === "login" ? "Entrar" : a === "cadastro" ? "Cadastrar" : "Recuperar senha"}
            </button>
          ))}
        </div>
        {erro && <p className="mb-4 rounded-sm bg-destructive px-3 py-2 text-sm text-destructive-foreground">{erro}</p>}
        {info && <p className="mb-4 rounded-sm bg-accent px-3 py-2 text-sm text-accent-foreground">{info}</p>}
        {aba === "login" && (
          <form className="space-y-4" onSubmit={run((f) => { actions.login(g(f, "email"), g(f, "senha")); nav({ to: "/" }); })}>
            <F n="email" l="Email" t="email" /><F n="senha" l="Senha" t="password" />
            <button className="btn-primary w-full">Entrar</button>
            <p className="text-xs text-muted-foreground">Demo: admin@fcp.edu.br / admin123 · aluno@fcp.edu.br / aluno123</p>
          </form>
        )}
        {aba === "cadastro" && (
          <form className="grid grid-cols-2 gap-4" onSubmit={run((f) => { actions.cadastrar({ nome: g(f, "nome"), email: g(f, "email"), senha: g(f, "senha"), telefone: g(f, "telefone"), nascimento: g(f, "nascimento"), matricula: g(f, "matricula") }); nav({ to: "/" }); })}>
            <div className="col-span-2"><F n="nome" l="Nome completo" /></div>
            <div className="col-span-2"><F n="email" l="Email" t="email" /></div>
            <F n="telefone" l="Telefone" t="tel" /><F n="nascimento" l="Nascimento" t="date" />
            <F n="matricula" l="Matrícula" /><F n="senha" l="Senha" t="password" />
            <button className="btn-primary col-span-2">Criar conta</button>
          </form>
        )}
        {aba === "recuperar" && !codigo && (
          <form className="space-y-4" onSubmit={run((f) => { const em = g(f, "email"); setCodigo(actions.recuperar(em)); setEmailRec(em); })}>
            <F n="email" l="Email cadastrado" t="email" />
            <button className="btn-primary w-full">Enviar código</button>
          </form>
        )}
        {aba === "recuperar" && codigo && (
          <form className="space-y-4" onSubmit={run((f) => { if (g(f, "codigo") !== codigo) throw new Error("Código inválido"); actions.redefinir(emailRec, g(f, "senha")); setCodigo(null); setAba("login"); setInfo("Senha redefinida. Faça login."); })}>
            <p className="card p-3 text-sm">Simulação de email: seu código é <b>{codigo}</b></p>
            <F n="codigo" l="Código" /><F n="senha" l="Nova senha" t="password" />
            <button className="btn-primary w-full">Redefinir senha</button>
          </form>
        )}
      </div>
    </Shell>
  );
}
