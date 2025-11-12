import { IsInt, IsArray, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateTeachingActivityDto {
  @IsInt()
  @IsOptional()
  courseTeacherId?: number;

  @IsInt()
  @IsOptional()
  courseId?: number;

  @IsInt()
  @IsOptional()
  academicPeriodId?: number;

  @IsArray()
  @IsOptional()
  groups?: string[];

  @IsNumber()
  @Min(0)
  @IsOptional()
  lectureHours?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  practiceHours?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  labHours?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  seminarHours?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  advisingHours?: number;
}
