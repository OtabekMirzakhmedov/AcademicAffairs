import { IsString, IsInt, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDepartmentDto {
  @ApiPropertyOptional({
    example: 'Information Technology',
    description: 'Department name',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 3, description: 'Department head user ID' })
  @IsInt()
  @IsOptional()
  headId?: number;

  @ApiPropertyOptional({
    example: '+998712345678',
    description: 'Department phone number',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    example: 'B-202',
    description: 'Department room number',
  })
  @IsString()
  @IsOptional()
  roomNumber?: string;
}
