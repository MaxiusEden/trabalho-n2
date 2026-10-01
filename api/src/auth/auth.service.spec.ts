import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let service: AuthService;
  const usersService = { findByEmail: jest.fn() };
  const jwtService = { sign: jest.fn() };

  beforeEach(async () => {
    usersService.findByEmail.mockReset();
    jwtService.sign.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('o token leva sub, email e role', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: 7,
      email: 'admin@perero.com',
      role: 'ADMIN',
      password: await bcrypt.hash('senha123', 4),
    });
    jwtService.sign.mockReturnValue('token');

    const result = await service.login({
      email: 'admin@perero.com',
      password: 'senha123',
    });

    expect(result).toEqual({ access_token: 'token' });
    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: 7,
      email: 'admin@perero.com',
      role: 'ADMIN',
    });
  });

  it('senha errada: 401 sem gerar token', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: 7,
      email: 'aluno@perero.com',
      role: 'USER',
      password: await bcrypt.hash('senha123', 4),
    });

    await expect(
      service.login({ email: 'aluno@perero.com', password: 'errada' }),
    ).rejects.toThrow('E-mail ou senha incorretos');
    expect(jwtService.sign).not.toHaveBeenCalled();
  });
});
