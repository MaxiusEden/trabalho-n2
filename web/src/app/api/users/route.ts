import { NextResponse, type NextRequest } from 'next/server';
import { readJson, route } from '@/lib/http/api';
import { validateDto } from '@/lib/http/validation';
import { CreateUserDto } from '@/lib/users/dto/create-user.dto';
import { usersService } from '@/lib/users/users.service';

export const dynamic = 'force-dynamic';

/** GET /api/users — lista todos os usuários. */
export const GET = route(async () => {
  return NextResponse.json(await usersService.findAll());
});

/** POST /api/users — cria um usuário. */
export const POST = route(async (request: NextRequest) => {
  const dto = await validateDto(CreateUserDto, await readJson(request));
  return NextResponse.json(await usersService.create(dto), { status: 201 });
});
