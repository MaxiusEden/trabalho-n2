# Perero Cursos

Plataforma de cursos e trilhas de aprendizado. O repositório é um monorepo; cada
pasta tem o seu `package.json` e roda sozinha:

```
api/    NestJS 11 + Prisma + PostgreSQL + Swagger — segue o PDF "CRUD - NestJS"
web/    Next.js (App Router), o frontend
docs/   PDFs da disciplina e diagramas
```

A migração está em andamento: a `api/` tem por enquanto só o recurso `users`, e o
`web/` ainda usa as próprias Route Handlers e um banco SQLite. Os dois bancos são
separados até o `web/` passar a consumir a API do Nest.

| Pasta  | Porta | Endereço                                       |
| ------ | ----- | ---------------------------------------------- |
| `api/` | 3000  | <http://localhost:3000/api> (Swagger)          |
| `web/` | 3001  | <http://localhost:3001>                        |

## api/ — NestJS

Precisa de um PostgreSQL local em `localhost:5432`. Crie `api/.env` (fora do Git)
com a `DATABASE_URL` da seção 2 do PDF (`docs/CRUD - NestJS.pdf`), apontando para o
banco `DBdev` com o usuário e a senha do seu Postgres:

```
DATABASE_URL="postgresql://USUARIO:SENHA@localhost:5432/DBdev?schema=public"
```

```bash
cd api
npm install
npx prisma migrate dev
npx prisma generate
npm run start:dev
```

O `migrate dev` cria o banco `DBdev` se ele não existir. A documentação interativa
fica em <http://localhost:3000/api>.

A `api/` usa **NestJS 11 de propósito**: é a versão do template que os PDFs da
disciplina seguem (CommonJS, imports sem extensão, ESLint, Jest). O template do
Nest 12 é ESM e quebra o `moduleFormat = "cjs"` do Prisma que o PDF pede. Os
geradores rodam com o CLI local: `npx nest generate ...` dentro de `api/`.

| Rota                 | O que faz               |
| -------------------- | ----------------------- |
| `POST /users`        | Cria um usuário         |
| `GET /users`         | Lista os usuários       |
| `GET /users/:id`     | Busca um usuário        |
| `PATCH /users/:id`   | Atualiza um usuário     |
| `DELETE /users/:id`  | Remove um usuário       |

Scripts (dentro de `api/`): `npm run start:dev`, `npm run build`,
`npm run typecheck`, `npm run lint`, `npm test`.

Como no PDF, a senha ainda é gravada e devolvida em texto puro, e e-mail repetido
devolve 500. As próximas etapas tratam isso (erros do Prisma, `omit` da senha e
bcrypt).

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
