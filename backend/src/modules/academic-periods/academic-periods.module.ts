import { Module } from '@nestjs/common';
import { AcademicPeriodsController } from './academic-periods.controller';
import { AcademicPeriodsService } from './academic-periods.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [AcademicPeriodsController],
  providers: [AcademicPeriodsService, PrismaService],
  exports: [AcademicPeriodsService],
})
export class AcademicPeriodsModule {}
