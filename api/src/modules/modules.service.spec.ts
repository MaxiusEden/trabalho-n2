import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ModulesService } from './modules.service';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';

describe('ModulesService', () => {
  let service: ModulesService;
  const tx = {
    course: { findUnique: jest.fn(), update: jest.fn() },
    module: { create: jest.fn(), aggregate: jest.fn() },
    lesson: { aggregate: jest.fn() },
  };
  const prisma = {
    $transaction: (fn: (client: typeof tx) => Promise<unknown>) => fn(tx),
  };

  beforeEach(async () => {
    for (const group of Object.values(tx))
      for (const fn of Object.values(group)) fn.mockReset();
    tx.lesson.aggregate.mockResolvedValue({
      _count: { _all: 0 },
      _sum: { duration: null },
    });
    const module: TestingModule = await Test.createTestingModule({
      providers: [ModulesService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<ModulesService>(ModulesService);
  });

  it('curso inexistente: 404', async () => {
    tx.course.findUnique.mockResolvedValue(null);
    await expect(service.create(9, { title: 'M' })).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(tx.module.create).not.toHaveBeenCalled();
  });

  it('cria no fim do curso e recalcula os totais na mesma transação', async () => {
    tx.course.findUnique.mockResolvedValue({ id: 7 });
    tx.module.aggregate.mockResolvedValue({ _max: { order: 2 } });
    tx.module.create.mockResolvedValue({ id: 1, courseId: 7 });
    await service.create(7, { title: 'M' });
    expect(tx.module.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: { courseId: 7, title: 'M', order: 3 } }),
    );
    expect(tx.course.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 7 } }),
    );
  });

  it('posição repetida no curso: 409 com a posição', async () => {
    tx.course.findUnique.mockResolvedValue({ id: 7 });
    tx.module.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('única', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );
    const promise = service.create(7, { title: 'M', order: 1 });
    await expect(promise).rejects.toBeInstanceOf(ConflictException);
    await expect(promise).rejects.toThrow(
      'Já existe um módulo na posição 1 deste curso',
    );
  });
});
