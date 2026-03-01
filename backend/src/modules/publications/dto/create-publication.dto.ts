import { IsString, IsOptional, IsDateString, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePublicationDto {
  @ApiProperty({ example: 'Machine Learning in Education', description: 'Publication title' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'conference', description: 'Publication type', enum: ['conference', 'national', 'scopus'] })
  @IsString()
  @IsIn(['conference', 'national', 'scopus'])
  publicationType: string;

  @ApiProperty({ example: 'John Doe, Jane Smith', description: 'List of authors' })
  @IsString()
  authors: string;

  @ApiPropertyOptional({ example: 'International Conference on AI', description: 'Conference or journal name' })
  @IsString()
  @IsOptional()
  venue?: string;

  @ApiPropertyOptional({ example: '2025-03-15', description: 'Publication date (ISO format)' })
  @IsDateString()
  @IsOptional()
  publicationDate?: string;

  @ApiPropertyOptional({ example: '10.1234/example.doi', description: 'Digital Object Identifier' })
  @IsString()
  @IsOptional()
  doi?: string;

  @ApiPropertyOptional({ example: '978-3-16-148410-0', description: 'International Standard Book Number' })
  @IsString()
  @IsOptional()
  isbn?: string;

  @ApiPropertyOptional({ example: '1234-5678', description: 'International Standard Serial Number' })
  @IsString()
  @IsOptional()
  issn?: string;

  @ApiPropertyOptional({ example: 'https://example.com/paper', description: 'Link to publication' })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiPropertyOptional({ example: 'This paper explores the application of ML in education...', description: 'Publication abstract' })
  @IsString()
  @IsOptional()
  abstract?: string;

  @ApiPropertyOptional({ example: 'machine learning, education, AI', description: 'Keywords (comma-separated)' })
  @IsString()
  @IsOptional()
  keywords?: string;
}
