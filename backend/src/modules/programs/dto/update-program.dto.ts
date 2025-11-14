import { IsString, IsInt, IsNumber, IsOptional, IsBoolean, Min, MaxLength } from 'class-validator';

export class UpdateProgramDto {
  @IsString()
  @MaxLength(255)
  @IsOptional()
  name?: string;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  degreeLevel?: string;

  @IsInt()
  @IsOptional()
  departmentId?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  durationYears?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  totalCreditsRequired?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
