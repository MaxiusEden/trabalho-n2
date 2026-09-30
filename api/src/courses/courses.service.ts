import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';
import { CreateCourseDto, LessonInputDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

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
  lessons: {
    orderBy: { order: 'asc' },
    select: { id: true, title: true, duration: true, order: true },
  },
  _count: { select: { enrollments: true } },
} satisfies Prisma.CourseSelect;

// A ordem das aulas é a posição no array, o que nunca colide com
// `@@unique([courseId, order])`.
function toLessonRows(lessons: LessonInputDto[]) {
  return lessons.map((lesson, index) => ({
    title: lesson.title,
    duration: lesson.duration,
    order: index + 1,
  }));
}

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  // Cria o curso junto com o conteúdo programático.
  create(createCourseDto: CreateCourseDto) {
    return this.prisma.course.create({
      data: {
        title: createCourseDto.title,
        description: createCourseDto.description,
        image: createCourseDto.image,
        priceCents: createCourseDto.priceCents,
        trilhaId: createCourseDto.trilhaId ?? null,
        lessons: { create: toLessonRows(createCourseDto.lessons ?? []) },
      },
      select: courseSelect,
    });
  }

  findAll(options: { trilhaId?: number } = {}) {
    return this.prisma.course.findMany({
      where:
        options.trilhaId === undefined
          ? undefined
          : { trilhaId: options.trilhaId },
      select: courseSelect,
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      select: courseSelect,
    });
    if (!course) throw new NotFoundException(`Curso ${id} não encontrado`);
    return course;
  }

  // `undefined` significa "campo não enviado" e é preservado. Trocar a lista de
  // aulas é uma única operação aninhada: o curso nunca fica pela metade.
  update(id: number, updateCourseDto: UpdateCourseDto) {
    const data: Prisma.CourseUpdateInput = {};

    if (updateCourseDto.title !== undefined) data.title = updateCourseDto.title;
    if (updateCourseDto.description !== undefined)
      data.description = updateCourseDto.description;
    if (updateCourseDto.image !== undefined) data.image = updateCourseDto.image;
    if (updateCourseDto.priceCents !== undefined)
      data.priceCents = updateCourseDto.priceCents;

    if (updateCourseDto.trilhaId !== undefined) {
      data.trilha =
        updateCourseDto.trilhaId === null
          ? { disconnect: true }
          : { connect: { id: updateCourseDto.trilhaId } };
    }

    if (updateCourseDto.lessons !== undefined) {
      data.lessons = {
        deleteMany: {},
        create: toLessonRows(updateCourseDto.lessons),
      };
    }

    return this.prisma.course.update({
      where: { id },
      data,
      select: courseSelect,
    });
  }

  // As aulas e matrículas do curso somem junto, via `onDelete: Cascade`.
  remove(id: number) {
    return this.prisma.course.delete({ where: { id }, select: courseSelect });
  }
}
