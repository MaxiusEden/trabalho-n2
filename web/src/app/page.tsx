import Link from 'next/link';
import { coursesApi } from '@/lib/api';
import { CourseCard } from '@/components/CourseCard';
import { EmptyState } from '@/components/EmptyState';

export const dynamic = 'force-dynamic';

/** Home: os cursos vêm do `GET /courses` do Nest (público). */
export default async function HomePage() {
  const courses = await coursesApi.list();

  return (
    <div className="container">
      <header className="page-header">
        <h1 className="page-title">Cursos</h1>
        <p className="page-lead">Escolha um curso para ver as aulas, o preço e se matricular.</p>
      </header>

      {courses.length === 0 ? (
        <EmptyState>
          Nenhum curso cadastrado ainda. <Link href="/admin/cursos">Cadastrar o primeiro curso</Link>.
        </EmptyState>
      ) : (
        <div className="row g-4">
          {courses.map((course) => (
            <div key={course.id} className="col-12 col-md-6 col-lg-4">
              <CourseCard course={course} trilhaTitle={course.trilha?.title} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
