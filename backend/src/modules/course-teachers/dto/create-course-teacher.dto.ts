import { IsInt, IsNotEmpty, IsArray, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCourseTeacherDto {
  @ApiProperty({ example: 1, description: 'Course ID' })
  @IsInt()
  @IsNotEmpty()
  courseId: number;

  @ApiProperty({ example: 5, description: 'Teacher user ID' })
  @IsInt()
  @IsNotEmpty()
  teacherId: number;

  @ApiProperty({ example: 1, description: 'Academic period ID' })
  @IsInt()
  @IsNotEmpty()
  academicPeriodId: number;

  @ApiPropertyOptional({ example: ['CS-101', 'CS-102'], description: 'Group names' })
  @IsArray()
  @IsOptional()
  groups?: string[];
}
