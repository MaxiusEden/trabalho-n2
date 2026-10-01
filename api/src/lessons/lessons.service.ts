import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';
import { recalculateCourseTotals } from '../courses/course-totals';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

const lessonSelect = {
  id: true,
  moduleId: true,
  title: true,
  contentType: true,
  contentUrl: true,
  duration: true,
  order: true,
  module: { select: { courseId: true } },
} satisfies Prisma.LessonSelect;

// Ordem repetida no mesmo módulo (`@@unique([moduleId, order])`).
function orderConflict(error: unknown, order: number | undefined): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  ) {
    throw new ConflictException(
      `Já existe uma aula ${order === undefined ? 'nessa posição' : `na posição ${order}`} deste módulo`,
    );
  }
  throw error;
}

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

  // Criar, alterar e excluir aula: a escrita e o recálculo de TotalAulas e
  // TotalHoras do curso acontecem na mesma transação.
  async create(moduleId: number, dto: CreateLessonDto) {
    return this.prisma
      .$transaction(async (tx) => {
        const module = await tx.module.findUnique({
          where: { id: moduleId },
          select: { courseId: true },
        });
        if (!module)
          throw new NotFoundException(`Módulo ${moduleId} não encontrado`);

        const order = dto.order ?? (await nextOrder(tx, moduleId));
        const created = await tx.lesson.create({
          data: { ...dto, moduleId, order },
          select: lessonSelect,
        });
        await recalculateCourseTotals(tx, module.courseId);
        return created;
      })
      .catch((error: unknown) => orderConflict(error, dto.order));
  }

  async update(id: number, dto: UpdateLessonDto) {
    return this.prisma
      .$transaction(async (tx) => {
        const updated = await tx.lesson.update({
          where: { id },
          data: dto,
          select: lessonSelect,
        });
        await recalculateCourseTotals(tx, updated.module.courseId);
        return updated;
      })
      .catch((error: unknown) => orderConflict(error, dto.order));
  }

  async remove(id: number) {
    return this.prisma.$transaction(async (tx) => {
      const removed = await tx.lesson.delete({
        where: { id },
        select: lessonSelect,
      });
      await recalculateCourseTotals(tx, removed.module.courseId);
      return removed;
    });
  }
}

async function nextOrder(tx: Prisma.TransactionClient, moduleId: number) {
  const { _max } = await tx.lesson.aggregate({
    where: { moduleId },
    _max: { order: true },
  });
  return (_max.order ?? 0) + 1;
}
