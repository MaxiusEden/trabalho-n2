import { coursesService } from '@/lib/courses/courses.service';
import { trilhasService } from '@/lib/trilhas/trilhas.service';
import { CoursesManager } from '@/components/admin/CoursesManager';

export const dynamic = 'force-dynamic';

export default async function AdminCursosPage() {
  const [courses, trilhas] = await Promise.all([
    coursesService.findAll(),
    trilhasService.findAll(),
  ]);

  return (
    <div>
      <h1 className="admin-title">Cursos</h1>
      <p className="text-muted mb-4">Cadastre cursos com preço, trilha e a lista de aulas.</p>

      <CoursesManager
        courses={courses}
        trilhas={trilhas.map((trilha) => ({ id: trilha.id, title: trilha.title }))}
      />
    </div>
  );
}
