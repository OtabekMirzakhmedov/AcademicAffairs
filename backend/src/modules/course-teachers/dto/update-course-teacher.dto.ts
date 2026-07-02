import { IsArray, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCourseTeacherDto {
  @ApiPropertyOptional({
    example: ['CS-101', 'CS-103'],
    description: 'Updated group names',
  })
  @IsArray()
  @IsOptional()
  groups?: string[];
}
