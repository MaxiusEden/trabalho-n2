import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

const courseSelect = {
  id: true,
  title: true,
  description: true,
  image: true,
  priceCents: true,
  trilhaId: true,
  categoryId: true,
  instructorId: true,
  level: true,
  publishedAt: true,
  totalLessons: true,
  totalHours: true,
  createdAt: true,
  updatedAt: true,
  trilha: { select: { id: true, title: true } },
  category: { select: { id: true, name: true } },
  instructor: { select: { id: true, name: true, email: true } },
  // Curso > Módulo > Aula, cada nível na ordem gravada.
  modules: {
    orderBy: { order: 'asc' },
    select: {
      id: true,
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
    },
  },
  _count: { select: { enrollments: true } },
} satisfies Prisma.CourseSelect;

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  // Cria o curso sem módulos (totais 0); módulos e aulas têm rotas próprias.
  create(createCourseDto: CreateCourseDto) {
    return this.prisma.course.create({
      data: {
        title: createCourseDto.title,
        description: createCourseDto.description,
        image: createCourseDto.image,
        priceCents: createCourseDto.priceCents,
        trilhaId: createCourseDto.trilhaId ?? null,
        categoryId: createCourseDto.categoryId ?? null,
        instructorId: createCourseDto.instructorId ?? null,
        level: createCourseDto.level,
        publishedAt: createCourseDto.publishedAt,
      },
      select: courseSelect,
    });
  }

  findAll(options: { trilhaId?: number; categoryId?: number } = {}) {
    return this.prisma.course.findMany({
      where: { trilhaId: options.trilhaId, categoryId: options.categoryId },
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

  // `undefined` significa "campo não enviado" e é preservado. Módulos e aulas
  // não passam por aqui: têm rotas próprias, que recalculam os totais.
  update(id: number, updateCourseDto: UpdateCourseDto) {
    // As FKs vão como colunas (`null` desvincula): um id que não existe vira
    // violação de FK (P2003 → 400, como no create). Com `connect`, viraria
    // P2025 e o filtro responderia 404, como se o curso não existisse.
    const data: Prisma.CourseUncheckedUpdateInput = {};

    if (updateCourseDto.title !== undefined) data.title = updateCourseDto.title;
    if (updateCourseDto.description !== undefined)
      data.description = updateCourseDto.description;
    if (updateCourseDto.image !== undefined) data.image = updateCourseDto.image;
    if (updateCourseDto.priceCents !== undefined)
      data.priceCents = updateCourseDto.priceCents;
    if (updateCourseDto.level !== undefined) data.level = updateCourseDto.level;
    if (updateCourseDto.publishedAt !== undefined)
      data.publishedAt = updateCourseDto.publishedAt;
    if (updateCourseDto.trilhaId !== undefined)
      data.trilhaId = updateCourseDto.trilhaId;
    if (updateCourseDto.categoryId !== undefined)
      data.categoryId = updateCourseDto.categoryId;
    if (updateCourseDto.instructorId !== undefined)
      data.instructorId = updateCourseDto.instructorId;

    return this.prisma.course.update({
      where: { id },
      data,
      select: courseSelect,
    });
  }

  // Módulos, aulas e matrículas do curso somem junto, via `onDelete: Cascade`.
  remove(id: number) {
    return this.prisma.course.delete({ where: { id }, select: courseSelect });
  }
}
