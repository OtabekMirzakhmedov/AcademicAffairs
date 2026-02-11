import { Module } from '@nestjs/common';
import { ResearchActivitiesController } from './research-activities.controller';
import { ResearchActivitiesService } from './research-activities.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ResearchActivitiesController],
  providers: [ResearchActivitiesService],
})
export class ResearchActivitiesModule {}
