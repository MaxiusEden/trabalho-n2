import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ModulesController } from './modules.controller';
import { ModulesService } from './modules.service';
import { ROLES_KEY } from '../auth/roles.decorator';

describe('ModulesController', () => {
  let controller: ModulesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModulesController],
      providers: [{ provide: ModulesService, useValue: {} }],
    }).compile();

    controller = module.get<ModulesController>(ModulesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('todas as rotas exigem ADMIN (@Roles na classe)', () => {
    const roles = new Reflector().get<string[] | undefined>(
      ROLES_KEY,
      ModulesController,
    );
    expect(roles).toEqual(['ADMIN']);
  });
});
