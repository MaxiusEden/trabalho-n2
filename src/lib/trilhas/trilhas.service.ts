import { prisma } from '@/lib/prisma';
import { NotFoundError } from '@/lib/http/errors';
import type { Prisma } from '@/generated/prisma/client';
import type { CreateTrilhaDto } from './dto/create-trilha.dto';
import type { UpdateTrilhaDto } from './dto/update-trilha.dto';

/**
 * O número de módulos exibido na UI vem de `_count.courses`. Como é derivado,
 * nunca fica dessincronizado dos cursos realmente ligados à trilha.
 */
const trilhaSelect = {
  id: true,
  title: true,
  description: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { courses: true } },
} satisfies Prisma.TrilhaSelect;

const trilhaDetailSelect = {
  ...trilhaSelect,
  courses: {
    orderBy: { id: 'asc' },
    select: { id: true, title: true, description: true, image: true, priceCents: true },
  },
} satisfies Prisma.TrilhaSelect;

export type TrilhaDto = Prisma.TrilhaGetPayload<{ select: typeof trilhaSelect }>;
export type TrilhaDetailDto = Prisma.TrilhaGetPayload<{ select: typeof trilhaDetailSelect }>;

export const trilhasService = {
  create(dto: CreateTrilhaDto): Promise<TrilhaDto> {
    return prisma.trilha.create({ data: dto, select: trilhaSelect });
  },

  findAll(): Promise<TrilhaDto[]> {
    return prisma.trilha.findMany({ select: trilhaSelect, orderBy: { id: 'asc' } });
  },

  async findOne(id: number): Promise<TrilhaDetailDto> {
    const trilha = await prisma.trilha.findUnique({ where: { id }, select: trilhaDetailSelect });
    if (!trilha) throw new NotFoundError(`Trilha ${id} não encontrada`);
    return trilha;
  },

  update(id: number, dto: UpdateTrilhaDto): Promise<TrilhaDto> {
    return prisma.trilha.update({ where: { id }, data: dto, select: trilhaSelect });
  },

  /**
   * Apagar a trilha não apaga os cursos: o `onDelete: SetNull` do schema apenas
   * desvincula, deixando os cursos disponíveis sem trilha.
   */
  remove(id: number): Promise<TrilhaDto> {
    return prisma.trilha.delete({ where: { id }, select: trilhaSelect });
  },
};
