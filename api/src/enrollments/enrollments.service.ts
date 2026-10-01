import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';
import { AuthUser, isAdmin } from '../auth/auth-user';

const OUTRO_USUARIO =
  'Só administradores veem ou cancelam matrículas de outros usuários';

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

  // ADMIN vê todas (com os filtros). USER vê só as próprias: sem `userId` o
  // filtro vira o dele, e pedir o de outra pessoa dá 403.
  findAll(
    requester: AuthUser,
    options: { userId?: number; courseId?: number } = {},
  ) {
    let userId = options.userId;
    if (!isAdmin(requester)) {
      if (userId !== undefined && userId !== requester.userId) {
        throw new ForbiddenException(OUTRO_USUARIO);
      }
      userId = requester.userId;
    }

    return this.prisma.enrollment.findMany({
      where: { userId, courseId: options.courseId },
      select: enrollmentSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, requester: AuthUser) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id },
      select: enrollmentSelect,
    });
    if (!enrollment)
      throw new NotFoundException(`Matrícula ${id} não encontrada`);
    if (!isAdmin(requester) && enrollment.userId !== requester.userId) {
      throw new ForbiddenException(OUTRO_USUARIO);
    }
    return enrollment;
  }

  // O dono cancela a própria matrícula; a de outra pessoa, só o ADMIN.
  async remove(id: number, requester: AuthUser) {
    await this.findOne(id, requester);
    return this.prisma.enrollment.delete({
      where: { id },
      select: enrollmentSelect,
    });
  }
}
