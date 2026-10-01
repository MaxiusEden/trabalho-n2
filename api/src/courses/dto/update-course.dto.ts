import { PartialType } from '@nestjs/swagger';
import { CreateCourseDto } from './create-course.dto';

/**
 * Atualização parcial. `null` em `trilhaId`, `categoryId` ou `instructorId`
 * desvincula. Módulos e aulas não entram aqui: têm rotas próprias.
 */
export class UpdateCourseDto extends PartialType(CreateCourseDto) {}
