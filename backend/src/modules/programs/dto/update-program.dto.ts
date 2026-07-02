import {
  IsString,
  IsInt,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProgramDto {
  @ApiPropertyOptional({
    example: 'Software Engineering',
    description: 'Program name',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: 'SE-BSC',
    description: 'Unique program code',
    maxLength: 50,
  })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  code?: string;

  @ApiPropertyOptional({
    example: 'MASTER',
    description: 'Degree level',
    enum: ['BACHELOR', 'MASTER', 'DOCTORATE', 'UNDERGRADUATE', 'GRADUATE'],
  })
  @IsString()
  @IsOptional()
  degreeLevel?: string;

  @ApiPropertyOptional({ example: 2, description: 'Department ID' })
  @IsInt()
  @IsOptional()
  departmentId?: number;

  @ApiPropertyOptional({
    example: 2,
    description: 'Program duration in years',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  durationYears?: number;

  @ApiPropertyOptional({
    example: 120,
    description: 'Total credits required',
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  totalCreditsRequired?: number;

  @ApiPropertyOptional({
    example: 'Updated description',
    description: 'Program description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: false, description: 'Is program active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
