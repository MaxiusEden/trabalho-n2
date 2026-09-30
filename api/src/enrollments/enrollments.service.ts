import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';

const enrollmentSelect = {
  id: true,
  userId: true,
  courseId: true,
  createdAt: true,
  user: { select: { id: true, name: true, email: true } },
  course: { select: { id: true, title: true, priceCents: true } },
} satisfies Prisma.EnrollmentSelect;

@Injectable()
export class EnrollmentsService {
  constructor(private prisma: PrismaService) {}

  // A matrícula duplicada é barrada pelo `@@unique([userId, courseId])` do
  // banco, não por uma checagem prévia: dois cliques simultâneos não criam dois
  // registros. As mensagens são as mesmas que o web/ já mostra.
  async create(userId: number, courseId: number) {
    try {
      return await this.prisma.enrollment.create({
        data: { userId, courseId },
        select: enrollmentSelect,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'Este usuário já está matriculado neste curso',
          );
        }
        if (error.code === 'P2003') {
          throw new BadRequestException(
            'Usuário ou curso informado não existe',
          );
        }
      }
      throw error;
    }
  }

  findAll(options: { userId?: number; courseId?: number } = {}) {
    return this.prisma.enrollment.findMany({
      where: { userId: options.userId, courseId: options.courseId },
      select: enrollmentSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id },
      select: enrollmentSelect,
    });
    if (!enrollment)
      throw new NotFoundException(`Matrícula ${id} não encontrada`);
    return enrollment;
  }

  remove(id: number) {
    return this.prisma.enrollment.delete({
      where: { id },
      select: enrollmentSelect,
    });
  }
}
