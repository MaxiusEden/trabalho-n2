import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

/** DTO de criação de usuário — regras conforme o PDF. */
export class CreateUserDto {
  @IsEmail({}, { message: 'email deve ser um endereço de e-mail válido' })
  email!: string;

  @IsString({ message: 'name deve ser um texto' })
  @IsNotEmpty({ message: 'name não pode ser vazio' })
  name!: string;

  @IsString({ message: 'password deve ser um texto' })
  @MinLength(6, { message: 'password deve ter no mínimo 6 caracteres' })
  password!: string;
}
