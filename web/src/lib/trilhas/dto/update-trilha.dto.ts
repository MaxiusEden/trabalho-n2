import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

/** Todos os campos opcionais — atualização parcial (PATCH). */
export class UpdateTrilhaDto {
  @IsOptional()
  @IsString({ message: 'title deve ser um texto' })
  @IsNotEmpty({ message: 'title não pode ser vazio' })
  @MaxLength(120, { message: 'title deve ter no máximo 120 caracteres' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'description deve ser um texto' })
  @IsNotEmpty({ message: 'description não pode ser vazia' })
  description?: string;
}
