import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { ROLES_KEY } from '../auth/roles.decorator';

describe('CategoriesController', () => {
  let controller: CategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [{ provide: CategoriesService, useValue: {} }],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('criar, editar e excluir exigem ADMIN; listar e buscar, não', () => {
    // O metadado fica na função do protótipo; lida como propriedade, sem chamar.
    const handlers = CategoriesController.prototype as unknown as Record<
      string,
      () => unknown
    >;
    const reflector = new Reflector();
    const roles = (handler: keyof CategoriesController) =>
      reflector.get<string[] | undefined>(ROLES_KEY, handlers[handler]);

    expect(roles('create')).toEqual(['ADMIN']);
    expect(roles('update')).toEqual(['ADMIN']);
    expect(roles('remove')).toEqual(['ADMIN']);
    expect(roles('findAll')).toBeUndefined();
    expect(roles('findOne')).toBeUndefined();
  });
});
