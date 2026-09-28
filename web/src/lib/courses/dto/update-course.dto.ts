// Ver a nota em `create-course.dto.ts`: precisa ser o primeiro import.
import 'reflect-metadata';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { LessonInputDto } from './create-course.dto';

/**
 * Atualização parcial. Quando `lessons` é enviado, a lista substitui o conteúdo
 * programático inteiro; quando é omitido, as aulas atuais são preservadas.
 */
export class UpdateCourseDto {
  @IsOptional()
  @IsString({ message: 'title deve ser um texto' })
  @IsNotEmpty({ message: 'title não pode ser vazio' })
  @MaxLength(120, { message: 'title deve ter no máximo 120 caracteres' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'description deve ser um texto' })
  @IsNotEmpty({ message: 'description não pode ser vazia' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'image deve ser um texto' })
  @IsNotEmpty({ message: 'image não pode ser vazia' })
  image?: string;

  @IsOptional()
  @IsInt({ message: 'priceCents deve ser um número inteiro (preço em centavos)' })
  @Min(0, { message: 'priceCents não pode ser negativo' })
  priceCents?: number;

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
