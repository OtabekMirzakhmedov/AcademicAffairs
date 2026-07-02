import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RejectPublicationDto {
  @ApiPropertyOptional({
    example: 'DOI is missing and venue details are incomplete',
    description: 'Reason for rejection',
  })
  @IsString()
  @IsOptional()
  reason?: string;
}
