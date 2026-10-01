import { SetMetadata } from '@nestjs/common';
import { Role } from '../generated/prisma/enums';

export const ROLES_KEY = 'roles';

// Marca a rota com os perfis que podem usá-la. Lido pelo RolesGuard.
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
