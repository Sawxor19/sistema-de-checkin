import { Body, Controller, Get, Post } from '@nestjs/common';

import { CheckinsService } from './checkins.service';
import type { Checkin } from './checkins.service';

@Controller('checkins')
export class CheckinsController {
  constructor(private readonly checkinsService: CheckinsService) {}

  // GET /checkins - Consulta a fila
  @Get()
  listar(): Checkin[] {
    return this.checkinsService.listar();
  }

  // POST /checkins - Registra um paciente
  @Post()
  criar(@Body('cpf') cpf: string): Promise<Checkin> {
    return this.checkinsService.criar(cpf);
  }
}
