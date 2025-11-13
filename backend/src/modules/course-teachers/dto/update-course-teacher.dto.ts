import { IsArray, IsOptional } from 'class-validator';

export class UpdateCourseTeacherDto {
  @IsArray()
  @IsOptional()
  groups?: string[];
}
