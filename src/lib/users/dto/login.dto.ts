import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

/** Credenciais da tela de Login. */
export class LoginDto {
  @IsEmail({}, { message: 'email deve ser um endereço de e-mail válido' })
  email!: string;

  @IsString({ message: 'password deve ser um texto' })
  @IsNotEmpty({ message: 'password não pode ser vazio' })
  password!: string;
}
