import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';
import { BadRequestError, ConflictError, NotFoundError } from '@/lib/http/errors';
import type { CreateEnrollmentDto } from './dto/create-enrollment.dto';

const enrollmentSelect = {
  id: true,
  userId: true,
  courseId: true,
  createdAt: true,
  user: { select: { id: true, name: true, email: true } },
  course: { select: { id: true, title: true, priceCents: true } },
} satisfies Prisma.EnrollmentSelect;

export type EnrollmentDto = Prisma.EnrollmentGetPayload<{ select: typeof enrollmentSelect }>;

export const enrollmentsService = {
  /**
   * A matrícula duplicada é barrada pelo índice `@@unique([userId, courseId])`
   * do banco, e não por uma checagem prévia — assim dois cliques simultâneos no
   * botão "Matricular-se" não conseguem criar dois registros.
   */
  async create(dto: CreateEnrollmentDto): Promise<EnrollmentDto> {
    try {
      return await prisma.enrollment.create({ data: dto, select: enrollmentSelect });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictError('Este usuário já está matriculado neste curso');
        }
        if (error.code === 'P2003') {
          throw new BadRequestError('Usuário ou curso informado não existe');
        }
      }
      throw error;
    }
  },

  findAll(options: { userId?: number; courseId?: number } = {}): Promise<EnrollmentDto[]> {
    return prisma.enrollment.findMany({
      where: {
        userId: options.userId,
        courseId: options.courseId,
      },
      select: enrollmentSelect,
      orderBy: { createdAt: 'desc' },
    });
  },

  async findOne(id: number): Promise<EnrollmentDto> {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
      select: enrollmentSelect,
    });
    if (!enrollment) throw new NotFoundError(`Matrícula ${id} não encontrada`);
    return enrollment;
  },

  remove(id: number): Promise<EnrollmentDto> {
    return prisma.enrollment.delete({ where: { id }, select: enrollmentSelect });
  },
};
