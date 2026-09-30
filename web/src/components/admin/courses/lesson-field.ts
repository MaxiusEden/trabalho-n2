/** `key` identifica a linha do formulário; não vai para a API. */
export type LessonField = { key: string; title: string; duration: string };

let lessonKeySeq = 0;
export const newLessonKey = () => `aula-${++lessonKeySeq}`;
