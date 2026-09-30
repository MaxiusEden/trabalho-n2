import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

// O usuário da matrícula é sempre o dono do token (req.user), nunca o corpo.
export class CreateEnrollmentDto {
  @ApiProperty({ example: 1, description: 'ID do curso' })
  @IsInt({ message: 'courseId deve ser um número inteiro' })
  @Min(1, { message: 'courseId deve ser um id válido' })
  courseId: number;
}
