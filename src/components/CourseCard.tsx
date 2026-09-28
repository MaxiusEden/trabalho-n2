import Link from 'next/link';
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

/**
 * Card de curso usado na Home e no detalhe da trilha. O card inteiro é o link;
 * o título dá o nome acessível (aria-labelledby), sem ler a descrição e o preço.
 */
export function CourseCard({ course, trilhaTitle }: CourseCardProps) {
  const titleId = `course-title-${course.id}`;

  return (
    <Link href={`/curso/${course.id}`} className="card course-card h-100" aria-labelledby={titleId}>
      {/* eslint-disable-next-line @next/next/no-img-element -- a capa é uma URL livre cadastrada pelo admin */}
      <img src={course.image} className="card-img-top course-cover" alt="" />
      <div className="card-body d-flex flex-column">
        <h2 id={titleId} className="course-card__title">
          {course.title}
        </h2>
        <p className="course-card__description">{course.description}</p>
        <div className="course-card__footer">
          <span className="price">{formatPrice(course.priceCents)}</span>
          {trilhaTitle && <span className="text-muted small text-end">{trilhaTitle}</span>}
        </div>
      </div>
    </Link>
  );
}
