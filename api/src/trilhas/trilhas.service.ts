import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';
import { CreateTrilhaDto } from './dto/create-trilha.dto';
import { UpdateTrilhaDto } from './dto/update-trilha.dto';

// O número de módulos exibido na UI vem de `_count.courses`: é derivado, então
// nunca fica dessincronizado dos cursos ligados à trilha.
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
    select: {
      id: true,
      title: true,
      description: true,
      image: true,
      priceCents: true,
      lessons: { select: { duration: true } },
    },
  },
} satisfies Prisma.TrilhaSelect;

@Injectable()
export class TrilhasService {
  constructor(private prisma: PrismaService) {}

  create(createTrilhaDto: CreateTrilhaDto) {
    return this.prisma.trilha.create({
      data: createTrilhaDto,
      select: trilhaSelect,
    });
  }

  findAll() {
    return this.prisma.trilha.findMany({
      select: trilhaSelect,
      orderBy: { id: 'asc' },
    });
  }

  // Inclui os cursos da trilha.
  async findOne(id: number) {
    const trilha = await this.prisma.trilha.findUnique({
      where: { id },
      select: trilhaDetailSelect,
    });
    if (!trilha) throw new NotFoundException(`Trilha ${id} não encontrada`);
    return trilha;
  }

  update(id: number, updateTrilhaDto: UpdateTrilhaDto) {
    return this.prisma.trilha.update({
      where: { id },
      data: updateTrilhaDto,
      select: trilhaSelect,
    });
  }

  // Apagar a trilha não apaga os cursos: o `onDelete: SetNull` só desvincula.
  remove(id: number) {
    return this.prisma.trilha.delete({ where: { id }, select: trilhaSelect });
  }
}
