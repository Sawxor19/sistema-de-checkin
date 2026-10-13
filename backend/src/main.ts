import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { frontendOrigins, integerSetting } from './config';

if (existsSync('.env')) loadEnvFile('.env');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Permite requisições do nosso frontend React
  app.enableCors({
    origin: frontendOrigins(),
  });

  app.enableShutdownHooks();
  await app.listen(integerSetting('PORT', 3000), '0.0.0.0');
}

void bootstrap();
