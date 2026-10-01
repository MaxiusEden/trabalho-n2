-- Etapa 11: Curso > Módulo > Aula (LAB03). Escrita à mão porque a versão gerada
-- pelo Prisma apagaria Lesson.courseId antes de mover as aulas. Ordem: cria o
-- que é novo, cria um "Módulo 1" por curso, move as aulas para ele, só então
-- remove a coluna antiga, e grava os totais a partir das aulas movidas.

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('VIDEO', 'TEXTO', 'QUIZ');

-- CreateTable
CREATE TABLE "Module" (
    "id" SERIAL NOT NULL,
    "courseId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Module_courseId_idx" ON "Module"("courseId");
CREATE UNIQUE INDEX "Module_courseId_order_key" ON "Module"("courseId", "order");
ALTER TABLE "Module" ADD CONSTRAINT "Module_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Totais gravados no curso
ALTER TABLE "Course" ADD COLUMN "totalLessons" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "totalHours" DECIMAL(6,2) NOT NULL DEFAULT 0;

-- Colunas novas da aula (moduleId ainda opcional, até as aulas serem movidas)
ALTER TABLE "Lesson" ADD COLUMN "moduleId" INTEGER,
ADD COLUMN "contentType" "ContentType" NOT NULL DEFAULT 'VIDEO',
ADD COLUMN "contentUrl" TEXT;

-- Um "Módulo 1" em cada curso
INSERT INTO "Module" ("courseId", "title", "order", "updatedAt")
SELECT "id", 'Módulo 1', 1, CURRENT_TIMESTAMP FROM "Course";

-- As aulas atuais vão para o "Módulo 1" do curso delas, com a mesma ordem
UPDATE "Lesson" AS l
SET "moduleId" = m."id"
FROM "Module" AS m
WHERE m."courseId" = l."courseId" AND m."order" = 1;

-- Agora moduleId é obrigatório e a ligação antiga com o curso sai
ALTER TABLE "Lesson" ALTER COLUMN "moduleId" SET NOT NULL;
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_courseId_fkey";
DROP INDEX "Lesson_courseId_order_key";
DROP INDEX "Lesson_courseId_idx";
ALTER TABLE "Lesson" DROP COLUMN "courseId";
CREATE INDEX "Lesson_moduleId_idx" ON "Lesson"("moduleId");
CREATE UNIQUE INDEX "Lesson_moduleId_order_key" ON "Lesson"("moduleId", "order");
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Totais a partir das aulas (horas decimais, 2 casas)
UPDATE "Course" AS c
SET "totalLessons" = t."quantidade",
    "totalHours" = ROUND(t."minutos" / 60.0, 2)
FROM (
  SELECT m."courseId", COUNT(l."id") AS "quantidade", COALESCE(SUM(l."duration"), 0) AS "minutos"
  FROM "Module" AS m
  LEFT JOIN "Lesson" AS l ON l."moduleId" = m."id"
  GROUP BY m."courseId"
) AS t
WHERE t."courseId" = c."id";
