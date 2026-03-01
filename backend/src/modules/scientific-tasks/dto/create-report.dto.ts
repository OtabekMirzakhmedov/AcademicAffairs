import { IsString, IsInt, IsOptional, Min, Max, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReportDto {
  @ApiProperty({ example: 1, description: 'Scientific task ID' })
  @IsInt()
  scientificTaskId: number;

  @ApiPropertyOptional({ example: 'In progress, completed initial research', description: 'Execution status description' })
  @IsString()
  @IsOptional()
  executionStatus?: string;

  @ApiPropertyOptional({ example: 50, description: 'Completion percentage (0-100)', minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  completionPercentage?: number;

  @ApiPropertyOptional({ example: 10.5, description: 'Equivalent hours worked on task', minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  equivalentHours?: number;
}
