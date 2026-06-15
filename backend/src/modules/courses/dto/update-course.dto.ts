import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCourseDto {
  @ApiPropertyOptional({ example: 'Advanced Programming', description: 'Course name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 30, description: 'Lecture hours (contact hours)' })
  @IsNumber()
  @IsOptional()
  lectureHours?: number;

  @ApiPropertyOptional({ example: 15, description: 'Practice hours (seminars, labs, PBL/CBL)' })
  @IsNumber()
  @IsOptional()
  practiceHours?: number;
}
