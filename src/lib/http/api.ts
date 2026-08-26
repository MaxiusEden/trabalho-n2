import { NextResponse } from 'next/server';
import { Prisma } from '@/generated/prisma/client';
import { BadRequestError, HttpError, ValidationFailedError } from './errors';

/** Corpo de erro no mesmo formato do NestJS: `{ statusCode, message, error }`. */
export type ErrorBody = {
  statusCode: number;
  message: string | string[];
  error: string;
};

const STATUS_TEXT: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  404: 'Not Found',
  409: 'Conflict',
  500: 'Internal Server Error',
};

/**
 * Envolve o handler da rota e traduz qualquer exceção em uma resposta HTTP.
 * É o que impede que um erro do Prisma (e-mail duplicado, registro inexistente)
 * vaze como 500 — a pergunta que o PDF deixa em aberto na última página.
 */
export function route<Args extends unknown[]>(
  handler: (...args: Args) => Promise<Response>,
): (...args: Args) => Promise<Response> {
  return async (...args: Args) => {
    try {
      return await handler(...args);
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}

export function toErrorResponse(error: unknown): NextResponse<ErrorBody> {
  const { status, message } = describe(error);
  if (status >= 500) console.error(error);

  return NextResponse.json(
    { statusCode: status, message, error: STATUS_TEXT[status] ?? 'Error' },
    { status },
  );
}

function describe(error: unknown): { status: number; message: string | string[] } {
  if (error instanceof ValidationFailedError) {
    return { status: error.status, message: error.messages };
  }

  if (error instanceof HttpError) {
    return { status: error.status, message: error.message };
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': {
        const fields = uniqueConstraintFields(error);
        return {
          status: 409,
          message:
            fields.length === 0
              ? 'Já existe um registro com estes valores'
              : `Já existe um registro com ${fields.length === 1 ? 'este' : 'esta combinação de'} ${fields.join(' + ')}`,
        };
      }
      case 'P2025':
        return { status: 404, message: 'Registro não encontrado' };
      case 'P2003':
        return {
          status: 400,
          message: 'Relacionamento inválido: o registro referenciado não existe',
        };
    }
  }

  return { status: 500, message: 'Erro interno do servidor' };
}

/**
 * Descobre quais campos violaram a constraint única do P2002.
 *
 * Com driver adapter (Prisma 7) os campos chegam em
 * `meta.driverAdapterError.cause.constraint.fields`; sem adapter, no `meta.target`
 * clássico ("User_email_key"). As duas formas são aceitas.
 */
function uniqueConstraintFields(error: Prisma.PrismaClientKnownRequestError): string[] {
  const meta = error.meta as Record<string, unknown> | undefined;

  const adapterFields = (meta?.driverAdapterError as
    | { cause?: { constraint?: { fields?: unknown } } }
    | undefined)?.cause?.constraint?.fields;

  if (Array.isArray(adapterFields)) {
    return adapterFields.map(String).filter(Boolean);
  }

  const target = meta?.target;
  if (Array.isArray(target)) return target.map(String).filter(Boolean);

  if (typeof target === 'string') {
    // "User_email_key" -> ["email"]
    return target
      .replace(/_key$/, '')
      .split(/[_,\s]+/)
      .filter((part) => part && !/^(user|course|trilha|lesson|enrollment)$/i.test(part));
  }

  return [];
}

/** Converte o `:id` da rota em número, como o `+id` do controller do PDF. */
export function parseId(raw: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id < 1) {
    throw new BadRequestError(`"${raw}" não é um id válido`);
  }
  return id;
}

/** Lê o corpo da requisição como JSON, devolvendo 400 se estiver malformado. */
export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new BadRequestError('Corpo da requisição não é um JSON válido');
  }
}
