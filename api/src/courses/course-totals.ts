import { Prisma } from '../generated/prisma/client';

/** Minutos → horas decimais com 2 casas (LAB03, Cursos.TotalHoras). */
export function hoursFromMinutes(minutes: number): Prisma.Decimal {
  return new Prisma.Decimal(minutes)
    .div(60)
    .toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
}

/**
 * Recalcula e grava `totalLessons` e `totalHours` do curso a partir das aulas
 * de todos os módulos dele. Recebe o cliente da transação (`tx`), para rodar na
 * mesma transação que criou, alterou ou excluiu o módulo ou a aula. A leitura
 * nunca recalcula: só lê o valor gravado.
 */
export async function recalculateCourseTotals(
  tx: Prisma.TransactionClient,
  courseId: number,
) {
  const totals = await tx.lesson.aggregate({
    where: { module: { courseId } },
    _count: { _all: true },
    _sum: { duration: true },
  });

  return tx.course.update({
    where: { id: courseId },
    data: {
      totalLessons: totals._count._all,
      totalHours: hoursFromMinutes(totals._sum.duration ?? 0),
    },
    select: { id: true, totalLessons: true, totalHours: true },
  });
}
