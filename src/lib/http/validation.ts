import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ValidationFailedError } from './errors';

/**
 * Equivalente ao `app.useGlobalPipes(new ValidationPipe())` do PDF.
 *
 * `whitelist` + `forbidNonWhitelisted` são ativados de propósito: sem eles um
 * campo extra no corpo da requisição chegaria até o Prisma e derrubaria a rota
 * com erro 500 em vez de um 400 explicando o problema.
 */
export async function validateDto<T extends object>(
  cls: new () => T,
  payload: unknown,
): Promise<T> {
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
    throw new ValidationFailedError(['O corpo da requisição deve ser um objeto JSON']);
  }

  const instance = plainToInstance(cls, payload, { enableImplicitConversion: false });
  const errors = await validate(instance, {
    whitelist: true,
    forbidNonWhitelisted: true,
    forbidUnknownValues: true,
  });

  if (errors.length > 0) {
    throw new ValidationFailedError(flattenMessages(errors));
  }

  return instance;
}

type ValidationErrorLike = {
  constraints?: Record<string, string>;
  children?: ValidationErrorLike[];
};

/** Achata os erros aninhados (`@ValidateNested`) numa lista simples de mensagens. */
function flattenMessages(errors: ValidationErrorLike[]): string[] {
  return errors.flatMap((error) => [
    ...Object.values(error.constraints ?? {}),
    ...flattenMessages(error.children ?? []),
  ]);
}
