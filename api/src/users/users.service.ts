import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt'; // Biblioteca para hash de senha

// Nenhuma resposta da API devolve a senha, nem o hash.
const semSenha = { password: true } as const;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    // Gera um salt e cria o hash da senha enviada pelo DTO
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(createUserDto.password, salt);

    // Salva o usuário no banco com a senha criptografada
    return this.prisma.user.create({
      data: { ...createUserDto, password: hash },
      omit: semSenha,
    });
  }

  // Método essencial para buscar usuário pelo e-mail durante o login.
  // É o único que traz o hash: o AuthService precisa dele para comparar.
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  findAll() {
    return this.prisma.user.findMany({ omit: semSenha });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      omit: semSenha,
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    // Acréscimo ao PDF: se vier senha nova, grava o hash, como no create
    const data = { ...updateUserDto };
    if (data.password) {
      const salt = await bcrypt.genSalt();
      data.password = await bcrypt.hash(data.password, salt);
    }

    return this.prisma.user.update({
      where: { id },
      data,
      omit: semSenha,
    });
  }

  remove(id: number) {
    return this.prisma.user.delete({ where: { id }, omit: semSenha });
  }
}
