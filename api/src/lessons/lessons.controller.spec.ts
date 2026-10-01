import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';
import { ROLES_KEY } from '../auth/roles.decorator';

describe('LessonsController', () => {
  let controller: LessonsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LessonsController],
      providers: [{ provide: LessonsService, useValue: {} }],
    }).compile();

    controller = module.get<LessonsController>(LessonsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('todas as rotas exigem ADMIN (@Roles na classe)', () => {
    const roles = new Reflector().get<string[] | undefined>(
      ROLES_KEY,
      LessonsController,
    );
    expect(roles).toEqual(['ADMIN']);
  });
});
