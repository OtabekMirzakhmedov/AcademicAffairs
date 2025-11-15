import { IsString, IsInt, IsOptional, Min, Max, IsNumber } from 'class-validator';

export class CreateReportDto {
  @IsInt()
  scientificTaskId: number;

  @IsString()
  @IsOptional()
  executionStatus?: string;

  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  completionPercentage?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  equivalentHours?: number;
}
