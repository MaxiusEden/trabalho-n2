import { prisma } from '@/lib/prisma';
import { NotFoundError } from '@/lib/http/errors';
import type { Prisma } from '@/generated/prisma/client';
import type { CreateUserDto } from './dto/create-user.dto';
import type { UpdateUserDto } from './dto/update-user.dto';

/** `password` fica de fora de tudo que sai da API. */
const userSelect = {
  id: true,
  email: true,
  name: true,
  createdAt: true,
  updateAt: true,
  _count: { select: { enrollments: true } },
} satisfies Prisma.UserSelect;

const userDetailSelect = {
  ...userSelect,
  enrollments: {
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      createdAt: true,
      course: { select: { id: true, title: true, priceCents: true } },
    },
  },
} satisfies Prisma.UserSelect;

export type UserDto = Prisma.UserGetPayload<{ select: typeof userSelect }>;
export type UserDetailDto = Prisma.UserGetPayload<{ select: typeof userDetailSelect }>;

/** Equivalente ao `UsersService` do PDF. */
export const usersService = {
  create(dto: CreateUserDto): Promise<UserDto> {
    return prisma.user.create({ data: dto, select: userSelect });
  },

  findAll(): Promise<UserDto[]> {
    return prisma.user.findMany({ select: userSelect, orderBy: { id: 'asc' } });
  },

  async findOne(id: number): Promise<UserDetailDto> {
    const user = await prisma.user.findUnique({ where: { id }, select: userDetailSelect });
    if (!user) throw new NotFoundError(`Usuário ${id} não encontrado`);
    return user;
  },

  update(id: number, dto: UpdateUserDto): Promise<UserDto> {
    return prisma.user.update({ where: { id }, data: dto, select: userSelect });
  },

  remove(id: number): Promise<UserDto> {
    return prisma.user.delete({ where: { id }, select: userSelect });
  },

  /**
   * Confere as credenciais da tela de Login. Devolve `null` em qualquer falha
   * para não revelar se o e-mail existe ou se apenas a senha está errada.
   */
  async authenticate(
    email: string,
    password: string,
  ): Promise<{ id: number; email: string; name: string | null } | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.password !== password) return null;

    return { id: user.id, email: user.email, name: user.name };
  },
};
