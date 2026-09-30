import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EnrollmentsService } from './enrollments.service';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';

describe('EnrollmentsService', () => {
  let service: EnrollmentsService;
  const prisma = { enrollment: { create: jest.fn() } };

  beforeEach(async () => {
    prisma.enrollment.create.mockReset();
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
});
