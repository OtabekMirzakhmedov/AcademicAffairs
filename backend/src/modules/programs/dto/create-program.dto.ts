import {
  IsString,
  IsInt,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProgramDto {
  @ApiProperty({
    example: 'Computer Science',
    description: 'Program name',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    example: 'CS-BSC',
    description: 'Unique program code',
    maxLength: 50,
  })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiProperty({
    example: 'BACHELOR',
    description: 'Degree level',
    enum: ['BACHELOR', 'MASTER', 'DOCTORATE', 'UNDERGRADUATE', 'GRADUATE'],
  })
  @IsString()
  degreeLevel: string;

  @ApiProperty({ example: 1, description: 'Department ID' })
  @IsInt()
  departmentId: number;

  @ApiProperty({
    example: 4,
    description: 'Program duration in years',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  durationYears: number;

  @ApiProperty({
    example: 240,
    description: 'Total credits required for graduation',
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  totalCreditsRequired: number;

  @ApiPropertyOptional({
    example: 'Bachelor of Science in Computer Science',
    description: 'Program description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: true, description: 'Is program active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
