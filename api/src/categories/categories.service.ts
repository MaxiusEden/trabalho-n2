import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

// As contagens vêm de `_count`: são derivadas, nunca ficam dessincronizadas.
const categorySelect = {
  id: true,
  name: true,
  description: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { courses: true, trilhas: true } },
} satisfies Prisma.CategorySelect;

// O detalhe traz os cursos e as trilhas da categoria (LAB03, item A1: "listar
// cursos de uma categoria específica").
const categoryDetailSelect = {
  ...categorySelect,
  courses: {
    orderBy: { id: 'asc' },
    select: {
      id: true,
      title: true,
      description: true,
      image: true,
      priceCents: true,
      level: true,
    },
  },
  trilhas: {
    orderBy: { id: 'asc' },
    select: {
      id: true,
      title: true,
      description: true,
      _count: { select: { courses: true } },
    },
  },
} satisfies Prisma.CategorySelect;

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  create(createCategoryDto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: createCategoryDto,
      select: categorySelect,
    });
  }

  findAll() {
    return this.prisma.category.findMany({
      select: categorySelect,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      select: categoryDetailSelect,
    });
    if (!category)
      throw new NotFoundException(`Categoria ${id} não encontrada`);
    return category;
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
      select: categorySelect,
    });
  }

  // Apagar a categoria não apaga cursos nem trilhas: o `onDelete: SetNull` só
  // desvincula.
  remove(id: number) {
    return this.prisma.category.delete({
      where: { id },
      select: categorySelect,
    });
  }
}
