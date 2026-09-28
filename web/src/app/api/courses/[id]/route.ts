import { NextResponse, type NextRequest } from 'next/server';
import { parseId, readJson, route } from '@/lib/http/api';
import { validateDto } from '@/lib/http/validation';
import { UpdateCourseDto } from '@/lib/courses/dto/update-course.dto';
import { coursesService } from '@/lib/courses/courses.service';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ id: string }> };

/** GET /api/courses/:id */
export const GET = route(async (_request: NextRequest, { params }: RouteContext) => {
  const id = parseId((await params).id);
  return NextResponse.json(await coursesService.findOne(id));
});

/** PATCH /api/courses/:id */
export const PATCH = route(async (request: NextRequest, { params }: RouteContext) => {
  const id = parseId((await params).id);
  const dto = await validateDto(UpdateCourseDto, await readJson(request));
  return NextResponse.json(await coursesService.update(id, dto));
});

/** DELETE /api/courses/:id */
export const DELETE = route(async (_request: NextRequest, { params }: RouteContext) => {
  const id = parseId((await params).id);
  return NextResponse.json(await coursesService.remove(id));
});
