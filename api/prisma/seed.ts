import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { ContentType, CourseLevel, Role } from '../src/generated/prisma/enums';
import { recalculateCourseTotals } from '../src/courses/course-totals';

/**
 * Popula o banco com o catálogo do trabalho-n2 (as trilhas de `Trilhas.tsx`, os
 * cursos de `Home.tsx` e o conteúdo programático de `CourseDetails.tsx`) e com
 * quatro usuários de demonstração (um ADMIN, um instrutor). Também as
 * categorias, com o nível e o instrutor dos cursos. Portado de `web/prisma/seed.ts`.
 *
 * Usuários: upsert por e-mail com `update: {}`. Quem já existe não é alterado
 * (nem nome, nem senha); quem não existe é criado com a senha em bcrypt.
 * Cursos semeados: numa nova execução, os módulos e as aulas deles são
 * recriados, e os totais (TotalAulas, TotalHoras) regravados.
 */

// Curso > Módulo > Aula (LAB03). Cada curso semeado recebe estes módulos; a
// URL de cada aula leva o nome do curso. Duração em minutos.
const MODULOS = [
  {
    title: 'Fundamentos',
    aulas: [
      { title: 'Introdução à Tecnologia', duration: 10, contentType: ContentType.VIDEO },
      { title: 'Configurando o Ambiente', duration: 25, contentType: ContentType.TEXTO },
    ],
  },
  {
    title: 'Prática',
    aulas: [
      { title: 'Primeiros Passos e Conceitos', duration: 45, contentType: ContentType.VIDEO },
      { title: 'Projeto Prático', duration: 120, contentType: ContentType.QUIZ },
    ],
  },
];

// "TypeScript Avançado" → "typescript-avancado"
const slug = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

function modulosDoCurso(titulo: string) {
  return MODULOS.map((modulo, m) => ({
    title: modulo.title,
    order: m + 1,
    lessons: {
      create: modulo.aulas.map((aula, a) => ({
        ...aula,
        order: a + 1,
        contentUrl: `https://example.com/cursos/${slug(titulo)}/modulo-${m + 1}/aula-${a + 1}`,
      })),
    },
  }));
}

// LAB03, Categorias. Cursos e trilhas apontam para elas pelo nome.
const CATEGORIAS = [
  {
    name: 'Desenvolvimento Frontend',
    description: 'Interfaces, navegador e as ferramentas do lado do cliente.',
  },
  {
    name: 'Desenvolvimento Backend',
    description: 'Servidores, APIs, bancos de dados e arquitetura.',
  },
];

const TRILHAS = [
  {
    title: 'Trilha Frontend',
    description: 'HTML, CSS, JS, React e muito mais.',
    categoria: 'Desenvolvimento Frontend',
  },
  {
    title: 'Trilha Backend',
    description: 'Node.js, Bancos de Dados e APIs.',
    categoria: 'Desenvolvimento Backend',
  },
];

const CURSOS = [
  {
    title: 'React para Iniciantes',
    description: 'Aprenda os fundamentos do React, hooks e muito mais.',
    image: '/covers/react.svg',
    priceCents: 9_700,
    trilha: 'Trilha Frontend',
    categoria: 'Desenvolvimento Frontend',
    level: CourseLevel.INICIANTE,
    instrutor: 'instrutor@perero.com',
  },
  {
    title: 'TypeScript Avançado',
    description: 'Domine a tipagem estática no ecossistema JavaScript.',
    image: '/covers/typescript.svg',
    priceCents: 14_700,
    trilha: 'Trilha Frontend',
    categoria: 'Desenvolvimento Frontend',
    level: CourseLevel.AVANCADO,
    instrutor: 'instrutor@perero.com',
  },
  {
    title: 'Design Patterns',
    description: 'Boas práticas e padrões de projeto aplicados na web.',
    image: '/covers/design-patterns.svg',
    priceCents: 19_700,
    trilha: 'Trilha Backend',
    categoria: 'Desenvolvimento Backend',
    level: CourseLevel.INTERMEDIARIO,
    instrutor: null,
  },
];

// Contas de demonstração. Só o admin@perero.com é ADMIN; as outras ficam com o
// padrão do schema (USER).
const USUARIOS = [
  {
    email: 'admin@perero.com',
    name: 'Admin Demo',
    password: 'senha123',
    role: Role.ADMIN,
  },
  { email: 'aluno@perero.com', name: 'Aluno Demo', password: 'senha123' },
  { email: 'joao@email.com', name: 'João Silva', password: 'senha123' },
  // Instrutor de dois cursos. O perfil INSTRUTOR chega na etapa 13; até lá é USER.
  {
    email: 'instrutor@perero.com',
    name: 'Instrutor Demo',
    password: 'senha123',
  },
];

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL não definida');

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

async function main() {
  let criados = 0;
  const usuariosPorEmail = new Map<string, number>();
  for (const usuario of USUARIOS) {
    const existente = await prisma.user.findUnique({
      where: { email: usuario.email },
    });
    const hash = await bcrypt.hash(usuario.password, await bcrypt.genSalt());
    const salvo = await prisma.user.upsert({
      where: { email: usuario.email },
      update: {},
      create: { ...usuario, password: hash },
    });
    usuariosPorEmail.set(salvo.email, salvo.id);
    if (!existente) criados++;
  }

  const categoriasPorNome = new Map<string, number>();
  for (const categoria of CATEGORIAS) {
    const salva = await prisma.category.upsert({
      where: { name: categoria.name },
      update: { description: categoria.description },
      create: categoria,
    });
    categoriasPorNome.set(salva.name, salva.id);
  }

  const trilhasPorTitulo = new Map<string, number>();
  for (const { categoria, ...trilha } of TRILHAS) {
    const dados = {
      ...trilha,
      categoryId: categoriasPorNome.get(categoria) ?? null,
    };
    const existente = await prisma.trilha.findFirst({
      where: { title: trilha.title },
    });
    const salva = existente
      ? await prisma.trilha.update({
          where: { id: existente.id },
          data: dados,
        })
      : await prisma.trilha.create({ data: dados });
    trilhasPorTitulo.set(salva.title, salva.id);
  }

  for (const curso of CURSOS) {
    const { trilha, categoria, instrutor, ...campos } = curso;
    const trilhaId = trilhasPorTitulo.get(trilha) ?? null;
    const dados = {
      ...campos,
      categoryId: categoriasPorNome.get(categoria) ?? null,
      instructorId: instrutor ? (usuariosPorEmail.get(instrutor) ?? null) : null,
    };
    const existente = await prisma.course.findFirst({
      where: { title: dados.title },
    });
    const modules = modulosDoCurso(dados.title);

    // Os módulos (e as aulas) dos cursos semeados são recriados a cada execução.
    const salvo = existente
      ? await prisma.course.update({
          where: { id: existente.id },
          data: { ...dados, trilhaId, modules: { deleteMany: {}, create: modules } },
        })
      : await prisma.course.create({
          data: { ...dados, trilhaId, modules: { create: modules } },
        });

    // Os totais gravados saem da mesma função que a API usa.
    await recalculateCourseTotals(prisma, salvo.id);
  }

  const [usuarios, categorias, trilhas, cursos, modulos, aulas] =
    await Promise.all([
      prisma.user.count(),
      prisma.category.count(),
      prisma.trilha.count(),
      prisma.course.count(),
      prisma.module.count(),
      prisma.lesson.count(),
    ]);

  console.log(
    `Seed concluído: ${criados} usuário(s) novo(s); no banco: ${usuarios} usuários, ${categorias} categorias, ${trilhas} trilhas, ${cursos} cursos, ${modulos} módulos, ${aulas} aulas.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
