import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

// LAB03, Categorias: Nome (único) e Descricao.
export class CreateCategoryDto {
  @ApiProperty({
    example: 'Desenvolvimento Web',
    description: 'Nome da categoria, único (até 80 caracteres)',
    maxLength: 80,
  })
  @IsString({ message: 'name deve ser um texto' })
  @IsNotEmpty({ message: 'name não pode ser vazio' })
  @MaxLength(80, { message: 'name deve ter no máximo 80 caracteres' })
  name: string;

  @ApiProperty({
    example: 'Frontend, backend e tudo o que roda no navegador.',
    description: 'Descrição curta da categoria',
  })
  @IsString({ message: 'description deve ser um texto' })
  @IsNotEmpty({ message: 'description não pode ser vazia' })
  description: string;
}
