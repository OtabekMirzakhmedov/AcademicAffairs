import { IsString, IsOptional, IsDateString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePublicationDto {
  @ApiPropertyOptional({ example: 'Updated Title', description: 'Publication title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'scopus', description: 'Publication type', enum: ['conference', 'national', 'scopus'] })
  @IsString()
  @IsIn(['conference', 'national', 'scopus'])
  @IsOptional()
  publicationType?: string;

  @ApiPropertyOptional({ example: 'John Doe, Jane Smith, Bob Wilson', description: 'List of authors' })
  @IsString()
  @IsOptional()
  authors?: string;

  @ApiPropertyOptional({ example: 'Journal of AI Research', description: 'Conference or journal name' })
  @IsString()
  @IsOptional()
  venue?: string;

  @ApiPropertyOptional({ example: '2025-04-01', description: 'Publication date (ISO format)' })
  @IsDateString()
  @IsOptional()
  publicationDate?: string;

  @ApiPropertyOptional({ example: '10.5678/updated.doi', description: 'Digital Object Identifier' })
  @IsString()
  @IsOptional()
  doi?: string;

  @ApiPropertyOptional({ example: '978-3-16-148410-1', description: 'International Standard Book Number' })
  @IsString()
  @IsOptional()
  isbn?: string;

  @ApiPropertyOptional({ example: '1234-5679', description: 'International Standard Serial Number' })
  @IsString()
  @IsOptional()
  issn?: string;

  @ApiPropertyOptional({ example: 'https://example.com/updated-paper', description: 'Link to publication' })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiPropertyOptional({ example: 'Updated abstract...', description: 'Publication abstract' })
  @IsString()
  @IsOptional()
  abstract?: string;

  @ApiPropertyOptional({ example: 'updated, keywords', description: 'Keywords (comma-separated)' })
  @IsString()
  @IsOptional()
  keywords?: string;
}
