import { ApiProperty } from '@nestjs/swagger';
import { CourseLevel } from '../../generated/prisma/enums';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateCourseDto {
  @ApiProperty({
    example: 'React para Iniciantes',
    description: 'Título do curso (até 120 caracteres)',
    maxLength: 120,
  })
  @IsString({ message: 'title deve ser um texto' })
  @IsNotEmpty({ message: 'title não pode ser vazio' })
  @MaxLength(120, { message: 'title deve ter no máximo 120 caracteres' })
  title: string;

  @ApiProperty({
    example: 'Aprenda os fundamentos do React, hooks e muito mais.',
    description: 'Descrição do curso',
  })
  @IsString({ message: 'description deve ser um texto' })
  @IsNotEmpty({ message: 'description não pode ser vazia' })
  description: string;

  @ApiProperty({
    example: '/covers/react.svg',
    description: 'Caminho ou URL da capa',
  })
  @IsString({ message: 'image deve ser um texto' })
  @IsNotEmpty({ message: 'image não pode ser vazia' })
  image: string;

  @ApiProperty({
    example: 9700,
    description: 'Preço em centavos (9700 = R$ 97,00)',
    minimum: 0,
  })
  @IsInt({
    message: 'priceCents deve ser um número inteiro (preço em centavos)',
  })
  @Min(0, { message: 'priceCents não pode ser negativo' })
  priceCents: number;

  /** `null` deixa o curso sem trilha; omitir tem o mesmo efeito na criação. */
  @ApiProperty({
    example: 1,
    description: 'ID da trilha; null ou omitido deixa o curso sem trilha',
    required: false,
    nullable: true,
    type: Number,
  })
  @IsOptional()
  @IsInt({ message: 'trilhaId deve ser um número inteiro' })
  @Min(1, { message: 'trilhaId deve ser um id válido' })
  trilhaId?: number | null;

  @ApiProperty({
    example: 1,
    description: 'ID da categoria; null ou omitido deixa o curso sem categoria',
    required: false,
    nullable: true,
    type: Number,
  })
  @IsOptional()
  @IsInt({ message: 'categoryId deve ser um número inteiro' })
  @Min(1, { message: 'categoryId deve ser um id válido' })
  categoryId?: number | null;

  @ApiProperty({
    example: 2,
    description: 'ID do usuário instrutor; null ou omitido deixa sem instrutor',
    required: false,
    nullable: true,
    type: Number,
  })
  @IsOptional()
  @IsInt({ message: 'instructorId deve ser um número inteiro' })
  @Min(1, { message: 'instructorId deve ser um id válido' })
  instructorId?: number | null;

  @ApiProperty({
    enum: CourseLevel,
    example: CourseLevel.INICIANTE,
    description: 'Nível do curso (padrão INICIANTE)',
    required: false,
  })
  @IsOptional()
  @IsEnum(CourseLevel, {
    message: 'level deve ser INICIANTE, INTERMEDIARIO ou AVANCADO',
  })
  level?: CourseLevel;

  @ApiProperty({
    example: '2026-09-30T12:00:00.000Z',
    description: 'Data de publicação (ISO 8601; padrão: agora)',
    required: false,
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'publishedAt deve ser uma data ISO 8601 válida' },
  )
  publishedAt?: string;
}
