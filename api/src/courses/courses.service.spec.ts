import { Test, TestingModule } from '@nestjs/testing';
import { CoursesService } from './courses.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CoursesService', () => {
  let service: CoursesService;
  const prisma = { course: { findMany: jest.fn(), update: jest.fn() } };

  beforeEach(async () => {
    prisma.course.findMany.mockReset();
    prisma.course.update.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoursesService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('filtra por categoria', async () => {
    prisma.course.findMany.mockResolvedValue([]);
    await service.findAll({ categoryId: 4 });
    expect(prisma.course.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { trilhaId: undefined, categoryId: 4 },
      }),
    );
  });

  it('o update grava as FKs como colunas (id inexistente vira 400, não 404)', async () => {
    prisma.course.update.mockResolvedValue({ id: 1 });
    await service.update(1, {
      categoryId: 3,
      instructorId: null,
      level: 'AVANCADO',
    });
    const calls = prisma.course.update.mock.calls as [
      [{ data: Record<string, unknown> }],
    ];
    const { data } = calls[0][0];
    expect(data).toEqual({
      categoryId: 3,
      instructorId: null,
      level: 'AVANCADO',
    });
  });
});
