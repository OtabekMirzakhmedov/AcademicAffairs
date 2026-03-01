import { IsString, IsDateString, IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateScientificTaskDto {
  @ApiPropertyOptional({ example: 'Updated Task Name', description: 'Task name' })
  @IsString()
  @IsOptional()
  taskName?: string;

  @ApiPropertyOptional({ example: 'Updated task description', description: 'Task description' })
  @IsString()
  @IsOptional()
  taskDescription?: string;

  @ApiPropertyOptional({ example: '2025-07-15', description: 'Task deadline (ISO date format)' })
  @IsDateString()
  @IsOptional()
  deadline?: string;

  @ApiPropertyOptional({ example: false, description: 'Is task active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
