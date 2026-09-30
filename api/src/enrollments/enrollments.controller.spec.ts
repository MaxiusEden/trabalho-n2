import { Test, TestingModule } from '@nestjs/testing';
import { EnrollmentsController } from './enrollments.controller';
import { EnrollmentsService } from './enrollments.service';

describe('EnrollmentsController', () => {
  let controller: EnrollmentsController;
  const service = { create: jest.fn() };

  beforeEach(async () => {
    service.create.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnrollmentsController],
      providers: [{ provide: EnrollmentsService, useValue: service }],
    }).compile();

    controller = module.get<EnrollmentsController>(EnrollmentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('matricula o usuário do token (req.user), não um do corpo', async () => {
    service.create.mockResolvedValue({ id: 10 });

    // Mesmo que alguém force um userId no corpo, o controller só lê courseId.
    const body = { courseId: 3, userId: 999 } as { courseId: number };
    await controller.create(
      { user: { userId: 42, email: 'aluno@perero.com' } },
      body,
    );

    expect(service.create).toHaveBeenCalledWith(42, 3);
  });
});
