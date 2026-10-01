import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CategoriesService', () => {
  let service: CategoriesService;
  const prisma = { category: { findUnique: jest.fn() } };

  beforeEach(async () => {
    prisma.category.findUnique.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('categoria inexistente: 404', async () => {
    prisma.category.findUnique.mockResolvedValue(null);
    await expect(service.findOne(99)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('o detalhe traz os cursos e as trilhas da categoria', async () => {
    prisma.category.findUnique.mockResolvedValue({ id: 1 });
    await service.findOne(1);
    const calls = prisma.category.findUnique.mock.calls as [
      [{ select: Record<string, unknown> }],
    ];
    const { select } = calls[0][0];
    expect(select).toHaveProperty('courses');
    expect(select).toHaveProperty('trilhas');
  });
});
