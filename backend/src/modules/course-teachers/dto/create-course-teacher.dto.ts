import { IsInt, IsNotEmpty, IsArray, IsOptional } from 'class-validator';

export class CreateCourseTeacherDto {
  @IsInt()
  @IsNotEmpty()
  courseId: number;

  @IsInt()
  @IsNotEmpty()
  teacherId: number;

  @IsInt()
  @IsNotEmpty()
  academicPeriodId: number;

  @IsArray()
  @IsOptional()
  groups?: string[]; // Optional array of group names
}
