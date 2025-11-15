import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { TeachingActivitiesModule } from './modules/teaching-activities/teaching-activities.module';
import { UsersModule } from './modules/users/users.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { CoursesModule } from './modules/courses/courses.module';
import { CourseTeachersModule } from './modules/course-teachers/course-teachers.module';
import { AcademicPeriodsModule } from "./modules/academic-periods/academic-periods.module";
import { ProgramsModule } from './modules/programs/programs.module';
import { ScientificTasksModule } from './modules/scientific-tasks/scientific-tasks.module';
import { PublicationsModule } from './modules/publications/publications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    TeachingActivitiesModule,
    UsersModule,
    DepartmentsModule,
    CoursesModule,
    CourseTeachersModule,
    AcademicPeriodsModule,
    ProgramsModule,
    ScientificTasksModule,
    PublicationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
