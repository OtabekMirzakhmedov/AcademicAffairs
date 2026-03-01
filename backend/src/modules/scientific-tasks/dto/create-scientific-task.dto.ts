import { IsString, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateScientificTaskDto {
  @ApiProperty({ example: 'Research Paper Review', description: 'Task name' })
  @IsString()
  @IsNotEmpty()
  taskName: string;

  @ApiPropertyOptional({ example: 'Review and provide feedback on submitted research papers', description: 'Task description' })
  @IsString()
  @IsOptional()
  taskDescription?: string;

  @ApiProperty({ example: '2025-06-30', description: 'Task deadline (ISO date format)' })
  @IsDateString()
  @IsNotEmpty()
  deadline: string;
}
