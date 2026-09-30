import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

/** Aula do conteúdo programático. A ordem vem da posição no array. */
export class LessonInputDto {
  @ApiProperty({
    example: 'Introdução à Tecnologia',
    description: 'Título da aula (até 120 caracteres)',
    maxLength: 120,
  })
  @IsString({ message: 'lessons.title deve ser um texto' })
  @IsNotEmpty({ message: 'lessons.title não pode ser vazio' })
  @MaxLength(120, {
    message: 'lessons.title deve ter no máximo 120 caracteres',
  })
  title: string;

  @ApiProperty({
    example: 10,
    description: 'Duração em minutos (1 a 10000)',
    minimum: 1,
    maximum: 10_000,
  })
  @IsInt({ message: 'lessons.duration deve ser um número inteiro de minutos' })
  @Min(1, { message: 'lessons.duration deve ser de no mínimo 1 minuto' })
  @Max(10_000, {
    message: 'lessons.duration deve ser de no máximo 10000 minutos',
  })
  duration: number;
}

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
    description: 'Conteúdo programático; a ordem das aulas é a do array',
    required: false,
    type: [LessonInputDto],
  })
  @IsOptional()
  @IsArray({ message: 'lessons deve ser uma lista' })
  @ArrayMaxSize(100, { message: 'lessons deve ter no máximo 100 aulas' })
  @ValidateNested({ each: true })
  @Type(() => LessonInputDto)
  lessons?: LessonInputDto[];
}
