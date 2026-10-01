import { Role } from '../generated/prisma/enums';

// O que a JwtStrategy.validate anexa em req.user.
export interface AuthUser {
  userId: number;
  email: string;
  role: Role;
}

export interface AuthenticatedRequest {
  user: AuthUser;
}

export const isAdmin = (user: AuthUser) => user.role === Role.ADMIN;
