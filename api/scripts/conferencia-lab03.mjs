/**
 * Confere `docs/diagrama-classes-prisma.md` contra o LAB03 e o schema da API.
 * Rodar dentro de `api/`: `npm run conferencia:lab03`. Sai com código 1 se algo
 * não bater.
 *
 * 1. Cada campo das 14 tabelas do "Modelo de Dados" do LAB03 aparece na seção
 *    certa da conferência, sem campo a mais.
 * 2. O resumo (existe / etapa N / total) bate com as linhas.
 * 3. Todo campo marcado "existe" está no `prisma/schema.prisma`, e nenhum campo
 *    marcado "etapa N" está lá antes da hora.
 * 4. O diagrama Mermaid tem exatamente os campos (sem relações) de cada model.
 *
 * A lista PDF abaixo é a transcrição da seção "Modelo de Dados" de
 * `docs/Plataforma de cursos.pdf` (p. 3 a 5). Exceção combinada: o `DataFim`
 * duplicado em Assinaturas conta uma vez só.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const doc = readFileSync(resolve(here, '../../docs/diagrama-classes-prisma.md'), 'utf8');
const schema = readFileSync(resolve(here, '../prisma/schema.prisma'), 'utf8');

const PDF = {
  Usuarios: ['ID_Usuario', 'NomeCompleto', 'Email', 'SenhaHash', 'DataCadastro'],
  Categorias: ['ID_Categoria', 'Nome', 'Descricao'],
  Cursos: ['ID_Curso', 'Titulo', 'Descricao', 'ID_Instrutor', 'ID_Categoria', 'Nivel', 'DataPublicacao', 'TotalAulas', 'TotalHoras'],
  Modulos: ['ID_Modulo', 'ID_Curso', 'Titulo', 'Ordem'],
  Aulas: ['ID_Aula', 'ID_Modulo', 'Titulo', 'TipoConteudo', 'URL_Conteudo', 'DuracaoMinutos', 'Ordem'],
  Matriculas: ['ID_Matricula', 'ID_Usuario', 'ID_Curso', 'DataMatricula', 'DataConclusao'],
  Progresso_Aulas: ['ID_Usuario', 'ID_Aula', 'DataConclusao', 'Status'],
  Avaliacoes: ['ID_Avaliacao', 'ID_Usuario', 'ID_Curso', 'Nota', 'Comentario', 'DataAvaliacao'],
  Trilhas: ['ID_Trilha', 'Titulo', 'Descricao', 'ID_Categoria'],
  Trilhas_Cursos: ['ID_Trilha', 'ID_Curso', 'Ordem'],
  Certificados: ['ID_Certificado', 'ID_Usuario', 'ID_Curso', 'ID_Trilha', 'CodigoVerificacao', 'DataEmissao'],
  Planos: ['ID_Plano', 'Nome', 'Descricao', 'Preco', 'DuracaoMeses'],
  Assinaturas: ['ID_Assinatura', 'ID_Usuario', 'ID_Plano', 'DataInicio', 'DataFim'],
  Pagamentos: ['ID_Pagamento', 'ID_Assinatura', 'ValorPago', 'DataPagamento', 'MetodoPagamento', 'Id_Transacao_Gateway', 'DataFim'],
};

let falhas = 0;
function check(label, ok, extra = '') {
  if (!ok) falhas++;
  console.log(`${ok ? 'OK   ' : 'FALHA'} ${label}${extra ? ` | ${extra}` : ''}`);
}

// Models do schema: campo -> tipo (sem `?` e `[]`).
const models = {};
for (const m of schema.matchAll(/^model (\w+) \{([\s\S]*?)^\}/gm)) {
  const fields = {};
  for (const line of m[2].split('\n')) {
    const [name, type] = line.trim().split(/\s+/);
    if (!name || !type || name.startsWith('@@') || name.startsWith('//')) continue;
    fields[name] = type.replace(/[?[\]]/g, '');
  }
  models[m[1]] = fields;
}
const isRelation = (type) => type in models;

// Seções "### Tabela → `Model`" da conferência.
const sections = {};
for (const part of doc.split(/^### /m).slice(1)) {
  const table = part.split('\n')[0].split(' → ')[0].trim();
  sections[table] = part
    .split('\n')
    .filter((l) => l.startsWith('| ') && !l.startsWith('| LAB03') && !l.startsWith('| ---'))
    .map((l) => l.split('|').slice(1, -1).map((c) => c.trim()));
}

// 1. Campos do PDF.
for (const [table, fields] of Object.entries(PDF)) {
  const rows = sections[table];
  if (!rows) {
    check(`seção ${table}`, false, 'não encontrada');
    continue;
  }
  const lab = rows.map((r) => r[0].split(' (')[0]);
  const faltando = fields.filter((f) => !lab.includes(f));
  const sobrando = lab.filter((f) => !fields.includes(f));
  check(
    `${table}: ${fields.length} campos do PDF cobertos`,
    faltando.length === 0 && sobrando.length === 0 && rows.length === fields.length,
    faltando.length || sobrando.length ? `faltando [${faltando}] sobrando [${sobrando}]` : '',
  );
}

// 2. Resumo.
const rows = Object.entries(sections)
  .filter(([table]) => table in PDF)
  .flatMap(([, r]) => r);
const count = {};
for (const r of rows) count[r[2]] = (count[r[2]] ?? 0) + 1;
const resumo = Object.fromEntries(
  [...doc.matchAll(/^\| \**(existe|etapa \d+|total)\** \| \**(\d+)\** \|$/gm)].map((m) => [m[1], Number(m[2])]),
);
for (const [status, n] of Object.entries(count)) {
  check(`resumo "${status}" = ${n}`, resumo[status] === n, `no documento: ${resumo[status]}`);
}
for (const status of Object.keys(resumo)) {
  if (status !== 'total' && !(status in count)) check(`resumo "${status}" sem linhas`, false);
}
const totalPdf = Object.values(PDF).reduce((s, f) => s + f.length, 0);
check(`total = ${totalPdf} campos do PDF`, rows.length === totalPdf && resumo.total === totalPdf, `linhas ${rows.length}, resumo ${resumo.total}`);

// 3. "existe" contra o schema.
for (const r of rows) {
  const [model, field] = r[1].replace(/`/g, '').split(' ')[0].split('.');
  const noSchema = Boolean(models[model] && field in models[model]);
  if (r[2] === 'existe') check(`existe: ${model}.${field} está no schema`, noSchema);
  else if (noSchema) check(`${r[2]}: ${model}.${field} já está no schema; marcar "existe"`, false);
}

// 4. Diagrama.
const mermaid = doc.match(/```mermaid\n([\s\S]*?)```/)?.[1] ?? '';
const noDiagrama = new Set();
for (const m of mermaid.matchAll(/class (\w+) \{([\s\S]*?)\}/g)) {
  if (m[2].includes('<<enumeration>>')) continue;
  noDiagrama.add(m[1]);
  const diag = m[2].trim().split('\n').map((l) => l.trim().split(/\s+/)[1]).filter(Boolean);
  const esc = Object.entries(models[m[1]] ?? {}).filter(([, t]) => !isRelation(t)).map(([f]) => f);
  const ok = diag.length === esc.length && diag.every((f) => esc.includes(f));
  check(`diagrama ${m[1]} = schema`, ok, ok ? '' : `diagrama [${diag}] schema [${esc}]`);
}
for (const model of Object.keys(models)) {
  if (!noDiagrama.has(model)) check(`model ${model} no diagrama`, false);
}

console.log(`\n${falhas === 0 ? 'Conferência OK' : `${falhas} falha(s)`}`);
process.exit(falhas === 0 ? 0 : 1);
