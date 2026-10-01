import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { LessonsService } from './lessons.service';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';

type LessonRow = {
  id: number;
  moduleId: number;
  title: string;
  duration: number;
  order: number;
};

/**
 * Banco em memória com só o que o LessonsService usa: um curso (7) com dois
 * módulos (1 e 2), e as consultas `aggregate` do recálculo e da próxima ordem.
 * `transactions` conta quantas vezes o service abriu transação.
 */
function fakeDatabase() {
  const modules = [
    { id: 1, courseId: 7 },
    { id: 2, courseId: 7 },
  ];
  const lessons: LessonRow[] = [];
  const course = { totalLessons: 0, totalHours: new Prisma.Decimal(0) };
  let nextId = 0;
  let transactions = 0;

  const withCourse = (lesson: LessonRow) => ({
    ...lesson,
    module: {
      courseId: modules.find((m) => m.id === lesson.moduleId)!.courseId,
    },
  });
  const notFound = () =>
    new Prisma.PrismaClientKnownRequestError('não existe', {
      code: 'P2025',
      clientVersion: 'test',
    });

  const tx = {
    module: {
      findUnique: ({ where }: { where: { id: number } }) =>
        Promise.resolve(modules.find((m) => m.id === where.id) ?? null),
    },
    lesson: {
      aggregate: ({
        where,
      }: {
        where: { moduleId?: number; module?: { courseId: number } };
      }) => {
        const rows = lessons.filter((l) =>
          where.moduleId !== undefined
            ? l.moduleId === where.moduleId
            : modules.find((m) => m.id === l.moduleId)!.courseId ===
              where.module!.courseId,
        );
        return Promise.resolve({
          _count: { _all: rows.length },
          _sum: {
            duration: rows.length
              ? rows.reduce((s, l) => s + l.duration, 0)
              : null,
          },
          _max: {
            order: rows.length ? Math.max(...rows.map((l) => l.order)) : null,
          },
        });
      },
      create: ({ data }: { data: Omit<LessonRow, 'id'> }) => {
        const lesson = { id: ++nextId, ...data };
        lessons.push(lesson);
        return Promise.resolve(withCourse(lesson));
      },
      update: ({
        where,
        data,
      }: {
        where: { id: number };
        data: Partial<LessonRow>;
      }) => {
        const lesson = lessons.find((l) => l.id === where.id);
        if (!lesson) return Promise.reject(notFound());
        Object.assign(lesson, data);
        return Promise.resolve(withCourse(lesson));
      },
      delete: ({ where }: { where: { id: number } }) => {
        const index = lessons.findIndex((l) => l.id === where.id);
        if (index < 0) return Promise.reject(notFound());
        const [removed] = lessons.splice(index, 1);
        return Promise.resolve(withCourse(removed));
      },
    },
    course: {
      update: ({ data }: { data: typeof course }) => {
        Object.assign(course, data);
        return Promise.resolve(course);
      },
    },
  };

  const prisma = {
    $transaction: <T>(fn: (client: typeof tx) => Promise<T>) => {
      transactions++;
      return fn(tx);
    },
  };

  return {
    prisma,
    totals: () => [course.totalLessons, course.totalHours.toFixed(2)],
    transactions: () => transactions,
  };
}

describe('LessonsService', () => {
  let service: LessonsService;
  let db: ReturnType<typeof fakeDatabase>;

  beforeEach(async () => {
    db = fakeDatabase();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LessonsService,
        { provide: PrismaService, useValue: db.prisma },
      ],
    }).compile();

    service = module.get<LessonsService>(LessonsService);
  });

  it('totais do curso depois de criar, editar e excluir aulas', async () => {
    expect(db.totals()).toEqual([0, '0.00']);

    const a = await service.create(1, { title: 'A', duration: 30 });
    expect(db.totals()).toEqual([1, '0.50']);

    // Aula em outro módulo do mesmo curso também conta.
    const b = await service.create(2, { title: 'B', duration: 45 });
    expect(db.totals()).toEqual([2, '1.25']);

    await service.update(a.id, { duration: 60 });
    expect(db.totals()).toEqual([2, '1.75']);

    await service.remove(b.id);
    expect(db.totals()).toEqual([1, '1.00']);

    await service.remove(a.id);
    expect(db.totals()).toEqual([0, '0.00']);

    // Cada escrita, com o recálculo, numa transação só.
    expect(db.transactions()).toBe(5);
  });

  it('sem ordem, a aula vai para o fim do módulo', async () => {
    await service.create(1, { title: 'A', duration: 10, order: 4 });
    const b = await service.create(1, { title: 'B', duration: 10 });
    expect(b.order).toBe(5);
  });

  it('módulo inexistente: 404, totais intactos', async () => {
    await expect(
      service.create(99, { title: 'X', duration: 10 }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(db.totals()).toEqual([0, '0.00']);
  });
});
