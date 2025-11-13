import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
} from 'class-validator';

export class CreateTeacherDto {
  @IsString()
  @IsNotEmpty()
  login: string;

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
}
