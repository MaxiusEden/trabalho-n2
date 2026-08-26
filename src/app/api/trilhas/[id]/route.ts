import { NextResponse, type NextRequest } from 'next/server';
import { parseId, readJson, route } from '@/lib/http/api';
import { validateDto } from '@/lib/http/validation';
import { UpdateTrilhaDto } from '@/lib/trilhas/dto/update-trilha.dto';
import { trilhasService } from '@/lib/trilhas/trilhas.service';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ id: string }> };

/** GET /api/trilhas/:id — inclui os cursos da trilha. */
export const GET = route(async (_request: NextRequest, { params }: RouteContext) => {
  const id = parseId((await params).id);
  return NextResponse.json(await trilhasService.findOne(id));
});

/** PATCH /api/trilhas/:id */
export const PATCH = route(async (request: NextRequest, { params }: RouteContext) => {
  const id = parseId((await params).id);
  const dto = await validateDto(UpdateTrilhaDto, await readJson(request));
  return NextResponse.json(await trilhasService.update(id, dto));
});

/** DELETE /api/trilhas/:id */
export const DELETE = route(async (_request: NextRequest, { params }: RouteContext) => {
  const id = parseId((await params).id);
  return NextResponse.json(await trilhasService.remove(id));
});
