import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTrilhaDto {
  @ApiProperty({
    example: 'Trilha Frontend',
    description: 'Título da trilha (até 120 caracteres)',
    maxLength: 120,
  })
  @IsString({ message: 'title deve ser um texto' })
  @IsNotEmpty({ message: 'title não pode ser vazio' })
  @MaxLength(120, { message: 'title deve ter no máximo 120 caracteres' })
  title: string;

  @ApiProperty({
    example: 'HTML, CSS, JS, React e muito mais.',
    description: 'Descrição curta da trilha',
  })
  @IsString({ message: 'description deve ser um texto' })
  @IsNotEmpty({ message: 'description não pode ser vazia' })
  description: string;

  /** LAB03, Trilhas.ID_Categoria. `null` ou omitido deixa sem categoria. */
  @ApiProperty({
    example: 1,
    description:
      'ID da categoria; null ou omitido deixa a trilha sem categoria',
    required: false,
    nullable: true,
    type: Number,
  })
  @IsOptional()
  @IsInt({ message: 'categoryId deve ser um número inteiro' })
  @Min(1, { message: 'categoryId deve ser um id válido' })
  categoryId?: number | null;
}
