import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';
import { recalculateCourseTotals } from '../courses/course-totals';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';

const moduleSelect = {
  id: true,
  courseId: true,
  title: true,
  order: true,
  lessons: {
    orderBy: { order: 'asc' },
    select: {
      id: true,
      title: true,
      contentType: true,
      contentUrl: true,
      duration: true,
      order: true,
    },
  },
} satisfies Prisma.ModuleSelect;

// Ordem repetida no mesmo curso (`@@unique([courseId, order])`).
function orderConflict(error: unknown, order: number | undefined): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  ) {
    throw new ConflictException(
      `Já existe um módulo ${order === undefined ? 'nessa posição' : `na posição ${order}`} deste curso`,
    );
  }
  throw error;
}

@Injectable()
export class ModulesService {
  constructor(private prisma: PrismaService) {}

  // Toda escrita recalcula os totais do curso na mesma transação (decisão de
  // 30/09/2026), mesmo quando o módulo não tem aulas.
  async create(courseId: number, dto: CreateModuleDto) {
    return this.prisma
      .$transaction(async (tx) => {
        const course = await tx.course.findUnique({
          where: { id: courseId },
          select: { id: true },
        });
        if (!course)
          throw new NotFoundException(`Curso ${courseId} não encontrado`);

        const order = dto.order ?? (await nextOrder(tx, courseId));
        const created = await tx.module.create({
          data: { courseId, title: dto.title, order },
          select: moduleSelect,
        });
        await recalculateCourseTotals(tx, courseId);
        return created;
      })
      .catch((error: unknown) => orderConflict(error, dto.order));
  }

  async update(id: number, dto: UpdateModuleDto) {
    return this.prisma
      .$transaction(async (tx) => {
        const updated = await tx.module.update({
          where: { id },
          data: dto,
          select: moduleSelect,
        });
        await recalculateCourseTotals(tx, updated.courseId);
        return updated;
      })
      .catch((error: unknown) => orderConflict(error, dto.order));
  }

  // As aulas do módulo saem junto (`onDelete: Cascade`); os totais caem.
  async remove(id: number) {
    return this.prisma.$transaction(async (tx) => {
      const removed = await tx.module.delete({
        where: { id },
        select: moduleSelect,
      });
      await recalculateCourseTotals(tx, removed.courseId);
      return removed;
    });
  }
}

async function nextOrder(tx: Prisma.TransactionClient, courseId: number) {
  const { _max } = await tx.module.aggregate({
    where: { courseId },
    _max: { order: true },
  });
  return (_max.order ?? 0) + 1;
}
