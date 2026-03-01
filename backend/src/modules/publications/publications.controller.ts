import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { PublicationsService } from './publications.service';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { UpdatePublicationDto } from './dto/update-publication.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('publications')
@ApiBearerAuth('JWT-auth')
@Controller('publications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('teacher')
export class PublicationsController {
  constructor(private readonly publicationsService: PublicationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create publication', description: 'Create a new publication record' })
  @ApiResponse({ status: 201, description: 'Publication created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(
    @Body() createPublicationDto: CreatePublicationDto,
    @CurrentUser() user: any,
  ) {
    const publication = await this.publicationsService.create(
      user.id,
      createPublicationDto,
    );
    return {
      success: true,
      data: publication,
      message: 'Publication created successfully',
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get my publications', description: 'Get all publications for the current teacher' })
  @ApiResponse({ status: 200, description: 'Returns list of publications' })
  async findAll(@CurrentUser() user: any) {
    const publications = await this.publicationsService.findAllByTeacher(user.id);
    return {
      success: true,
      data: publications,
    };
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get publication statistics', description: 'Get publication statistics for the current teacher' })
  @ApiResponse({ status: 200, description: 'Returns publication statistics by type' })
  async getStatistics(@CurrentUser() user: any) {
    const statistics = await this.publicationsService.getStatistics(user.id);
    return {
      success: true,
      data: statistics,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get publication by ID', description: 'Retrieve a specific publication' })
  @ApiParam({ name: 'id', description: 'Publication ID' })
  @ApiResponse({ status: 200, description: 'Returns publication data' })
  @ApiResponse({ status: 404, description: 'Publication not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const publication = await this.publicationsService.findOne(id);
    return {
      success: true,
      data: publication,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update publication', description: 'Update a publication (draft status only)' })
  @ApiParam({ name: 'id', description: 'Publication ID' })
  @ApiResponse({ status: 200, description: 'Publication updated successfully' })
  @ApiResponse({ status: 400, description: 'Cannot update submitted publication' })
  @ApiResponse({ status: 403, description: 'Not publication owner' })
  @ApiResponse({ status: 404, description: 'Publication not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePublicationDto: UpdatePublicationDto,
    @CurrentUser() user: any,
  ) {
    const publication = await this.publicationsService.update(
      id,
      user.id,
      updatePublicationDto,
    );
    return {
      success: true,
      data: publication,
      message: 'Publication updated successfully',
    };
  }

  @Patch(':id/submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit publication', description: 'Submit publication for validation' })
  @ApiParam({ name: 'id', description: 'Publication ID' })
  @ApiResponse({ status: 200, description: 'Publication submitted successfully' })
  @ApiResponse({ status: 400, description: 'Publication already submitted' })
  @ApiResponse({ status: 403, description: 'Not publication owner' })
  @ApiResponse({ status: 404, description: 'Publication not found' })
  async submit(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    const publication = await this.publicationsService.submit(id, user.id);
    return {
      success: true,
      data: publication,
      message: 'Publication submitted successfully',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete publication', description: 'Delete a publication (draft status only)' })
  @ApiParam({ name: 'id', description: 'Publication ID' })
  @ApiResponse({ status: 200, description: 'Publication deleted' })
  @ApiResponse({ status: 400, description: 'Cannot delete submitted publication' })
  @ApiResponse({ status: 403, description: 'Not publication owner' })
  @ApiResponse({ status: 404, description: 'Publication not found' })
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    const result = await this.publicationsService.remove(id, user.id);
    return {
      success: true,
      data: result,
    };
  }
}
