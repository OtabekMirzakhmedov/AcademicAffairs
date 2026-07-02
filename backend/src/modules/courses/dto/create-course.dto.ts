import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsArray,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({
    example: 'Introduction to Programming',
    description: 'Course name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 1, description: 'Department ID' })
  @IsInt()
  @IsNotEmpty()
  departmentId: number;

  @ApiPropertyOptional({
    example: 30,
    description: 'Lecture hours (contact hours)',
  })
  @IsNumber()
  @IsOptional()
  lectureHours?: number;

  @ApiPropertyOptional({
    example: 15,
    description: 'Practice hours (seminars, labs, PBL/CBL)',
  })
  @IsNumber()
  @IsOptional()
  practiceHours?: number;

  @ApiPropertyOptional({
    example: 5,
    description: 'Teacher user ID to assign immediately',
  })
  @IsInt()
  @IsOptional()
  teacherId?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Academic period ID for assignment',
  })
  @IsInt()
  @IsOptional()
  academicPeriodId?: number;

  @ApiPropertyOptional({
    example: ['CS-101', 'CS-102'],
    description: 'Group names for assignment',
  })
  @IsArray()
  @IsOptional()
  groups?: string[];
}
