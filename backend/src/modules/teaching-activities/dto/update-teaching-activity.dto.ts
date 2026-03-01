import { IsInt, IsArray, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTeachingActivityDto {
  @ApiPropertyOptional({ example: 2, description: 'Course-teacher assignment ID' })
  @IsInt()
  @IsOptional()
  courseTeacherId?: number;

  @ApiPropertyOptional({ example: 2, description: 'Course ID' })
  @IsInt()
  @IsOptional()
  courseId?: number;

  @ApiPropertyOptional({ example: 1, description: 'Academic period ID' })
  @IsInt()
  @IsOptional()
  academicPeriodId?: number;

  @ApiPropertyOptional({ example: ['CS-101', 'CS-103'], description: 'Group names' })
  @IsArray()
  @IsOptional()
  groups?: string[];

  @ApiPropertyOptional({ example: 3, description: 'Lecture hours', minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  lectureHours?: number;

  @ApiPropertyOptional({ example: 2, description: 'Practice hours', minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  practiceHours?: number;

  @ApiPropertyOptional({ example: 1.5, description: 'Lab hours', minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  labHours?: number;

  @ApiPropertyOptional({ example: 1, description: 'Seminar hours', minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  seminarHours?: number;

  @ApiPropertyOptional({ example: 1, description: 'Advising hours', minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  advisingHours?: number;
}
