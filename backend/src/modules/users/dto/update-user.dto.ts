import { IsString, IsInt, IsOptional, IsEmail } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  login?: string;

  @IsInt()
  @IsOptional()
  roleId?: number;

  // User Info
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

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
