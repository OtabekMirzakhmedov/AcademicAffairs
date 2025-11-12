import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsEmail,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  login: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsInt()
  @IsNotEmpty()
  roleId: number;

  // User Info
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsOptional()
  email1?: string;

  @IsEmail()
  @IsOptional()
  email2?: string;

  @IsString()
  @IsOptional()
  phone1?: string;

  @IsString()
  @IsOptional()
  phone2?: string;

  // Teacher-specific fields
  @IsInt()
  @IsOptional()
  departmentId?: number;
}
