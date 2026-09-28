import { ArgumentsHost } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaExceptionFilter } from './prisma-exception.filter';

function prismaError(code: string, meta?: Record<string, unknown>) {
  return new Prisma.PrismaClientKnownRequestError('erro de teste', {
    code,
    clientVersion: 'test',
    meta,
  });
}

function run(error: Prisma.PrismaClientKnownRequestError) {
  const json = jest.fn((body: { message: string }) => body);
  const status = jest.fn((code: number) => ({ code, json }));
  const host = {
    switchToHttp: () => ({ getResponse: () => ({ status }) }),
  } as unknown as ArgumentsHost;

  new PrismaExceptionFilter().catch(error, host);
  return {
    status: status.mock.calls[0][0],
    body: json.mock.calls[0][0],
  };
}

describe('PrismaExceptionFilter', () => {
  it('P2002 (valor único repetido) vira 409 com o campo', () => {
    const { status, body } = run(prismaError('P2002', { target: ['email'] }));
    expect(status).toBe(409);
    expect(body.message).toContain('email');
  });

  it('P2002 do driver adapter (só o índice) vira 409 com o campo', () => {
    const { status, body } = run(
      prismaError('P2002', {
        driverAdapterError: {
          cause: {
            kind: 'UniqueConstraintViolation',
            constraint: { index: 'User_email_key' },
            table: 'User',
          },
        },
        modelName: 'User',
      }),
    );
    expect(status).toBe(409);
    expect(body.message).toBe('Já existe um registro com esse valor em: email');
  });

  it('P2002 sem meta vira 409 com mensagem genérica', () => {
    const { status, body } = run(prismaError('P2002'));
    expect(status).toBe(409);
    expect(body.message).toBe('Já existe um registro com esse valor');
  });

  it('P2025 (registro não existe) vira 404', () => {
    expect(run(prismaError('P2025')).status).toBe(404);
  });

  it('outros códigos continuam 500', () => {
    expect(run(prismaError('P2003')).status).toBe(500);
  });
});
