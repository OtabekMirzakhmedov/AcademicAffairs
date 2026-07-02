import { IsInt, IsArray, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTeachingActivityDto {
  @ApiProperty({ example: 1, description: 'Course-teacher assignment ID' })
  @IsInt()
  courseTeacherId: number;

  @ApiProperty({ example: 1, description: 'Course ID' })
  @IsInt()
  courseId: number;

  @ApiProperty({ example: 1, description: 'Academic period ID' })
  @IsInt()
  academicPeriodId: number;

  @ApiPropertyOptional({
    example: ['CS-101', 'CS-102'],
    description: 'Group names',
  })
  @IsArray()
  @IsOptional()
  groups?: string[];

  @ApiPropertyOptional({ example: 2, description: 'Lecture hours', minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  lectureHours?: number;

  @ApiPropertyOptional({
    example: 1.5,
    description: 'Practice hours',
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  practiceHours?: number;

  @ApiPropertyOptional({ example: 2, description: 'Lab hours', minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  labHours?: number;

  @ApiPropertyOptional({ example: 1, description: 'Seminar hours', minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  seminarHours?: number;

  @ApiPropertyOptional({
    example: 0.5,
    description: 'Advising hours',
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  advisingHours?: number;
}
