import { IsString, IsInt, IsNumber, IsOptional, IsBoolean, Min, MaxLength } from 'class-validator';

export class CreateProgramDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsString()
  @MaxLength(50)
  code: string;

  @IsString()
  degreeLevel: string; // BACHELOR, MASTER, DOCTORATE, UNDERGRADUATE, GRADUATE

  @IsInt()
  departmentId: number;

  @IsInt()
  @Min(1)
  durationYears: number;

  @IsNumber()
  @Min(0)
  totalCreditsRequired: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
