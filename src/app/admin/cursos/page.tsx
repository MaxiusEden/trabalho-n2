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
    <div className="container-fluid">
      <h1 className="h3 text-black mb-1">Cursos</h1>
      <p className="text-muted">
        Cada curso pode pertencer a uma trilha e ter seu conteúdo programático (aulas).
      </p>

      <CoursesManager
        courses={courses}
        trilhas={trilhas.map((trilha) => ({ id: trilha.id, title: trilha.title }))}
      />
    </div>
  );
}
