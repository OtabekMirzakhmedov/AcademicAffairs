import { IsString, IsOptional, IsNumber, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTeacherInfoDto {
  @ApiPropertyOptional({ example: 'full-time', description: 'Employment type', enum: ['full-time', 'part-time', 'contract'] })
  @IsString()
  @IsOptional()
  employmentType?: string;

  @ApiPropertyOptional({ example: 720, description: 'Mandatory teaching hours per academic period' })
  @IsNumber()
  @IsOptional()
  mandatoryHoursPerPeriod?: number;

  @ApiPropertyOptional({ example: 100, description: 'Mandatory extracurricular hours' })
  @IsInt()
  @IsOptional()
  @Min(0)
  mandatoryExtracurricularHours?: number;

  @ApiPropertyOptional({ example: 2, description: 'Mandatory conference articles count' })
  @IsInt()
  @IsOptional()
  @Min(0)
  mandatoryConferenceArticles?: number;

  @ApiPropertyOptional({ example: 1, description: 'Mandatory national articles count' })
  @IsInt()
  @IsOptional()
  @Min(0)
  mandatoryNationalArticles?: number;

  @ApiPropertyOptional({ example: 1, description: 'Mandatory Scopus articles count' })
  @IsInt()
  @IsOptional()
  @Min(0)
  mandatoryScopusArticles?: number;

  @ApiPropertyOptional({ example: 3, description: 'Mandatory documentation count' })
  @IsInt()
  @IsOptional()
  @Min(0)
  mandatoryDocumentation?: number;
}
