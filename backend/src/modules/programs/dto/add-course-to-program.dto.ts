import { IsInt, IsBoolean, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddCourseToProgramDto {
  @ApiProperty({ example: 1, description: 'Course ID to add to program' })
  @IsInt()
  courseId: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Is course required (true) or elective (false)',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @ApiPropertyOptional({
    example: 3,
    description: 'Recommended semester to take this course (1-12)',
    minimum: 1,
    maximum: 12,
  })
  @IsInt()
  @Min(1)
  @Max(12)
  @IsOptional()
  recommendedSemester?: number;
}
