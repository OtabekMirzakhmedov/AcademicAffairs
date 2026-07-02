import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuditModule } from './modules/audit/audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { TeachingActivitiesModule } from './modules/teaching-activities/teaching-activities.module';
import { UsersModule } from './modules/users/users.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { CoursesModule } from './modules/courses/courses.module';
import { CourseTeachersModule } from './modules/course-teachers/course-teachers.module';
import { AcademicPeriodsModule } from './modules/academic-periods/academic-periods.module';
import { ProgramsModule } from './modules/programs/programs.module';
import { ScientificTasksModule } from './modules/scientific-tasks/scientific-tasks.module';
import { PublicationsModule } from './modules/publications/publications.module';
import { ResearchActivitiesModule } from './modules/research-activities/research-activities.module';
import { ReportsPdfModule } from './modules/reports-pdf/reports-pdf.module';
import { ReportsExcelModule } from './modules/reports-excel/reports-excel.module';
import { ReportsDocxModule } from './modules/reports-docx/reports-docx.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule.forRoot({
      useExisting: true,
    }),
    PrismaModule,
    AuditModule,
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
    ResearchActivitiesModule,
    // Isolated per-format report generators — each can be removed
    // independently (see each module's README) without touching the others.
    ReportsPdfModule,
    ReportsExcelModule,
    ReportsDocxModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
