# Perero Cursos

Plataforma de cursos e trilhas de aprendizado. O repositório é um monorepo; cada
pasta tem o seu `package.json` e roda sozinha:

```
web/    Next.js (App Router), o frontend
docs/   PDFs da disciplina e diagramas
```

A pasta `api/` (NestJS + Prisma + PostgreSQL + Swagger) entra no próximo passo da
migração. Até lá o `web/` tem as próprias Route Handlers e um banco SQLite.

| Pasta  | Porta | Endereço                  |
| ------ | ----- | ------------------------- |
| `web/` | 3001  | <http://localhost:3001>   |

A porta 3000 fica reservada para o Nest.

## web/ — frontend Next.js

```bash
cd web
npm install
npm run setup
npm run dev
```

`setup` aplica as migrations, gera o Prisma Client e popula o banco. A aplicação sobe
em <http://localhost:3001>.

O banco do `web/` é um **SQLite em arquivo** (`web/prisma/dev.db`). A conexão fica em
`web/.env`:

```
DATABASE_URL="file:./prisma/dev.db"
```

O CRUD segue a estrutura do PDF *CRUD - NestJS*, com cada camada do NestJS traduzida
para o equivalente do Next.js:

| PDF (NestJS)                          | Aqui (Next.js)                                               |
| ------------------------------------- | ------------------------------------------------------------ |
| `PrismaService`                       | [`web/src/lib/prisma.ts`](web/src/lib/prisma.ts) (singleton)  |
| DTOs com `class-validator`            | `web/src/lib/<recurso>/dto/*.dto.ts`                          |
| `ValidationPipe` global               | [`validateDto`](web/src/lib/http/validation.ts)               |
| `UsersService`                        | `web/src/lib/<recurso>/*.service.ts`                          |
| `UsersController` (REST)              | Route Handlers em `web/src/app/api/**/route.ts`               |
| Swagger em `/api`                     | Documentação da API em `/api`                                 |

### Usuários semeados

| E-mail             | Senha      |
| ------------------ | ---------- |
| `aluno@perero.com` | `senha123` |
| `joao@email.com`   | `senha123` |

### Scripts (dentro de `web/`)

| Script               | O que faz                                          |
| -------------------- | -------------------------------------------------- |
| `npm run dev`        | Servidor de desenvolvimento na porta 3001          |
| `npm run build`      | Build de produção                                  |
| `npm start`          | Sobe o build de produção na porta 3001             |
| `npm run typecheck`  | `tsc --noEmit`                                     |
| `npm run lint`       | ESLint                                             |
| `npm run db:migrate` | Cria/aplica migrations (`prisma migrate dev`)      |
| `npm run db:seed`    | Popula o banco                                     |
| `npm run db:reset`   | Apaga o banco, reaplica as migrations e re-semeia  |
| `npm run db:studio`  | Abre o Prisma Studio                               |

### Telas

| Rota                  | O que é                                                          |
| --------------------- | ---------------------------------------------------------------- |
| `/`                   | Catálogo de cursos                                               |
| `/curso/[id]`         | Detalhe do curso, conteúdo programático e matrícula              |
| `/trilhas`            | Trilhas de aprendizado                                           |
| `/trilhas/[id]`       | Cursos de uma trilha                                             |
| `/login`              | Login conferido contra a tabela `User`                           |
| `/admin/usuarios`     | CRUD de usuários                                                 |
| `/admin/cursos`       | CRUD de cursos, com trilha e aulas                               |
| `/admin/trilhas`      | CRUD de trilhas                                                  |
| `/admin/matriculas`   | CRUD de matrículas                                               |
| `/api`                | Documentação da API                                              |

### Modelo de dados

```
User 1──n Enrollment n──1 Course n──1 Trilha
                              │
                              └──n Lesson
```

- `User.email` é único.
- `Enrollment` tem índice único em `(userId, courseId)` — o banco impede matrícula duplicada.
- `Lesson` tem índice único em `(courseId, order)`; a ordem vem da posição no formulário.
- Apagar um curso apaga aulas e matrículas em cascata.
- Apagar uma trilha **não** apaga os cursos: eles ficam com `trilhaId = null`.
- O "Módulos: N" das trilhas é derivado da contagem de cursos, nunca armazenado.

### Observação de segurança

Seguindo o PDF, a senha é gravada **em texto puro** (`data: createUserDto`). Ela nunca é
devolvida pela API, mas antes de usar isso para valer o `password` precisa passar por hash.
O login também é apenas uma conferência de credenciais: não emite cookie de sessão nem
token, e as rotas de `/admin` e da API não são protegidas.

## VS Code

`.vscode/settings.json` aponta a extensão do ESLint para `web/` e `api/`, para que cada
pasta use a própria configuração.
