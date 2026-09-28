/*
  Warnings:

  - You are about to drop the `Course` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Enrollment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Lesson` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Trilha` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Course";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Enrollment";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Lesson";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Trilha";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "User";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Usuarios" (
    "ID_Usuario" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "NomeCompleto" TEXT NOT NULL,
    "Email" TEXT NOT NULL,
    "SenhaHash" TEXT NOT NULL,
    "DataCadastro" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Categorias" (
    "ID_Categoria" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Nome" TEXT NOT NULL,
    "Descricao" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Cursos" (
    "ID_Curso" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Titulo" TEXT NOT NULL,
    "Descricao" TEXT NOT NULL,
    "ID_Instrutor" INTEGER,
    "ID_Categoria" INTEGER,
    "Nivel" TEXT NOT NULL DEFAULT 'INICIANTE',
    "DataPublicacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "TotalAulas" INTEGER NOT NULL DEFAULT 0,
    "TotalHoras" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "Cursos_ID_Instrutor_fkey" FOREIGN KEY ("ID_Instrutor") REFERENCES "Usuarios" ("ID_Usuario") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Cursos_ID_Categoria_fkey" FOREIGN KEY ("ID_Categoria") REFERENCES "Categorias" ("ID_Categoria") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Modulos" (
    "ID_Modulo" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ID_Curso" INTEGER NOT NULL,
    "Titulo" TEXT NOT NULL,
    "Ordem" INTEGER NOT NULL,
    CONSTRAINT "Modulos_ID_Curso_fkey" FOREIGN KEY ("ID_Curso") REFERENCES "Cursos" ("ID_Curso") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Aulas" (
    "ID_Aula" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ID_Modulo" INTEGER NOT NULL,
    "Titulo" TEXT NOT NULL,
    "TipoConteudo" TEXT NOT NULL DEFAULT 'VIDEO',
    "URL_Conteudo" TEXT NOT NULL,
    "DuracaoMinutos" INTEGER NOT NULL,
    "Ordem" INTEGER NOT NULL,
    CONSTRAINT "Aulas_ID_Modulo_fkey" FOREIGN KEY ("ID_Modulo") REFERENCES "Modulos" ("ID_Modulo") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Matriculas" (
    "ID_Matricula" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ID_Usuario" INTEGER NOT NULL,
    "ID_Curso" INTEGER NOT NULL,
    "DataMatricula" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "DataConclusao" DATETIME,
    CONSTRAINT "Matriculas_ID_Usuario_fkey" FOREIGN KEY ("ID_Usuario") REFERENCES "Usuarios" ("ID_Usuario") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Matriculas_ID_Curso_fkey" FOREIGN KEY ("ID_Curso") REFERENCES "Cursos" ("ID_Curso") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Progresso_Aulas" (
    "ID_Usuario" INTEGER NOT NULL,
    "ID_Aula" INTEGER NOT NULL,
    "DataConclusao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Status" TEXT NOT NULL DEFAULT 'CONCLUIDO',

    PRIMARY KEY ("ID_Usuario", "ID_Aula"),
    CONSTRAINT "Progresso_Aulas_ID_Usuario_fkey" FOREIGN KEY ("ID_Usuario") REFERENCES "Usuarios" ("ID_Usuario") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Progresso_Aulas_ID_Aula_fkey" FOREIGN KEY ("ID_Aula") REFERENCES "Aulas" ("ID_Aula") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Avaliacoes" (
    "ID_Avaliacao" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ID_Usuario" INTEGER NOT NULL,
    "ID_Curso" INTEGER NOT NULL,
    "Nota" INTEGER NOT NULL,
    "Comentario" TEXT,
    "DataAvaliacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Avaliacoes_ID_Usuario_fkey" FOREIGN KEY ("ID_Usuario") REFERENCES "Usuarios" ("ID_Usuario") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Avaliacoes_ID_Curso_fkey" FOREIGN KEY ("ID_Curso") REFERENCES "Cursos" ("ID_Curso") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Trilhas" (
    "ID_Trilha" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Titulo" TEXT NOT NULL,
    "Descricao" TEXT NOT NULL,
    "ID_Categoria" INTEGER,
    CONSTRAINT "Trilhas_ID_Categoria_fkey" FOREIGN KEY ("ID_Categoria") REFERENCES "Categorias" ("ID_Categoria") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Trilhas_Cursos" (
    "ID_Trilha" INTEGER NOT NULL,
    "ID_Curso" INTEGER NOT NULL,
    "Ordem" INTEGER NOT NULL,

    PRIMARY KEY ("ID_Trilha", "ID_Curso"),
    CONSTRAINT "Trilhas_Cursos_ID_Trilha_fkey" FOREIGN KEY ("ID_Trilha") REFERENCES "Trilhas" ("ID_Trilha") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Trilhas_Cursos_ID_Curso_fkey" FOREIGN KEY ("ID_Curso") REFERENCES "Cursos" ("ID_Curso") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Certificados" (
    "ID_Certificado" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ID_Usuario" INTEGER NOT NULL,
    "ID_Curso" INTEGER NOT NULL,
    "ID_Trilha" INTEGER,
    "CodigoVerificacao" TEXT NOT NULL,
    "DataEmissao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Certificados_ID_Usuario_fkey" FOREIGN KEY ("ID_Usuario") REFERENCES "Usuarios" ("ID_Usuario") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Certificados_ID_Curso_fkey" FOREIGN KEY ("ID_Curso") REFERENCES "Cursos" ("ID_Curso") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Certificados_ID_Trilha_fkey" FOREIGN KEY ("ID_Trilha") REFERENCES "Trilhas" ("ID_Trilha") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Planos" (
    "ID_Plano" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Nome" TEXT NOT NULL,
    "Descricao" TEXT NOT NULL,
    "Preco" REAL NOT NULL,
    "DuracaoMeses" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Assinaturas" (
    "ID_Assinatura" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ID_Usuario" INTEGER NOT NULL,
    "ID_Plano" INTEGER NOT NULL,
    "DataInicio" DATETIME NOT NULL,
    "DataFim" DATETIME NOT NULL,
    CONSTRAINT "Assinaturas_ID_Usuario_fkey" FOREIGN KEY ("ID_Usuario") REFERENCES "Usuarios" ("ID_Usuario") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Assinaturas_ID_Plano_fkey" FOREIGN KEY ("ID_Plano") REFERENCES "Planos" ("ID_Plano") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pagamentos" (
    "ID_Pagamento" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ID_Assinatura" INTEGER NOT NULL,
    "ValorPago" REAL NOT NULL,
    "DataPagamento" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "MetodoPagamento" TEXT NOT NULL,
    "Id_Transacao_Gateway" TEXT NOT NULL,
    "DataFim" DATETIME NOT NULL,
    CONSTRAINT "Pagamentos_ID_Assinatura_fkey" FOREIGN KEY ("ID_Assinatura") REFERENCES "Assinaturas" ("ID_Assinatura") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuarios_Email_key" ON "Usuarios"("Email");

-- CreateIndex
CREATE UNIQUE INDEX "Categorias_Nome_key" ON "Categorias"("Nome");

-- CreateIndex
CREATE INDEX "Cursos_ID_Instrutor_idx" ON "Cursos"("ID_Instrutor");

-- CreateIndex
CREATE INDEX "Cursos_ID_Categoria_idx" ON "Cursos"("ID_Categoria");

-- CreateIndex
CREATE INDEX "Modulos_ID_Curso_idx" ON "Modulos"("ID_Curso");

-- CreateIndex
CREATE UNIQUE INDEX "Modulos_ID_Curso_Ordem_key" ON "Modulos"("ID_Curso", "Ordem");

-- CreateIndex
CREATE INDEX "Aulas_ID_Modulo_idx" ON "Aulas"("ID_Modulo");

-- CreateIndex
CREATE UNIQUE INDEX "Aulas_ID_Modulo_Ordem_key" ON "Aulas"("ID_Modulo", "Ordem");

-- CreateIndex
CREATE INDEX "Matriculas_ID_Usuario_idx" ON "Matriculas"("ID_Usuario");

-- CreateIndex
CREATE INDEX "Matriculas_ID_Curso_idx" ON "Matriculas"("ID_Curso");

-- CreateIndex
CREATE UNIQUE INDEX "Matriculas_ID_Usuario_ID_Curso_key" ON "Matriculas"("ID_Usuario", "ID_Curso");

-- CreateIndex
CREATE INDEX "Progresso_Aulas_ID_Aula_idx" ON "Progresso_Aulas"("ID_Aula");

-- CreateIndex
CREATE INDEX "Avaliacoes_ID_Usuario_idx" ON "Avaliacoes"("ID_Usuario");

-- CreateIndex
CREATE INDEX "Avaliacoes_ID_Curso_idx" ON "Avaliacoes"("ID_Curso");

-- CreateIndex
CREATE INDEX "Trilhas_ID_Categoria_idx" ON "Trilhas"("ID_Categoria");

-- CreateIndex
CREATE INDEX "Trilhas_Cursos_ID_Curso_idx" ON "Trilhas_Cursos"("ID_Curso");

-- CreateIndex
CREATE UNIQUE INDEX "Trilhas_Cursos_ID_Trilha_Ordem_key" ON "Trilhas_Cursos"("ID_Trilha", "Ordem");

-- CreateIndex
CREATE UNIQUE INDEX "Certificados_CodigoVerificacao_key" ON "Certificados"("CodigoVerificacao");

-- CreateIndex
CREATE INDEX "Certificados_ID_Usuario_idx" ON "Certificados"("ID_Usuario");

-- CreateIndex
CREATE INDEX "Certificados_ID_Curso_idx" ON "Certificados"("ID_Curso");

-- CreateIndex
CREATE INDEX "Certificados_ID_Trilha_idx" ON "Certificados"("ID_Trilha");

-- CreateIndex
CREATE INDEX "Assinaturas_ID_Usuario_idx" ON "Assinaturas"("ID_Usuario");

-- CreateIndex
CREATE INDEX "Assinaturas_ID_Plano_idx" ON "Assinaturas"("ID_Plano");

-- CreateIndex
CREATE INDEX "Pagamentos_ID_Assinatura_idx" ON "Pagamentos"("ID_Assinatura");
