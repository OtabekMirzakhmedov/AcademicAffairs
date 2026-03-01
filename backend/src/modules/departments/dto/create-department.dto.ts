import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'Computer Science', description: 'Department name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 2, description: 'Department head user ID' })
  @IsInt()
  @IsOptional()
  headId?: number;

  @ApiPropertyOptional({ example: '+998712345678', description: 'Department phone number' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'A-101', description: 'Department room number' })
  @IsString()
  @IsOptional()
  roomNumber?: string;
}
