import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../generated/prisma/enums';
import { AuthenticatedRequest } from './auth-user';
import { ROLES_KEY } from './roles.decorator';

// Roda depois do AuthGuard('jwt'): o perfil vem do token (req.user.role), então
// uma troca de perfil só vale depois de um novo login.
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<Role[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!roles || roles.length === 0) return true;

    const { user } = context
      .switchToHttp()
      .getRequest<Partial<AuthenticatedRequest>>();
    if (user && roles.includes(user.role)) return true;

    throw new ForbiddenException('Acesso restrito a administradores');
  }
}
