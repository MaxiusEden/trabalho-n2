/**
 * Erros de aplicação. Espelham as HttpException do NestJS: cada um carrega o
 * status HTTP que a rota deve devolver, e `toErrorResponse` (em `api.ts`) faz a
 * tradução para o corpo JSON.
 */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export class BadRequestError extends HttpError {
  constructor(message = 'Requisição inválida') {
    super(400, message);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = 'Credenciais inválidas') {
    super(401, message);
  }
}

export class NotFoundError extends HttpError {
  constructor(message = 'Registro não encontrado') {
    super(404, message);
  }
}

export class ConflictError extends HttpError {
  constructor(message = 'Conflito com um registro existente') {
    super(409, message);
  }
}

/** Falha de validação dos DTOs — equivale ao 400 do ValidationPipe do NestJS. */
export class ValidationFailedError extends HttpError {
  constructor(readonly messages: string[]) {
    super(400, messages[0] ?? 'Dados inválidos');
    this.name = 'ValidationFailedError';
  }
}
