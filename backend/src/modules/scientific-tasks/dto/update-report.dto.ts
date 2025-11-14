import { IsString, IsInt, IsOptional, Min, Max } from 'class-validator';

export class UpdateReportDto {
  @IsString()
  @IsOptional()
  executionStatus?: string;

  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  completionPercentage?: number;

  @IsString()
  @IsOptional()
  filePath?: string;

  @IsString()
  @IsOptional()
  fileName?: string;
}
