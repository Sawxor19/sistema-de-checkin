import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { CheckinsService } from './checkins.service';

describe('CheckinsService', () => {
  let service: CheckinsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [CheckinsService],
    }).compile();

    service = moduleRef.get<CheckinsService>(CheckinsService);
  });

  it('deve criar o service', () => {
    expect(service).toBeDefined();
  });

  it('deve retornar uma fila inicialmente vazia', () => {
    expect(service.listar()).toEqual([]);
  });

  it('deve rejeitar CPF com formato inválido', async () => {
    await expect(service.criar('123')).rejects.toThrow(BadRequestException);
  });
});
