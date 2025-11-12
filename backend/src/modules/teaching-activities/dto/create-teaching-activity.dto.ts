import { IsInt, IsArray, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateTeachingActivityDto {
  @IsInt()
  courseTeacherId: number;

  @IsInt()
  courseId: number;

  @IsInt()
  academicPeriodId: number;

  @IsArray()
  groups: string[];

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
