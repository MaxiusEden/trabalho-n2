import { NextResponse, type NextRequest } from 'next/server';
import { parseId, readJson, route } from '@/lib/http/api';
import { validateDto } from '@/lib/http/validation';
import { CreateCourseDto } from '@/lib/courses/dto/create-course.dto';
import { coursesService } from '@/lib/courses/courses.service';

export const dynamic = 'force-dynamic';

/** GET /api/courses — aceita `?trilhaId=` para filtrar por trilha. */
export const GET = route(async (request: NextRequest) => {
  const trilhaIdParam = request.nextUrl.searchParams.get('trilhaId');
  const trilhaId = trilhaIdParam === null ? undefined : parseId(trilhaIdParam);
  return NextResponse.json(await coursesService.findAll({ trilhaId }));
});

/** POST /api/courses — cria o curso junto com o seu conteúdo programático. */
export const POST = route(async (request: NextRequest) => {
  const dto = await validateDto(CreateCourseDto, await readJson(request));
  return NextResponse.json(await coursesService.create(dto), { status: 201 });
});
