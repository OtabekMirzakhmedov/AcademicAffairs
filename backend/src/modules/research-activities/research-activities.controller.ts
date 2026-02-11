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

@Controller('research-activities')
@UseGuards(JwtAuthGuard)
export class ResearchActivitiesController {
  constructor(
    private readonly researchActivitiesService: ResearchActivitiesService,
  ) {}

  // ==================== TEMPLATE ENDPOINTS ====================

  @Get('templates')
  async getTemplates(@Query('category') category?: string) {
    const templates =
      await this.researchActivitiesService.getTemplates(category);
    return { success: true, data: templates };
  }

  @Get('templates/admin')
  async getAllTemplatesAdmin() {
    const templates =
      await this.researchActivitiesService.getAllTemplatesAdmin();
    return { success: true, data: templates };
  }

  @Post('templates')
  async createTemplate(@Body() dto: CreateTemplateDto) {
    const template = await this.researchActivitiesService.createTemplate(dto);
    return { success: true, data: template, message: 'Template created successfully' };
  }

  @Patch('templates/:id')
  async updateTemplate(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateTemplateDto,
  ) {
    const template = await this.researchActivitiesService.updateTemplate(id, dto);
    return { success: true, data: template, message: 'Template updated successfully' };
  }

  @Delete('templates/:id')
  @HttpCode(HttpStatus.OK)
  async deleteTemplate(@Param('id', ParseIntPipe) id: number) {
    await this.researchActivitiesService.deleteTemplate(id);
    return { success: true, message: 'Template deleted successfully' };
  }

  // ==================== TEACHER ACTIVITY ENDPOINTS ====================
  // NOTE: Specific paths before parameterized ones to avoid route conflicts

  @Get('my')
  async getMyActivities(@CurrentUser() user: any) {
    const activities =
      await this.researchActivitiesService.getMyActivities(user.id);
    return { success: true, data: activities };
  }

  @Post('upload')
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
  async deleteActivity(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.researchActivitiesService.deleteActivity(id, user.id);
    return { success: true, message: 'Activity deleted successfully' };
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
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
