import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCourseDto {
  @ApiPropertyOptional({ example: 'Advanced Programming', description: 'Course name' })
  @IsString()
  @IsOptional()
  name?: string;
}
