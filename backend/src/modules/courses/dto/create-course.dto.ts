import { IsString, IsNotEmpty, IsInt, IsOptional, IsArray } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @IsNotEmpty()
  departmentId: number;

  // Optional: Assign teacher immediately when creating course
  @IsInt()
  @IsOptional()
  teacherId?: number;

  @IsInt()
  @IsOptional()
  academicPeriodId?: number;

  @IsArray()
  @IsOptional()
  groups?: string[];
}
