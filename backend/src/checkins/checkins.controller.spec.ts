import { Test } from '@nestjs/testing';
import { CheckinsController } from './checkins.controller';
import { CheckinsService } from './checkins.service';

describe('CheckinsController', () => {
  let controller: CheckinsController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [CheckinsController],
      providers: [CheckinsService],
    }).compile();

    controller = moduleRef.get<CheckinsController>(CheckinsController);
  });

  it('deve criar o controller', () => {
    expect(controller).toBeDefined();
  });

  it('deve retornar a fila inicialmente vazia', () => {
    expect(controller.listar()).toEqual([]);
  });
});
