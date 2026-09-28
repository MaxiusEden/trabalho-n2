import { NextResponse, type NextRequest } from 'next/server';
import { readJson, route } from '@/lib/http/api';
import { validateDto } from '@/lib/http/validation';
import { UnauthorizedError } from '@/lib/http/errors';
import { LoginDto } from '@/lib/users/dto/login.dto';
import { usersService } from '@/lib/users/users.service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/login — confere as credenciais contra a tabela `User`.
 * É só a verificação de credenciais que a tela de Login precisa para identificar
 * quem está se matriculando; não emite sessão nem token.
 */
export const POST = route(async (request: NextRequest) => {
  const dto = await validateDto(LoginDto, await readJson(request));

  const user = await usersService.authenticate(dto.email, dto.password);
  if (!user) throw new UnauthorizedError('E-mail ou senha incorretos');

  return NextResponse.json(user);
});
