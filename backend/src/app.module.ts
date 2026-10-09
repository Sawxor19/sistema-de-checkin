import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CheckinsModule } from './checkins/checkins.module';

@Module({
  imports: [CheckinsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
