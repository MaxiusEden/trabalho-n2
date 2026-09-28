import { NextResponse, type NextRequest } from 'next/server';
import { parseId, readJson, route } from '@/lib/http/api';
import { validateDto } from '@/lib/http/validation';
import { UpdateUserDto } from '@/lib/users/dto/update-user.dto';
import { usersService } from '@/lib/users/users.service';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ id: string }> };

/** GET /api/users/:id */
export const GET = route(async (_request: NextRequest, { params }: RouteContext) => {
  const id = parseId((await params).id);
  return NextResponse.json(await usersService.findOne(id));
});

/** PATCH /api/users/:id — atualização parcial. */
export const PATCH = route(async (request: NextRequest, { params }: RouteContext) => {
  const id = parseId((await params).id);
  const dto = await validateDto(UpdateUserDto, await readJson(request));
  return NextResponse.json(await usersService.update(id, dto));
});

/** DELETE /api/users/:id */
export const DELETE = route(async (_request: NextRequest, { params }: RouteContext) => {
  const id = parseId((await params).id);
  return NextResponse.json(await usersService.remove(id));
});
