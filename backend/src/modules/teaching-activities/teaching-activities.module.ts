import { Module } from '@nestjs/common';
import { TeachingActivitiesService } from './teaching-activities.service';
import { TeachingActivitiesController } from './teaching-activities.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TeachingActivitiesController],
  providers: [TeachingActivitiesService],
  exports: [TeachingActivitiesService],
})
export class TeachingActivitiesModule {}
