import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateTeacherInfoDto {
  @IsString()
  @IsOptional()
  employmentType?: string; // 'full-time', 'part-time', 'contract'

  @IsNumber()
  @IsOptional()
  mandatoryHoursPerPeriod?: number;
}
