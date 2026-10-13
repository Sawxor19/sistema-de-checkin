import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { CheckinsModule } from './checkins/checkins.module';

@Module({
  imports: [CheckinsModule],
  controllers: [AppController],
})
export class AppModule {}
