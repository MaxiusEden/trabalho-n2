import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../generated/prisma/enums';
import { AuthUser } from './auth-user';
import { RolesGuard } from './roles.guard';

function contextWith(user?: AuthUser): ExecutionContext {
  return {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  const reflector = { getAllAndOverride: jest.fn() };
  const guard = new RolesGuard(reflector as unknown as Reflector);
  const admin: AuthUser = { userId: 1, email: 'a@b.c', role: Role.ADMIN };
  const user: AuthUser = { userId: 2, email: 'u@b.c', role: Role.USER };

  beforeEach(() => reflector.getAllAndOverride.mockReset());

  it('rota sem @Roles passa para qualquer usuário logado', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    expect(guard.canActivate(contextWith(user))).toBe(true);
  });

  it('@Roles(ADMIN) deixa passar o ADMIN', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
    expect(guard.canActivate(contextWith(admin))).toBe(true);
  });

  it('@Roles(ADMIN) recusa o USER com 403', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
    expect(() => guard.canActivate(contextWith(user))).toThrow(
      ForbiddenException,
    );
  });

  it('@Roles(ADMIN) recusa requisição sem usuário com 403', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
    expect(() => guard.canActivate(contextWith(undefined))).toThrow(
      ForbiddenException,
    );
  });
});
