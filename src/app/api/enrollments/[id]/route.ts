import { NextResponse, type NextRequest } from 'next/server';
import { parseId, route } from '@/lib/http/api';
import { enrollmentsService } from '@/lib/enrollments/enrollments.service';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ id: string }> };

/** GET /api/enrollments/:id */
export const GET = route(async (_request: NextRequest, { params }: RouteContext) => {
  const id = parseId((await params).id);
  return NextResponse.json(await enrollmentsService.findOne(id));
});

/** DELETE /api/enrollments/:id — cancela a matrícula. */
export const DELETE = route(async (_request: NextRequest, { params }: RouteContext) => {
  const id = parseId((await params).id);
  return NextResponse.json(await enrollmentsService.remove(id));
});
