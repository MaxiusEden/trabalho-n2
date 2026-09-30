import { PartialType } from '@nestjs/swagger';
import { CreateCourseDto } from './create-course.dto';

/**
 * Atualização parcial. Quando `lessons` é enviado, a lista substitui o conteúdo
 * programático inteiro; quando é omitido, as aulas atuais são preservadas.
 * `trilhaId: null` desvincula o curso da trilha.
 */
export class UpdateCourseDto extends PartialType(CreateCourseDto) {}
