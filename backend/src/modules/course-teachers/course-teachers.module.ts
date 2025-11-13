import { Module } from '@nestjs/common';
import { CourseTeachersController } from './course-teachers.controller';
import { CourseTeachersService } from './course-teachers.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [CourseTeachersController],
  providers: [CourseTeachersService, PrismaService],
  exports: [CourseTeachersService],
})
export class CourseTeachersModule {}
