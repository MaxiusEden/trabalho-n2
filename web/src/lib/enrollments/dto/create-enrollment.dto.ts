import { IsInt, Min } from 'class-validator';

export class CreateEnrollmentDto {
  @IsInt({ message: 'userId deve ser um número inteiro' })
  @Min(1, { message: 'userId deve ser um id válido' })
  userId!: number;

  @IsInt({ message: 'courseId deve ser um número inteiro' })
  @Min(1, { message: 'courseId deve ser um id válido' })
  courseId!: number;
}
