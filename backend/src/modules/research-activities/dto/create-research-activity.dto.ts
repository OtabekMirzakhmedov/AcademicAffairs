import { IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateResearchActivityDto {
  @ApiProperty({ example: 1, description: 'Research activity template ID' })
  @IsInt()
  templateId: number;

  @ApiPropertyOptional({
    example: '2025-06-30',
    description: 'Activity deadline (ISO date format)',
  })
  @IsOptional()
  @IsString()
  deadline?: string;
}
