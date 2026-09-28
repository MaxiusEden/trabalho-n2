import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { formatPrice } from '@/lib/format';

type CourseCardProps = {
  course: {
    id: number;
    title: string;
    description: string;
    image: string;
    priceCents: number;
  };
  trilhaTitle?: string | null;
};

/** Card de curso usado na Home e no detalhe da trilha. O card inteiro é o link. */
export function CourseCard({ course, trilhaTitle }: CourseCardProps) {
  return (
    <article className="card course-card h-100">
      {/* eslint-disable-next-line @next/next/no-img-element -- a capa é uma URL livre cadastrada pelo admin */}
      <img src={course.image} className="card-img-top course-cover" alt="" />
      <div className="card-body d-flex flex-column">
        {trilhaTitle && <span className="tag align-self-start mb-2">{trilhaTitle}</span>}
        <h2 className="course-card__title">
          <Link href={`/curso/${course.id}`} className="stretched-link">
            {course.title}
          </Link>
        </h2>
        <p className="course-card__description">{course.description}</p>
        <div className="course-card__footer">
          <span className="price">{formatPrice(course.priceCents)}</span>
          <span className="course-card__cta" aria-hidden="true">
            Ver curso
            <ArrowRight size={16} />
          </span>
        </div>
      </div>
    </article>
  );
}
