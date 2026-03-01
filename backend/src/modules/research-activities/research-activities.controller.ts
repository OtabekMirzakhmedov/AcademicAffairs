import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  BadRequestException,
  NotFoundException,
  Res,
  StreamableFile,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { extname, basename, join } from 'path';
import { createReadStream, createWriteStream, existsSync } from 'fs';
import { pipeline } from 'stream/promises';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { ResearchActivitiesService } from './research-activities.service';
import { CreateResearchActivityDto } from './dto/create-research-activity.dto';
import { UpdateResearchActivityDto } from './dto/update-research-activity.dto';
import { CreateTemplateDto } from './dto/create-template.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('research-activities')
@ApiBearerAuth('JWT-auth')
@Controller('research-activities')
@UseGuards(JwtAuthGuard)
export class ResearchActivitiesController {
  constructor(
    private readonly researchActivitiesService: ResearchActivitiesService,
  ) {}

  // ==================== TEMPLATE ENDPOINTS ====================

  @Get('templates')
  @ApiOperation({ summary: 'Get active templates', description: 'Get active research activity templates' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category' })
  @ApiResponse({ status: 200, description: 'Returns list of templates' })
  async getTemplates(@Query('category') category?: string) {
    const templates =
      await this.researchActivitiesService.getTemplates(category);
    return { success: true, data: templates };
  }

  @Get('templates/admin')
  @ApiOperation({ summary: 'Get all templates (admin)', description: 'Get all templates including inactive ones' })
  @ApiResponse({ status: 200, description: 'Returns list of all templates' })
  async getAllTemplatesAdmin() {
    const templates =
      await this.researchActivitiesService.getAllTemplatesAdmin();
    return { success: true, data: templates };
  }

  @Post('templates')
  @ApiOperation({ summary: 'Create template', description: 'Create a new research activity template (admin)' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async createTemplate(@Body() dto: CreateTemplateDto) {
    const template = await this.researchActivitiesService.createTemplate(dto);
    return { success: true, data: template, message: 'Template created successfully' };
  }

  @Patch('templates/:id')
  @ApiOperation({ summary: 'Update template', description: 'Update a research activity template' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiResponse({ status: 200, description: 'Template updated successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async updateTemplate(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateTemplateDto,
  ) {
    const template = await this.researchActivitiesService.updateTemplate(id, dto);
    return { success: true, data: template, message: 'Template updated successfully' };
  }

  @Delete('templates/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete template', description: 'Delete a research activity template' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiResponse({ status: 200, description: 'Template deleted' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async deleteTemplate(@Param('id', ParseIntPipe) id: number) {
    await this.researchActivitiesService.deleteTemplate(id);
    return { success: true, message: 'Template deleted successfully' };
  }

  // ==================== TEACHER ACTIVITY ENDPOINTS ====================

  @Get('my')
  @ApiOperation({ summary: 'Get my research activities', description: 'Get all research activities for the current teacher' })
  @ApiResponse({ status: 200, description: 'Returns list of teacher activities' })
  async getMyActivities(@CurrentUser() user: any) {
    const activities =
      await this.researchActivitiesService.getMyActivities(user.id);
    return { success: true, data: activities };
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload activity file', description: 'Upload a file for a research activity' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'File to upload (PDF, DOC, DOCX, XLS, XLSX, TXT, or images)' })
  @ApiResponse({ status: 200, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file type or no file uploaded' })
  async uploadFile(
    @Req() request: FastifyRequest,
    @CurrentUser() user: any,
  ) {
    try {
      const data = await request.file();
      if (!data) throw new BadRequestException('No file uploaded');

      const allowedMimes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'application/octet-stream',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
      ];
      const allowedExtensions = [
        '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt',
        '.jpg', '.jpeg', '.png', '.gif', '.webp',
      ];
      const fileExt = extname(data.filename).toLowerCase();

      if (
        !allowedMimes.includes(data.mimetype) &&
        !allowedExtensions.includes(fileExt)
      ) {
        throw new BadRequestException(
          `Invalid file type: ${data.mimetype}. Allowed: PDF, DOC, DOCX, XLS, XLSX, TXT, and images.`,
        );
      }

      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(data.filename);
      const filename = `research-activity-${uniqueSuffix}${ext}`;

      const uploadDir = './uploads/research-activities';
      const filePath = join(uploadDir, filename);

      await pipeline(data.file, createWriteStream(filePath));

      return {
        success: true,
        data: { filePath, fileName: data.filename },
        message: 'File uploaded successfully',
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Failed to upload file: ' + error.message);
    }
  }

  @Post()
  @ApiOperation({ summary: 'Add research activity', description: 'Add a new research activity from a template' })
  @ApiResponse({ status: 201, description: 'Activity added successfully' })
  @ApiResponse({ status: 400, description: 'Validation error or already exists' })
  async addActivity(
    @CurrentUser() user: any,
    @Body() dto: CreateResearchActivityDto,
  ) {
    const activity = await this.researchActivitiesService.addActivity(
      user.id,
      dto,
    );
    return {
      success: true,
      data: activity,
      message: 'Activity added successfully',
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update activity', description: 'Update a research activity' })
  @ApiParam({ name: 'id', description: 'Activity ID' })
  @ApiResponse({ status: 200, description: 'Activity updated successfully' })
  @ApiResponse({ status: 400, description: 'Cannot update submitted activity' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  async updateActivity(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateResearchActivityDto,
  ) {
    const activity = await this.researchActivitiesService.updateActivity(
      id,
      user.id,
      dto,
    );
    return {
      success: true,
      data: activity,
      message: 'Activity updated successfully',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete activity', description: 'Delete a research activity' })
  @ApiParam({ name: 'id', description: 'Activity ID' })
  @ApiResponse({ status: 200, description: 'Activity deleted' })
  @ApiResponse({ status: 400, description: 'Cannot delete submitted activity' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  async deleteActivity(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.researchActivitiesService.deleteActivity(id, user.id);
    return { success: true, message: 'Activity deleted successfully' };
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit activity', description: 'Submit a research activity for validation' })
  @ApiParam({ name: 'id', description: 'Activity ID' })
  @ApiResponse({ status: 200, description: 'Activity submitted successfully' })
  @ApiResponse({ status: 400, description: 'Activity already submitted' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  async submitActivity(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const activity = await this.researchActivitiesService.submitActivity(
      id,
      user.id,
    );
    return {
      success: true,
      data: activity,
      message: 'Activity submitted successfully',
    };
  }

  @Post(':id/validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate activity', description: 'Validate a submitted activity (department head)' })
  @ApiParam({ name: 'id', description: 'Activity ID' })
  @ApiResponse({ status: 200, description: 'Activity validated successfully' })
  @ApiResponse({ status: 400, description: 'Activity not in submitted status' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  async validateActivity(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const activity = await this.researchActivitiesService.validateActivity(
      id,
      user.id,
    );
    return {
      success: true,
      data: activity,
      message: 'Activity validated successfully',
    };
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject activity', description: 'Reject a submitted activity (department head)' })
  @ApiParam({ name: 'id', description: 'Activity ID' })
  @ApiResponse({ status: 200, description: 'Activity rejected' })
  @ApiResponse({ status: 400, description: 'Activity not in submitted status' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  async rejectActivity(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const activity = await this.researchActivitiesService.rejectActivity(
      id,
      user.id,
    );
    return {
      success: true,
      data: activity,
      message: 'Activity rejected',
    };
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download activity file', description: 'Download the file attached to a research activity' })
  @ApiParam({ name: 'id', description: 'Activity ID' })
  @ApiResponse({ status: 200, description: 'File download' })
  @ApiResponse({ status: 404, description: 'Activity or file not found' })
  async downloadFile(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
    @Res({ passthrough: true }) res: FastifyReply,
  ): Promise<StreamableFile> {
    const activity = await this.researchActivitiesService.getMyActivities(
      user.id,
    );
    const item = activity.find((a) => a.id === id);
    if (!item) throw new NotFoundException('Activity not found');
    if (!item.filePath) throw new NotFoundException('No file attached');

    const uploadsDir = join(
      process.cwd(),
      'uploads',
      'research-activities',
    );
    const fileName = basename(item.filePath);
    const filePath = join(uploadsDir, fileName);

    if (!existsSync(filePath)) throw new NotFoundException('File not found');

    res.header('Content-Type', 'application/octet-stream');
    res.header(
      'Content-Disposition',
      `attachment; filename="${item.fileName || fileName}"`,
    );

    return new StreamableFile(createReadStream(filePath));
  }
}
