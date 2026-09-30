import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

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
}
