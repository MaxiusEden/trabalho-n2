import { ConflictException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EnrollmentsService } from './enrollments.service';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';
import { AuthUser } from '../auth/auth-user';

const aluno: AuthUser = { userId: 2, email: 'aluno@perero.com', role: 'USER' };
const admin: AuthUser = { userId: 1, email: 'admin@perero.com', role: 'ADMIN' };

describe('EnrollmentsService', () => {
  let service: EnrollmentsService;
  const prisma = {
    enrollment: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    Object.values(prisma.enrollment).forEach((fn) => fn.mockReset());
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrollmentsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<EnrollmentsService>(EnrollmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('matrícula duplicada (P2002) vira 409 com a mensagem do web/', async () => {
    prisma.enrollment.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('duplicada', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );

    const promise = service.create(1, 2);
    await expect(promise).rejects.toBeInstanceOf(ConflictException);
    await expect(promise).rejects.toThrow(
      'Este usuário já está matriculado neste curso',
    );
  });

  describe('listar', () => {
    it('USER sem filtro vê só as próprias', async () => {
      prisma.enrollment.findMany.mockResolvedValue([]);
      await service.findAll(aluno, { courseId: 3 });
      expect(prisma.enrollment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 2, courseId: 3 } }),
      );
    });

    it('USER pedindo as de outro usuário: 403', () => {
      expect(() => service.findAll(aluno, { userId: 9 })).toThrow(
        ForbiddenException,
      );
      expect(prisma.enrollment.findMany).not.toHaveBeenCalled();
    });

    it('ADMIN sem filtro vê todas', async () => {
      prisma.enrollment.findMany.mockResolvedValue([]);
      await service.findAll(admin);
      expect(prisma.enrollment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: undefined, courseId: undefined },
        }),
      );
    });
  });

  describe('cancelar', () => {
    it('USER cancela a própria', async () => {
      prisma.enrollment.findUnique.mockResolvedValue({ id: 5, userId: 2 });
      prisma.enrollment.delete.mockResolvedValue({ id: 5 });
      await service.remove(5, aluno);
      expect(prisma.enrollment.delete).toHaveBeenCalled();
    });

    it('USER cancelando a de outro: 403, nada apagado', async () => {
      prisma.enrollment.findUnique.mockResolvedValue({ id: 5, userId: 9 });
      await expect(service.remove(5, aluno)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(prisma.enrollment.delete).not.toHaveBeenCalled();
    });

    it('ADMIN cancela a de outro', async () => {
      prisma.enrollment.findUnique.mockResolvedValue({ id: 5, userId: 9 });
      prisma.enrollment.delete.mockResolvedValue({ id: 5 });
      await service.remove(5, admin);
      expect(prisma.enrollment.delete).toHaveBeenCalled();
    });
  });
});
