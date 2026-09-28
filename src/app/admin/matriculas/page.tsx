import { coursesService } from '@/lib/courses/courses.service';
import { enrollmentsService } from '@/lib/enrollments/enrollments.service';
import { usersService } from '@/lib/users/users.service';
import { EnrollmentsManager } from '@/components/admin/EnrollmentsManager';

export const dynamic = 'force-dynamic';

export default async function AdminMatriculasPage({
  searchParams,
}: PageProps<'/admin/matriculas'>) {
  const { userId: userIdParam } = await searchParams;

  const parsed = Number(Array.isArray(userIdParam) ? userIdParam[0] : userIdParam);
  const filterUserId = Number.isInteger(parsed) && parsed > 0 ? parsed : null;

  const [enrollments, users, courses] = await Promise.all([
    enrollmentsService.findAll(filterUserId === null ? {} : { userId: filterUserId }),
    usersService.findAll(),
    coursesService.findAll(),
  ]);

  return (
    <div>
      <h1 className="admin-title">Matrículas</h1>
      <p className="text-muted mb-4">
        Relação entre <code>User</code> e <code>Course</code>. O banco impede a mesma pessoa de se
        matricular duas vezes no mesmo curso.
      </p>

      <EnrollmentsManager
        enrollments={enrollments}
        users={users.map((user) => ({ id: user.id, name: user.name, email: user.email }))}
        courses={courses.map((course) => ({ id: course.id, title: course.title }))}
        filterUserId={filterUserId}
      />
    </div>
  );
}
