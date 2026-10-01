import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthUser } from '../auth/auth-user';

const aluno: AuthUser = { userId: 2, email: 'aluno@perero.com', role: 'USER' };
const admin: AuthUser = { userId: 1, email: 'admin@perero.com', role: 'ADMIN' };

describe('UsersController', () => {
  let controller: UsersController;
  const service = { update: jest.fn(), remove: jest.fn() };

  beforeEach(async () => {
    service.update.mockReset();
    service.remove.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: service }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('USER edita e exclui a própria conta', async () => {
    await controller.update({ user: aluno }, 2, { name: 'Novo' });
    await controller.remove({ user: aluno }, 2);
    expect(service.update).toHaveBeenCalledWith(2, { name: 'Novo' });
    expect(service.remove).toHaveBeenCalledWith(2);
  });

  it('USER em conta de outro: 403, nada alterado', () => {
    expect(() => controller.update({ user: aluno }, 9, { name: 'x' })).toThrow(
      ForbiddenException,
    );
    expect(() => controller.remove({ user: aluno }, 9)).toThrow(
      ForbiddenException,
    );
    expect(service.update).not.toHaveBeenCalled();
    expect(service.remove).not.toHaveBeenCalled();
  });

  it('ADMIN edita e exclui a conta de outro', async () => {
    await controller.update({ user: admin }, 9, { name: 'x' });
    await controller.remove({ user: admin }, 9);
    expect(service.update).toHaveBeenCalledWith(9, { name: 'x' });
    expect(service.remove).toHaveBeenCalledWith(9);
  });
});
