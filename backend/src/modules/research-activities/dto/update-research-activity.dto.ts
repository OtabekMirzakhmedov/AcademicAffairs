import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateResearchActivityDto {
  @ApiPropertyOptional({ example: 75, description: 'Completion percentage (0-100)', minimum: 0, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  completionPercentage?: number;

  @ApiPropertyOptional({ example: './uploads/research-activities/file-123.pdf', description: 'Path to uploaded file' })
  @IsOptional()
  @IsString()
  filePath?: string;

  @ApiPropertyOptional({ example: 'research_document.pdf', description: 'Original file name' })
  @IsOptional()
  @IsString()
  fileName?: string;

  @ApiPropertyOptional({ example: '2025-07-15', description: 'Activity deadline (ISO date format)' })
  @IsOptional()
  @IsString()
  deadline?: string;
}
