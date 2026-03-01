import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTeacherDto {
  @ApiProperty({ example: 'jane.smith', description: 'Unique login/username' })
  @IsString()
  @IsNotEmpty()
  login: string;

  @ApiProperty({ example: 'Jane', description: 'First name' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Smith', description: 'Last name' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiPropertyOptional({ example: 'jane.smith@university.edu', description: 'Primary email address' })
  @IsEmail()
  @IsOptional()
  email1?: string;

  @ApiPropertyOptional({ example: 'j.smith@gmail.com', description: 'Secondary email address' })
  @IsEmail()
  @IsOptional()
  email2?: string;

  @ApiPropertyOptional({ example: '+998901234567', description: 'Primary phone number' })
  @IsString()
  @IsOptional()
  phone1?: string;

  @ApiPropertyOptional({ example: '+998907654321', description: 'Secondary phone number' })
  @IsString()
  @IsOptional()
  phone2?: string;
}
