import { NextResponse, type NextRequest } from 'next/server';
import { readJson, route } from '@/lib/http/api';
import { validateDto } from '@/lib/http/validation';
import { CreateTrilhaDto } from '@/lib/trilhas/dto/create-trilha.dto';
import { trilhasService } from '@/lib/trilhas/trilhas.service';

export const dynamic = 'force-dynamic';

/** GET /api/trilhas */
export const GET = route(async () => {
  return NextResponse.json(await trilhasService.findAll());
});

/** POST /api/trilhas */
export const POST = route(async (request: NextRequest) => {
  const dto = await validateDto(CreateTrilhaDto, await readJson(request));
  return NextResponse.json(await trilhasService.create(dto), { status: 201 });
});
