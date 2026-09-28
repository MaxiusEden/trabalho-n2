import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

/**
 * Equivalente ao `UpdateUserDto extends PartialType(CreateUserDto)` do NestJS:
 * mesmas regras do create, porém todos os campos são opcionais (PATCH parcial).
 */
export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'email deve ser um endereço de e-mail válido' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'name deve ser um texto' })
  @IsNotEmpty({ message: 'name não pode ser vazio' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'password deve ser um texto' })
  @MinLength(6, { message: 'password deve ter no mínimo 6 caracteres' })
  password?: string;
}
