# Perero Cursos

Plataforma de cursos e trilhas de aprendizado. O repositório é um monorepo; cada
pasta tem o seu `package.json`:

```
api/    NestJS 11 + Prisma + PostgreSQL + Swagger + JWT — dona do banco
web/    Next.js (App Router), o frontend; consome a api/
docs/   PDFs da disciplina e diagramas
```

| Pasta  | Porta | Endereço                                       |
| ------ | ----- | ---------------------------------------------- |
| `api/` | 3000  | <http://localhost:3000/api> (Swagger)          |
| `web/` | 3001  | <http://localhost:3001>                        |
| `api/` | 5555  | <http://localhost:5555> (Prisma Studio, `npm run db:studio`) |

O `web/` não tem banco próprio: todas as telas leem e gravam pela API do Nest, que
grava no PostgreSQL. O login do site é o mesmo `POST /auth/login` do Swagger.

## Como rodar

Precisa de um PostgreSQL local em `localhost:5432`. A demonstração usa **três
terminais**, nesta ordem: a API, o frontend e o Prisma Studio.

**1. API** — crie `api/.env` (fora do Git) com a `DATABASE_URL` da seção 2 do PDF
(`docs/CRUD - NestJS.pdf`), apontando para o banco `DBdev` com o usuário e a senha
do seu Postgres, e um `JWT_SECRET`:

```
DATABASE_URL="postgresql://USUARIO:SENHA@localhost:5432/DBdev?schema=public"
JWT_SECRET="<chave longa e aleatória>"
```

```bash
cd api
npm install
npx prisma migrate dev
npx prisma generate
npm run db:seed
npm run start:dev
```

**2. Frontend**:

```bash
cd web
npm install
npm run dev
```

**3. Prisma Studio** (para mostrar os dados gravados no PostgreSQL):

```bash
cd api
npm run db:studio
```

Ele abre em <http://localhost:5555>. O link "Banco de dados" da administração do
site aponta para lá, mas só funciona com este terminal rodando.

O `web/` chama a API em `http://localhost:3000`. Para outro endereço, defina
`NEXT_PUBLIC_API_URL` em `web/.env`.

## Roteiro de demonstração

1. **Plataforma funcionando**: em <http://localhost:3001>, "Entrar" → "Criar conta".
   O cadastro chama `POST /users` e já faz o login. Abrir um curso e clicar em
   "Matricular-se".
2. **Dados salvos na persistência**: no terceiro terminal, o Prisma Studio
   (`npm run db:studio` em `api/`) mostra as tabelas do PostgreSQL. O usuário novo aparece em `User`,
   com a senha em hash bcrypt (`$2b$10$...`), e a matrícula aparece em `Enrollment`.
   Entrando com a conta admin, o mesmo aparece no site em Administração → Matrículas.
3. **Token no Swagger**: em <http://localhost:3000/api>, `GET /users` sem token dá
   401. `POST /auth/login` com o usuário criado no passo 1 devolve o
   `access_token`; colar em "Authorize" e repetir o `GET /users`: 200.

Contas do seed (senha `senha123`, dados de demonstração; usuário que já existe não
é alterado pelo seed):

| E-mail             | Perfil  |
| ------------------ | ------- |
| `admin@perero.com` | `ADMIN` |
| `aluno@perero.com` | `USER`  |
| `joao@email.com`   | `USER`  |

Todo cadastro novo nasce `USER`. Uma conta só vira `ADMIN` pelo seed ou pelo Prisma
Studio: nenhuma rota aceita `role` no corpo.

## api/ — NestJS

A `api/` usa **NestJS 11 de propósito**: é a versão do template que os PDFs da
disciplina seguem (CommonJS, imports sem extensão, ESLint, Jest). O template do
Nest 12 é ESM e quebra o `moduleFormat = "cjs"` do Prisma que o PDF pede. Os
geradores rodam com o CLI local: `npx nest generate ...` dentro de `api/`. Sem
`JWT_SECRET` a API não sobe, de propósito (PDF "JWT - Autenticação").

| Rota                                          | Acesso                                               |
| --------------------------------------------- | ---------------------------------------------------- |
| `POST /auth/login`                            | público; devolve o token (com `sub`, `email`, `role`) |
| `POST /users`                                 | público (cadastro); não aceita `role`                |
| `GET /users[/:id]`                            | qualquer usuário logado (como no PDF)                |
| `PATCH`, `DELETE /users/:id`                  | a própria conta, ou ADMIN                            |
| `GET /trilhas[/:id]`, `GET /courses[/:id]`    | público (catálogo)                                   |
| `POST`, `PATCH`, `DELETE` de trilhas e cursos | só ADMIN                                             |
| `POST /enrollments`                           | qualquer usuário logado; a matrícula é do dono do token |
| `GET /enrollments[/:id]`, `DELETE /enrollments/:id` | USER: só as próprias; ADMIN: todas             |

- A senha é gravada com bcrypt e nunca sai nas respostas.
- Erros: dados inválidos ou campo extra no corpo → 400; id não numérico → 400;
  registro inexistente → 404; e-mail repetido ou matrícula duplicada → 409;
  referência a trilha ou curso inexistente → 400.
- Sem login → 401; logado sem permissão → 403. O perfil vem do token: trocar o
  perfil de uma conta só vale depois de um novo login (até 1h).
- CORS liberado só para o frontend (`http://localhost:3001`).
- Limitação conhecida: a listagem e a busca de usuários (`GET /users`,
  `GET /users/:id`) ficam abertas a qualquer usuário logado, porque é o que o
  roteiro "Como Testar" do PDF "JWT - Autenticação" usa.

Scripts (dentro de `api/`): `npm run start:dev`, `npm run build`,
`npm run typecheck`, `npm run lint`, `npm test`, `npm run db:seed`,
`npm run db:studio`.

## web/ — frontend Next.js

Todo HTTP passa por [`web/src/lib/api-client.ts`](web/src/lib/api-client.ts), o único
`fetch` do frontend; as rotas tipadas ficam em [`web/src/lib/api.ts`](web/src/lib/api.ts).

- **Sessão**: o `access_token` do `POST /auth/login` fica num cookie com a validade
  do token (1h). O navegador o envia como `Authorization: Bearer` nas chamadas ao
  Nest, e as páginas do servidor fazem o mesmo com o token lido do cookie. Sair
  apaga o token. Um 401 da API manda para `/login`.
- **Administração**: só para ADMIN. O link aparece só para essa conta; um USER que
  abrir `/admin` direto vê "Acesso negado" (e a API recusa com 403). Sem login,
  `/admin` manda para `/login`.

| Rota                  | O que é                                                   |
| --------------------- | --------------------------------------------------------- |
| `/`                   | Catálogo de cursos                                        |
| `/curso/[id]`         | Detalhe do curso, conteúdo programático e matrícula       |
| `/trilhas`            | Trilhas de aprendizado                                    |
| `/trilhas/[id]`       | Cursos de uma trilha                                      |
| `/login`, `/cadastro` | Login (`POST /auth/login`) e cadastro (`POST /users`)     |
| `/admin/usuarios`     | CRUD de usuários                                          |
| `/admin/cursos`       | CRUD de cursos, com trilha e aulas                        |
| `/admin/trilhas`      | CRUD de trilhas                                           |
| `/admin/matriculas`   | Consulta e cancelamento de matrículas                     |

Scripts (dentro de `web/`): `npm run dev` (porta 3001), `npm run build`,
`npm start`, `npm run typecheck`, `npm run lint`.

## Modelo de dados

```
User 1──n Enrollment n──1 Course n──1 Trilha
                              │
                              └──n Lesson
```

- `User.email` é único.
- `Enrollment` tem índice único em `(userId, courseId)`: o banco impede matrícula duplicada.
- `Lesson` tem índice único em `(courseId, order)`; a ordem vem da posição no formulário.
- Apagar um curso apaga aulas e matrículas em cascata.
- Apagar uma trilha **não** apaga os cursos: eles ficam com `trilhaId = null`.
- O número de cursos de uma trilha é derivado da contagem, nunca armazenado.

## VS Code

`.vscode/settings.json` aponta a extensão do ESLint para `web/` e `api/`, para que cada
pasta use a própria configuração.
