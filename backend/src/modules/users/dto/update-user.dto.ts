import { IsString, IsInt, IsOptional, IsEmail } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'john.doe',
    description: 'Unique login/username',
  })
  @IsString()
  @IsOptional()
  login?: string;

  @ApiPropertyOptional({
    example: 2,
    description: 'Role ID (1=admin, 2=departmenthead, 3=teacher)',
  })
  @IsInt()
  @IsOptional()
  roleId?: number;

  @ApiPropertyOptional({ example: 'John', description: 'First name' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe', description: 'Last name' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({
    example: 'john.doe@university.edu',
    description: 'Primary email address',
  })
  @IsEmail()
  @IsOptional()
  email1?: string;

  @ApiPropertyOptional({
    example: 'j.doe@gmail.com',
    description: 'Secondary email address',
  })
  @IsEmail()
  @IsOptional()
  email2?: string;

  @ApiPropertyOptional({
    example: '+998901234567',
    description: 'Primary phone number',
  })
  @IsString()
  @IsOptional()
  phone1?: string;

  @ApiPropertyOptional({
    example: '+998907654321',
    description: 'Secondary phone number',
  })
  @IsString()
  @IsOptional()
  phone2?: string;

  @ApiPropertyOptional({ example: 1, description: 'Department ID' })
  @IsInt()
  @IsOptional()
  departmentId?: number;
}
