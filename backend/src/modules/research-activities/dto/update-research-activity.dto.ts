import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateResearchActivityDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  completionPercentage?: number;

  @IsOptional()
  @IsString()
  filePath?: string;

  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @IsString()
  deadline?: string;
}
