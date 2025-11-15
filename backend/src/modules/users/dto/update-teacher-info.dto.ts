import { IsString, IsOptional, IsNumber, IsInt, Min } from 'class-validator';

export class UpdateTeacherInfoDto {
  @IsString()
  @IsOptional()
  employmentType?: string; // 'full-time', 'part-time', 'contract'

  @IsNumber()
  @IsOptional()
  mandatoryHoursPerPeriod?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  mandatoryExtracurricularHours?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  mandatoryConferenceArticles?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  mandatoryNationalArticles?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  mandatoryScopusArticles?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  mandatoryDocumentation?: number;
}
