import { IsString, IsOptional, IsDateString, IsIn } from 'class-validator';

export class UpdatePublicationDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsIn(['conference', 'national', 'scopus'])
  @IsOptional()
  publicationType?: string;

  @IsString()
  @IsOptional()
  authors?: string;

  @IsString()
  @IsOptional()
  venue?: string;

  @IsDateString()
  @IsOptional()
  publicationDate?: string;

  @IsString()
  @IsOptional()
  doi?: string;

  @IsString()
  @IsOptional()
  isbn?: string;

  @IsString()
  @IsOptional()
  issn?: string;

  @IsString()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  abstract?: string;

  @IsString()
  @IsOptional()
  keywords?: string;
}
