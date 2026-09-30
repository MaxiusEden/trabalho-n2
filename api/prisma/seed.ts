import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

/**
 * Popula o banco com o catálogo do trabalho-n2 (as trilhas de `Trilhas.tsx`, os
 * cursos de `Home.tsx` e o conteúdo programático de `CourseDetails.tsx`) e com
 * dois usuários de demonstração. Portado de `web/prisma/seed.ts`.
 *
 * Usuários: upsert por e-mail com `update: {}`. Quem já existe não é alterado
 * (nem nome, nem senha); quem não existe é criado com a senha em bcrypt.
 * Cursos semeados: numa nova execução, as aulas deles são recriadas.
 */

const CONTEUDO_PROGRAMATICO = [
  { title: 'Introdução à Tecnologia', duration: 10 },
  { title: 'Configurando o Ambiente', duration: 25 },
  { title: 'Primeiros Passos e Conceitos', duration: 45 },
  { title: 'Projeto Prático', duration: 120 },
];

const TRILHAS = [
  {
    title: 'Trilha Frontend',
    description: 'HTML, CSS, JS, React e muito mais.',
  },
  { title: 'Trilha Backend', description: 'Node.js, Bancos de Dados e APIs.' },
];

const CURSOS = [
  {
    title: 'React para Iniciantes',
    description: 'Aprenda os fundamentos do React, hooks e muito mais.',
    image: '/covers/react.svg',
    priceCents: 9_700,
    trilha: 'Trilha Frontend',
  },
  {
    title: 'TypeScript Avançado',
    description: 'Domine a tipagem estática no ecossistema JavaScript.',
    image: '/covers/typescript.svg',
    priceCents: 14_700,
    trilha: 'Trilha Frontend',
  },
  {
    title: 'Design Patterns',
    description: 'Boas práticas e padrões de projeto aplicados na web.',
    image: '/covers/design-patterns.svg',
    priceCents: 19_700,
    trilha: 'Trilha Backend',
  },
];

const USUARIOS = [
  { email: 'aluno@perero.com', name: 'Aluno Demo', password: 'senha123' },
  { email: 'joao@email.com', name: 'João Silva', password: 'senha123' },
];

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL não definida');

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

async function main() {
  let criados = 0;
  for (const usuario of USUARIOS) {
    const existente = await prisma.user.findUnique({
      where: { email: usuario.email },
    });
    const hash = await bcrypt.hash(usuario.password, await bcrypt.genSalt());
    await prisma.user.upsert({
      where: { email: usuario.email },
      update: {},
      create: { ...usuario, password: hash },
    });
    if (!existente) criados++;
  }

  const trilhasPorTitulo = new Map<string, number>();
  for (const trilha of TRILHAS) {
    const existente = await prisma.trilha.findFirst({
      where: { title: trilha.title },
    });
    const salva = existente
      ? await prisma.trilha.update({
          where: { id: existente.id },
          data: trilha,
        })
      : await prisma.trilha.create({ data: trilha });
    trilhasPorTitulo.set(salva.title, salva.id);
  }

  for (const curso of CURSOS) {
    const { trilha, ...dados } = curso;
    const trilhaId = trilhasPorTitulo.get(trilha) ?? null;
    const existente = await prisma.course.findFirst({
      where: { title: dados.title },
    });
    const aulas = CONTEUDO_PROGRAMATICO.map((aula, index) => ({
      ...aula,
      order: index + 1,
    }));

    if (existente) {
      await prisma.course.update({
        where: { id: existente.id },
        data: {
          ...dados,
          trilhaId,
          lessons: { deleteMany: {}, create: aulas },
        },
      });
    } else {
      await prisma.course.create({
        data: { ...dados, trilhaId, lessons: { create: aulas } },
      });
    }
  }

  const [usuarios, trilhas, cursos, aulas] = await Promise.all([
    prisma.user.count(),
    prisma.trilha.count(),
    prisma.course.count(),
    prisma.lesson.count(),
  ]);

  console.log(
    `Seed concluído: ${criados} usuário(s) novo(s); no banco: ${usuarios} usuários, ${trilhas} trilhas, ${cursos} cursos, ${aulas} aulas.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
