import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '../generated/prisma/client';

// Converte os erros conhecidos do Prisma em respostas HTTP, no lugar do 500
// padrão: P2002 (valor único repetido) → 409 e P2025 (registro não existe) → 404.
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const httpException = toHttpException(exception);
    response
      .status(httpException.getStatus())
      .json(httpException.getResponse());
  }
}

function toHttpException(
  exception: Prisma.PrismaClientKnownRequestError,
): HttpException {
  switch (exception.code) {
    case 'P2002': {
      const fields = uniqueFields(exception.meta);
      return new ConflictException(
        fields
          ? `Já existe um registro com esse valor em: ${fields}`
          : 'Já existe um registro com esse valor',
      );
    }
    case 'P2025':
      return new NotFoundException('Registro não encontrado');
    default:
      return new InternalServerErrorException();
  }
}

// O Prisma informa o campo em `meta.target`. Com o driver adapter do Postgres ele
// vem em `meta.driverAdapterError.cause`: às vezes `constraint.fields`, às vezes só
// o nome do índice (`constraint.index`, ex.: "User_email_key" → "email").
function uniqueFields(meta: Record<string, unknown> | undefined) {
  const target = meta?.target;
  if (Array.isArray(target)) return target.join(', ');
  if (typeof target === 'string') return target;

  const cause = (
    meta?.driverAdapterError as
      | {
          cause?: {
            table?: string;
            constraint?: { fields?: string[]; index?: string };
          };
        }
      | undefined
  )?.cause;
  const fields = cause?.constraint?.fields;
  if (fields?.length) return fields.join(', ');

  const index = cause?.constraint?.index;
  if (!index || !cause?.table) return undefined;
  const prefix = `${cause.table}_`;
  if (!index.startsWith(prefix) || !index.endsWith('_key')) return undefined;
  return index.slice(prefix.length, -'_key'.length).split('_').join(', ');
}
