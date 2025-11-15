import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  BadRequestException,
  Res,
  StreamableFile,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { extname, basename, join } from 'path';
import { createReadStream, createWriteStream, existsSync } from 'fs';
import { pipeline } from 'stream/promises';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { ScientificTasksService } from './scientific-tasks.service';
import { CreateScientificTaskDto } from './dto/create-scientific-task.dto';
import { UpdateScientificTaskDto } from './dto/update-scientific-task.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('scientific-tasks')
@UseGuards(JwtAuthGuard)
export class ScientificTasksController {
  constructor(
    private readonly scientificTasksService: ScientificTasksService,
  ) {}

  // ==================== TASK ENDPOINTS ====================

  @Post()
  async createTask(
    @CurrentUser() user: any,
    @Body() createScientificTaskDto: CreateScientificTaskDto,
  ) {
    const task = await this.scientificTasksService.createTask(
      user.id,
      createScientificTaskDto,
    );
    return {
      success: true,
      data: task,
      message: 'Scientific task created successfully',
    };
  }

  @Get()
  async getAllTasks(@CurrentUser() user: any) {
    const tasks = await this.scientificTasksService.findAllTasks(user.id);
    return {
      success: true,
      data: tasks,
    };
  }

  // ==================== REPORT ENDPOINTS ====================
  // NOTE: These must come BEFORE the parameterized routes like ':id'
  // to avoid route conflicts where 'reports' is matched as ':id'

  @Get('reports/my')
  async getMyReports(@CurrentUser() user: any) {
    const reports = await this.scientificTasksService.getMyReports(user.id);
    return {
      success: true,
      data: reports,
    };
  }

  @Get('reports/submitted')
  async getSubmittedReports(@CurrentUser() user: any) {
    const reports = await this.scientificTasksService.getSubmittedReports(
      user.id,
    );
    return {
      success: true,
      data: reports,
    };
  }

  @Get('reports/:id')
  async getReport(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const report = await this.scientificTasksService.getReport(id, user.id);
    return {
      success: true,
      data: report,
    };
  }

  @Patch('reports/:id')
  async updateReport(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReportDto: UpdateReportDto,
  ) {
    const report = await this.scientificTasksService.updateReport(
      id,
      user.id,
      updateReportDto,
    );
    return {
      success: true,
      data: report,
      message: 'Report updated successfully',
    };
  }

  @Post('reports/:id/submit')
  @HttpCode(HttpStatus.OK)
  async submitReport(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const report = await this.scientificTasksService.submitReport(
      id,
      user.id,
    );
    return {
      success: true,
      data: report,
      message: 'Report submitted successfully',
    };
  }

  @Post('reports/:id/validate')
  @HttpCode(HttpStatus.OK)
  async validateReport(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const report = await this.scientificTasksService.validateReport(
      id,
      user.id,
    );
    return {
      success: true,
      data: report,
      message: 'Report validated successfully',
    };
  }

  @Post('reports/:id/reject')
  @HttpCode(HttpStatus.OK)
  async rejectReport(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const report = await this.scientificTasksService.rejectReport(id, user.id);
    return {
      success: true,
      data: report,
      message: 'Report rejected successfully',
    };
  }

  @Post('reports/upload')
  async uploadFile(
    @Req() request: FastifyRequest,
    @CurrentUser() user: any,
  ) {
    console.log('Upload handler called');
    console.log('User:', user?.id);

    try {
      // Get the uploaded file from the multipart request
      const data = await request.file();

      if (!data) {
        throw new BadRequestException('No file uploaded');
      }

      console.log('File upload attempt:', {
        filename: data.filename,
        mimetype: data.mimetype,
        encoding: data.encoding,
      });

      // Validate file type
      const allowedMimes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'application/octet-stream', // Generic binary, check extension
      ];

      const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt'];
      const fileExt = extname(data.filename).toLowerCase();

      if (!allowedMimes.includes(data.mimetype) && !allowedExtensions.includes(fileExt)) {
        console.log('File rejected - invalid type');
        throw new BadRequestException(
          `Invalid file type: ${data.mimetype}. Only PDF, DOC, DOCX, XLS, XLSX, and TXT files are allowed.`,
        );
      }

      console.log('File accepted');

      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(data.filename);
      const filename = `scientific-report-${uniqueSuffix}${ext}`;

      // Save the file
      const uploadDir = './uploads/scientific-reports';
      const filePath = join(uploadDir, filename);

      // Use pipeline to save the file stream
      await pipeline(data.file, createWriteStream(filePath));

      console.log('File uploaded successfully:', filePath);

      return {
        success: true,
        data: {
          filePath: filePath,
          fileName: data.filename,
        },
        message: 'File uploaded successfully',
      };
    } catch (error) {
      console.error('File upload error:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to upload file: ' + error.message);
    }
  }

  @Get('reports/:id/download')
  async downloadFile(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) reportId: number,
    @Res({ passthrough: true }) res: FastifyReply,
  ): Promise<StreamableFile> {
    // Get the report to check permissions and get file path
    const report = await this.scientificTasksService.getReport(reportId, user.id);

    if (!report.filePath) {
      throw new NotFoundException('No file attached to this report');
    }

    // Security: Ensure the file path is within the uploads directory
    const uploadsDir = join(process.cwd(), 'uploads', 'scientific-reports');
    const fileName = basename(report.filePath);
    const filePath = join(uploadsDir, fileName);

    // Check if file exists
    if (!existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    // Set response headers for file download
    res.header('Content-Type', 'application/octet-stream');
    res.header('Content-Disposition', `attachment; filename="${report.fileName || fileName}"`);

    // Stream the file
    const file = createReadStream(filePath);
    return new StreamableFile(file);
  }

  // ==================== PARAMETERIZED TASK ENDPOINTS ====================
  // NOTE: These must come AFTER the specific 'reports/*' routes
  // to avoid route matching conflicts

  @Get(':id/progress')
  async getTaskProgress(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const progress = await this.scientificTasksService.getTaskProgress(
      id,
      user.id,
    );
    return {
      success: true,
      data: progress,
    };
  }

  @Get(':id')
  async getTask(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const task = await this.scientificTasksService.findOneTask(id, user.id);
    return {
      success: true,
      data: task,
    };
  }

  @Patch(':id')
  async updateTask(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateScientificTaskDto: UpdateScientificTaskDto,
  ) {
    const task = await this.scientificTasksService.updateTask(
      id,
      user.id,
      updateScientificTaskDto,
    );
    return {
      success: true,
      data: task,
      message: 'Scientific task updated successfully',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteTask(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.scientificTasksService.deleteTask(id, user.id);
    return {
      success: true,
      message: 'Scientific task deleted successfully',
    };
  }
}
