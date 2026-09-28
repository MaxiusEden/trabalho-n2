import { prisma } from '@/lib/prisma';
import { NotFoundError } from '@/lib/http/errors';
import type { Prisma } from '@/generated/prisma/client';
import type { CreateCourseDto, LessonInputDto } from './dto/create-course.dto';
import type { UpdateCourseDto } from './dto/update-course.dto';

const courseSelect = {
  id: true,
  title: true,
  description: true,
  image: true,
  priceCents: true,
  trilhaId: true,
  createdAt: true,
  updatedAt: true,
  trilha: { select: { id: true, title: true } },
  lessons: { orderBy: { order: 'asc' }, select: { id: true, title: true, duration: true, order: true } },
  _count: { select: { enrollments: true } },
} satisfies Prisma.CourseSelect;

export type CourseDto = Prisma.CourseGetPayload<{ select: typeof courseSelect }>;

/** A ordem das aulas é a posição no array, o que nunca colide com `@@unique([courseId, order])`. */
function toLessonRows(lessons: LessonInputDto[]) {
  return lessons.map((lesson, index) => ({
    title: lesson.title,
    duration: lesson.duration,
    order: index + 1,
  }));
}

export const coursesService = {
  create(dto: CreateCourseDto): Promise<CourseDto> {
    return prisma.course.create({
      data: {
        title: dto.title,
        description: dto.description,
        image: dto.image,
        priceCents: dto.priceCents,
        trilhaId: dto.trilhaId ?? null,
        lessons: { create: toLessonRows(dto.lessons ?? []) },
      },
      select: courseSelect,
    });
  },

  findAll(options: { trilhaId?: number } = {}): Promise<CourseDto[]> {
    return prisma.course.findMany({
      where: options.trilhaId === undefined ? undefined : { trilhaId: options.trilhaId },
      select: courseSelect,
      orderBy: { id: 'asc' },
    });
  },

  async findOne(id: number): Promise<CourseDto> {
    const course = await prisma.course.findUnique({ where: { id }, select: courseSelect });
    if (!course) throw new NotFoundError(`Curso ${id} não encontrado`);
    return course;
  },

  /**
   * `undefined` significa "campo não enviado" e é preservado; `trilhaId: null`
   * desvincula o curso da trilha. Trocar a lista de aulas é feito numa única
   * operação aninhada, então o curso nunca fica sem conteúdo pela metade.
   */
  update(id: number, dto: UpdateCourseDto): Promise<CourseDto> {
    const data: Prisma.CourseUpdateInput = {};

    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.image !== undefined) data.image = dto.image;
    if (dto.priceCents !== undefined) data.priceCents = dto.priceCents;

    if (dto.trilhaId !== undefined) {
      data.trilha = dto.trilhaId === null ? { disconnect: true } : { connect: { id: dto.trilhaId } };
    }

    if (dto.lessons !== undefined) {
      data.lessons = { deleteMany: {}, create: toLessonRows(dto.lessons) };
    }

    return prisma.course.update({ where: { id }, data, select: courseSelect });
  },

  /** As aulas e matrículas do curso somem junto, via `onDelete: Cascade`. */
  remove(id: number): Promise<CourseDto> {
    return prisma.course.delete({ where: { id }, select: courseSelect });
  },
};
