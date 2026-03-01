import { IsString, IsInt, IsOptional, Min, Max, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateReportDto {
  @ApiPropertyOptional({ example: 'Completed, awaiting review', description: 'Execution status description' })
  @IsString()
  @IsOptional()
  executionStatus?: string;

  @ApiPropertyOptional({ example: 75, description: 'Completion percentage (0-100)', minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  completionPercentage?: number;

  @ApiPropertyOptional({ example: 15.5, description: 'Equivalent hours worked on task', minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  equivalentHours?: number;

  @ApiPropertyOptional({ example: './uploads/scientific-reports/report-123.pdf', description: 'Path to uploaded file' })
  @IsString()
  @IsOptional()
  filePath?: string;

  @ApiPropertyOptional({ example: 'research_report.pdf', description: 'Original file name' })
  @IsString()
  @IsOptional()
  fileName?: string;
}
