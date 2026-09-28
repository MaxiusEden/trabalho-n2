import { NextResponse, type NextRequest } from 'next/server';
import { parseId, readJson, route } from '@/lib/http/api';
import { validateDto } from '@/lib/http/validation';
import { CreateEnrollmentDto } from '@/lib/enrollments/dto/create-enrollment.dto';
import { enrollmentsService } from '@/lib/enrollments/enrollments.service';

export const dynamic = 'force-dynamic';

/** GET /api/enrollments — aceita `?userId=` e `?courseId=`. */
export const GET = route(async (request: NextRequest) => {
  const { searchParams } = request.nextUrl;
  const userIdParam = searchParams.get('userId');
  const courseIdParam = searchParams.get('courseId');

  return NextResponse.json(
    await enrollmentsService.findAll({
      userId: userIdParam === null ? undefined : parseId(userIdParam),
      courseId: courseIdParam === null ? undefined : parseId(courseIdParam),
    }),
  );
});

/** POST /api/enrollments — matricula um usuário em um curso. */
export const POST = route(async (request: NextRequest) => {
  const dto = await validateDto(CreateEnrollmentDto, await readJson(request));
  return NextResponse.json(await enrollmentsService.create(dto), { status: 201 });
});
