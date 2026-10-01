/** Helpers de exibição compartilhados entre server e client components. */

export function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/** Converte "97,00" ou "97.00" no inteiro de centavos guardado no banco. */
export function parsePriceToCents(input: string): number | null {
  const normalized = input.trim().replace(/\s/g, '').replace(',', '.');
  if (normalized === '' || !/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  return Math.round(Number(normalized) * 100);
}

export function formatDate(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

/** Só a data, sem hora (ex.: data de publicação do curso). */
export function formatDay(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString('pt-BR', { dateStyle: 'short' });
}

const LEVEL_LABELS = {
  INICIANTE: 'Iniciante',
  INTERMEDIARIO: 'Intermediário',
  AVANCADO: 'Avançado',
} as const;

export const COURSE_LEVELS = Object.keys(LEVEL_LABELS) as (keyof typeof LEVEL_LABELS)[];

export function formatLevel(level: keyof typeof LEVEL_LABELS): string {
  return LEVEL_LABELS[level];
}

export function formatDuration(minutes: number): string {
  return `${minutes} min`;
}

/** "1 aula", "4 aulas", "0 aulas". */
export function formatCount(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
