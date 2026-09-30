import { Test, TestingModule } from '@nestjs/testing';
import { TrilhasController } from './trilhas.controller';
import { TrilhasService } from './trilhas.service';

describe('TrilhasController', () => {
  let controller: TrilhasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrilhasController],
      providers: [{ provide: TrilhasService, useValue: {} }],
    }).compile();

    controller = module.get<TrilhasController>(TrilhasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
