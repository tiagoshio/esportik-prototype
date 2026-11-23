import { useEffect, useState } from "react";

export type Role = "ADMIN" | "ALUNO";
export type User = { id: string; nome: string; email: string; senha: string; telefone: string; nascimento: string; matricula: string; role: Role };
export type Modalidade = { id: string; nome: string; descricao: string; vagas: number; inicio: string; fim: string; taxa: number };
export type Inscricao = { id: string; userId: string; modalidadeId: string; status: "PENDENTE" | "CONFIRMADA"; codigo: string; criadaEm: string };
type DB = { users: User[]; modalidades: Modalidade[]; inscricoes: Inscricao[]; sessao: string | null };

const KEY = "esportik-db-v1";
const uid = () => Math.random().toString(36).slice(2, 10);
const hoje = new Date();
const d = (n: number) => new Date(hoje.getTime() + n * 864e5).toISOString().slice(0, 10);

const seed = (): DB => ({
  users: [
    { id: "admin", nome: "Coordenação Ed. Física", email: "admin@fcp.edu.br", senha: "admin123", telefone: "", nascimento: "", matricula: "COORD", role: "ADMIN" },
    { id: "aluno", nome: "Aluno Demo", email: "aluno@fcp.edu.br", senha: "aluno123", telefone: "", nascimento: "", matricula: "2023001", role: "ALUNO" },
  ],
  modalidades: [
    { id: uid(), nome: "Futsal", descricao: "Torneio masculino e feminino em equipes de 5.", vagas: 40, inicio: d(-3), fim: d(10), taxa: 15 },
    { id: uid(), nome: "Vôlei de Quadra", descricao: "Equipes mistas de 6 jogadores.", vagas: 24, inicio: d(-1), fim: d(7), taxa: 12 },
    { id: uid(), nome: "Corrida 5K", descricao: "Percurso pelo campus e arredores.", vagas: 100, inicio: d(-5), fim: d(14), taxa: 20 },
    { id: uid(), nome: "Xadrez", descricao: "Sistema suíço, 5 rodadas.", vagas: 2, inicio: d(-2), fim: d(5), taxa: 5 },
    { id: uid(), nome: "Dança Popular", descricao: "Oficina cultural de forró e coco.", vagas: 30, inicio: d(3), fim: d(12), taxa: 10 },
    { id: uid(), nome: "Basquete 3x3", descricao: "Meia quadra, eliminatória simples.", vagas: 18, inicio: d(-10), fim: d(-1), taxa: 12 },
  ],
  inscricoes: [],
  sessao: null,
});

let db: DB | null = null;
const subs = new Set<() => void>();
function load(): DB {
  if (db) return db;
  try { db = JSON.parse(localStorage.getItem(KEY) || "") as DB; } catch { db = seed(); }
  return db!;
}
function save(next: DB) { db = next; localStorage.setItem(KEY, JSON.stringify(next)); subs.forEach((f) => f()); }

export function useDB() {
  const [state, set] = useState<DB | null>(null);
  useEffect(() => { set(load()); const f = () => set({ ...load() }); subs.add(f); return () => { subs.delete(f); }; }, []);
  return state;
}
export const currentUser = (s: DB | null) => s?.users.find((u) => u.id === s.sessao) ?? null;

export function statusPeriodo(m: Modalidade, now = new Date()) {
  const t = now.toISOString().slice(0, 10);
  if (t < m.inicio) return "EM_BREVE";
  if (t > m.fim) return "ENCERRADA";
  return "ABERTA";
}
export const ocupadas = (s: DB, mid: string) => s.inscricoes.filter((i) => i.modalidadeId === mid).length;

export const actions = {
  login(email: string, senha: string) {
    const s = load(); const u = s.users.find((x) => x.email === email && x.senha === senha);
    if (!u) throw new Error("Email ou senha inválidos");
    save({ ...s, sessao: u.id });
  },
  logout() { save({ ...load(), sessao: null }); },
  cadastrar(u: Omit<User, "id" | "role">) {
    const s = load();
    if (s.users.some((x) => x.email === u.email)) throw new Error("Email já cadastrado");
    const novo: User = { ...u, id: uid(), role: "ALUNO" };
    save({ ...s, users: [...s.users, novo], sessao: novo.id });
  },
  recuperar(email: string) {
    if (!load().users.some((x) => x.email === email)) throw new Error("Email não encontrado na base de dados");
    return String(Math.floor(100000 + Math.random() * 900000));
  },
  redefinir(email: string, senha: string) {
    const s = load(); save({ ...s, users: s.users.map((u) => (u.email === email ? { ...u, senha } : u)) });
  },
  salvarModalidade(m: Omit<Modalidade, "id"> & { id?: string }) {
    const s = load();
    const lista = m.id ? s.modalidades.map((x) => (x.id === m.id ? (m as Modalidade) : x)) : [...s.modalidades, { ...m, id: uid() }];
    save({ ...s, modalidades: lista });
  },
  excluirModalidade(id: string) {
    const s = load(); save({ ...s, modalidades: s.modalidades.filter((m) => m.id !== id), inscricoes: s.inscricoes.filter((i) => i.modalidadeId !== id) });
  },
  inscrever(mid: string) {
    const s = load(); const u = currentUser(s); const m = s.modalidades.find((x) => x.id === mid);
    if (!u) throw new Error("Faça login para se inscrever");
    if (!m) throw new Error("Modalidade não encontrada");
    if (statusPeriodo(m) !== "ABERTA") throw new Error("Fora do período de inscrição");
    if (s.inscricoes.some((i) => i.userId === u.id && i.modalidadeId === mid)) throw new Error("Você já está inscrito nesta modalidade");
    if (ocupadas(s, mid) >= m.vagas) throw new Error("Não há vagas disponíveis");
    save({ ...s, inscricoes: [...s.inscricoes, { id: uid(), userId: u.id, modalidadeId: mid, status: "PENDENTE", codigo: "ESP-" + uid().toUpperCase(), criadaEm: new Date().toISOString() }] });
  },
  confirmarPagamento(iid: string) {
    const s = load(); save({ ...s, inscricoes: s.inscricoes.map((i) => (i.id === iid ? { ...i, status: "CONFIRMADA" } : i)) });
  },
  resetar() { localStorage.removeItem(KEY); db = null; save(seed()); },
};
export const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
