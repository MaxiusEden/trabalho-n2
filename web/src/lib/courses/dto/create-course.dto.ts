// `@Type` do class-transformer chama `Reflect.getMetadata`, que não existe sem
// este polyfill. Precisa ser o primeiro import do arquivo.
import 'reflect-metadata';
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
  @IsString({ message: 'lessons.title deve ser um texto' })
  @IsNotEmpty({ message: 'lessons.title não pode ser vazio' })
  @MaxLength(120, { message: 'lessons.title deve ter no máximo 120 caracteres' })
  title!: string;

  @IsInt({ message: 'lessons.duration deve ser um número inteiro de minutos' })
  @Min(1, { message: 'lessons.duration deve ser de no mínimo 1 minuto' })
  @Max(10_000, { message: 'lessons.duration deve ser de no máximo 10000 minutos' })
  duration!: number;
}

export class CreateCourseDto {
  @IsString({ message: 'title deve ser um texto' })
  @IsNotEmpty({ message: 'title não pode ser vazio' })
  @MaxLength(120, { message: 'title deve ter no máximo 120 caracteres' })
  title!: string;

  @IsString({ message: 'description deve ser um texto' })
  @IsNotEmpty({ message: 'description não pode ser vazia' })
  description!: string;

  @IsString({ message: 'image deve ser um texto' })
  @IsNotEmpty({ message: 'image não pode ser vazia' })
  image!: string;

  @IsInt({ message: 'priceCents deve ser um número inteiro (preço em centavos)' })
  @Min(0, { message: 'priceCents não pode ser negativo' })
  priceCents!: number;

  /** `null` deixa o curso sem trilha; omitir tem o mesmo efeito na criação. */
  @IsOptional()
  @IsInt({ message: 'trilhaId deve ser um número inteiro' })
  @Min(1, { message: 'trilhaId deve ser um id válido' })
  trilhaId?: number | null;

  @IsOptional()
  @IsArray({ message: 'lessons deve ser uma lista' })
  @ArrayMaxSize(100, { message: 'lessons deve ter no máximo 100 aulas' })
  @ValidateNested({ each: true })
  @Type(() => LessonInputDto)
  lessons?: LessonInputDto[];
}
