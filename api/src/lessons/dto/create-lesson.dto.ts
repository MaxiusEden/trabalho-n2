import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ContentType } from '../../generated/prisma/enums';

// LAB03, Aulas: Titulo, TipoConteudo, URL_Conteudo, DuracaoMinutos e Ordem (o
// módulo vem da rota).
export class CreateLessonDto {
  @ApiProperty({
    example: 'Introdução à Tecnologia',
    description: 'Título da aula (até 120 caracteres)',
    maxLength: 120,
  })
  @IsString({ message: 'title deve ser um texto' })
  @IsNotEmpty({ message: 'title não pode ser vazio' })
  @MaxLength(120, { message: 'title deve ter no máximo 120 caracteres' })
  title: string;

  @ApiProperty({
    enum: ContentType,
    example: ContentType.VIDEO,
    description: 'Tipo de conteúdo (padrão VIDEO)',
    required: false,
  })
  @IsOptional()
  @IsEnum(ContentType, { message: 'contentType deve ser VIDEO, TEXTO ou QUIZ' })
  contentType?: ContentType;

  @ApiProperty({
    example: 'https://example.com/aulas/introducao',
    description: 'URL do conteúdo (http ou https); null ou omitida, sem URL',
    required: false,
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsUrl(
    {
      protocols: ['http', 'https'],
      require_protocol: true,
      require_tld: false,
    },
    { message: 'contentUrl deve ser uma URL http ou https' },
  )
  contentUrl?: string | null;

  @ApiProperty({
    example: 10,
    description: 'Duração em minutos (1 a 10000)',
    minimum: 1,
    maximum: 10_000,
  })
  @IsInt({ message: 'duration deve ser um número inteiro de minutos' })
  @Min(1, { message: 'duration deve ser de no mínimo 1 minuto' })
  @Max(10_000, { message: 'duration deve ser de no máximo 10000 minutos' })
  duration: number;

  @ApiProperty({
    example: 1,
    description:
      'Posição da aula no módulo, única no módulo; omitida, vai para o fim',
    required: false,
    minimum: 1,
  })
  @IsOptional()
  @IsInt({ message: 'order deve ser um número inteiro' })
  @Min(1, { message: 'order deve ser no mínimo 1' })
  order?: number;
}
