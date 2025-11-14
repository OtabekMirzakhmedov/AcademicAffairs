import { IsInt, IsBoolean, IsOptional, Min, Max } from 'class-validator';

export class AddCourseToProgramDto {
  @IsInt()
  courseId: number;

  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @IsInt()
  @Min(1)
  @Max(12)
  @IsOptional()
  recommendedSemester?: number;
}
