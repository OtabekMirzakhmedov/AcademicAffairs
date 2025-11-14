import { Module } from '@nestjs/common';
import { ScientificTasksService } from './scientific-tasks.service';
import { ScientificTasksController } from './scientific-tasks.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ScientificTasksController],
  providers: [ScientificTasksService],
  exports: [ScientificTasksService],
})
export class ScientificTasksModule {}
