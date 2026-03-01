import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTemplateDto {
  @ApiProperty({ example: 'Research Paper Writing', description: 'Template name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Write and publish research papers', description: 'Template description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 100, description: 'Maximum amount/count for this activity', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxAmount?: number;

  @ApiPropertyOptional({ example: 10, description: 'Penalty percentage for not completing', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  penalty?: number;

  @ApiPropertyOptional({ example: 'scientific_main', description: 'Activity category', enum: ['scientific_main', 'scientific_exchange', 'educational_additional', 'additional', 'educational'] })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: true, description: 'Is template active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
