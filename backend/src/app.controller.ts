import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  info() {
    return {
      name: 'Sistema de check-in hospitalar',
      routes: ['/health', '/checkins'],
    };
  }

  @Get('health')
  health() {
    return { status: 'ok', storage: 'memory', timezone: 'America/Sao_Paulo' };
  }
}
