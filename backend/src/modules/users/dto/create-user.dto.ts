import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsEmail,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'john.doe', description: 'Unique login/username' })
  @IsString()
  @IsNotEmpty()
  login: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password (minimum 6 characters)',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 1,
    description: 'Role ID (1=admin, 2=departmenthead, 3=teacher)',
  })
  @IsInt()
  @IsNotEmpty()
  roleId: number;

  @ApiProperty({ example: 'John', description: 'First name' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

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

  @ApiPropertyOptional({
    example: 1,
    description: 'Department ID (required for teachers)',
  })
  @IsInt()
  @IsOptional()
  departmentId?: number;
}
