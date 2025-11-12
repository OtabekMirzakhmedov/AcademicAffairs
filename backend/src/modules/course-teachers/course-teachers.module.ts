import { Module } from '@nestjs/common';
import { CourseTeachersService } from './course-teachers.service';
import { CourseTeachersController } from './course-teachers.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [CourseTeachersService],
  controllers: [CourseTeachersController],
  exports: [CourseTeachersService],
})
export class CourseTeachersModule {}
