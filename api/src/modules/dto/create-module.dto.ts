import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

// LAB03, Modulos: Titulo e Ordem (o curso vem da rota).
export class CreateModuleDto {
  @ApiProperty({
    example: 'Fundamentos',
    description: 'Título do módulo (até 120 caracteres)',
    maxLength: 120,
  })
  @IsString({ message: 'title deve ser um texto' })
  @IsNotEmpty({ message: 'title não pode ser vazio' })
  @MaxLength(120, { message: 'title deve ter no máximo 120 caracteres' })
  title: string;

  @ApiProperty({
    example: 1,
    description:
      'Posição do módulo no curso, única no curso; omitida, vai para o fim',
    required: false,
    minimum: 1,
  })
  @IsOptional()
  @IsInt({ message: 'order deve ser um número inteiro' })
  @Min(1, { message: 'order deve ser no mínimo 1' })
  order?: number;
}
