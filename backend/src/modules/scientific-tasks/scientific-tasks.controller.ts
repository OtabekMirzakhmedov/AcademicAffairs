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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
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

@ApiTags('scientific-tasks')
@ApiBearerAuth('JWT-auth')
@Controller('scientific-tasks')
@UseGuards(JwtAuthGuard)
export class ScientificTasksController {
  constructor(
    private readonly scientificTasksService: ScientificTasksService,
  ) {}

  // ==================== TASK ENDPOINTS ====================

  @Post()
  @ApiOperation({
    summary: 'Create scientific task',
    description: 'Create a new scientific task (admin/department head)',
  })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
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
  @ApiOperation({
    summary: 'Get all scientific tasks',
    description: 'Get all tasks visible to the current user',
  })
  @ApiResponse({ status: 200, description: 'Returns list of scientific tasks' })
  async getAllTasks(@CurrentUser() user: any) {
    const tasks = await this.scientificTasksService.findAllTasks(user.id);
    return {
      success: true,
      data: tasks,
    };
  }

  // ==================== REPORT ENDPOINTS ====================

  @Get('reports/my')
  @ApiOperation({
    summary: 'Get my reports',
    description: 'Get all reports for the current teacher',
  })
  @ApiResponse({ status: 200, description: 'Returns list of teacher reports' })
  async getMyReports(@CurrentUser() user: any) {
    const reports = await this.scientificTasksService.getMyReports(user.id);
    return {
      success: true,
      data: reports,
    };
  }

  @Get('reports/submitted')
  @ApiOperation({
    summary: 'Get submitted reports',
    description: 'Get all submitted reports for validation (department head)',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns list of submitted reports',
  })
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
  @ApiOperation({
    summary: 'Get report by ID',
    description: 'Retrieve a specific report',
  })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiResponse({ status: 200, description: 'Returns report data' })
  @ApiResponse({ status: 404, description: 'Report not found' })
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
  @ApiOperation({
    summary: 'Update report',
    description: 'Update a scientific report (in progress status only)',
  })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiResponse({ status: 200, description: 'Report updated successfully' })
  @ApiResponse({ status: 400, description: 'Cannot update submitted report' })
  @ApiResponse({ status: 404, description: 'Report not found' })
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
  @ApiOperation({
    summary: 'Submit report',
    description: 'Submit a report for validation',
  })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiResponse({ status: 200, description: 'Report submitted successfully' })
  @ApiResponse({ status: 400, description: 'Report already submitted' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async submitReport(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const actor = { id: user.id, login: user.login, role: user.role.name };
    const report = await this.scientificTasksService.submitReport(id, actor);
    return {
      success: true,
      data: report,
      message: 'Report submitted successfully',
    };
  }

  @Post('reports/:id/validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Validate report',
    description: 'Validate a submitted report (department head)',
  })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiResponse({ status: 200, description: 'Report validated successfully' })
  @ApiResponse({ status: 400, description: 'Report not in submitted status' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async validateReport(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const actor = { id: user.id, login: user.login, role: user.role.name };
    const report = await this.scientificTasksService.validateReport(id, actor);
    return {
      success: true,
      data: report,
      message: 'Report validated successfully',
    };
  }

  @Post('reports/:id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reject report',
    description: 'Reject a submitted report (department head)',
  })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiResponse({ status: 200, description: 'Report rejected' })
  @ApiResponse({ status: 400, description: 'Report not in submitted status' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async rejectReport(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const actor = { id: user.id, login: user.login, role: user.role.name };
    const report = await this.scientificTasksService.rejectReport(id, actor);
    return {
      success: true,
      data: report,
      message: 'Report rejected successfully',
    };
  }

  @Post('reports/upload')
  @ApiOperation({
    summary: 'Upload report file',
    description: 'Upload a file for a scientific report',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'File to upload (PDF, DOC, DOCX, XLS, XLSX, TXT)' })
  @ApiResponse({ status: 200, description: 'File uploaded successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid file type or no file uploaded',
  })
  async uploadFile(@Req() request: FastifyRequest, @CurrentUser() user: any) {
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

      const allowedExtensions = [
        '.pdf',
        '.doc',
        '.docx',
        '.xls',
        '.xlsx',
        '.txt',
      ];
      const fileExt = extname(data.filename).toLowerCase();

      if (
        !allowedMimes.includes(data.mimetype) &&
        !allowedExtensions.includes(fileExt)
      ) {
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
  @ApiOperation({
    summary: 'Download report file',
    description: 'Download the file attached to a report',
  })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiResponse({ status: 200, description: 'File download' })
  @ApiResponse({ status: 404, description: 'Report or file not found' })
  async downloadFile(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) reportId: number,
    @Res({ passthrough: true }) res: FastifyReply,
  ): Promise<StreamableFile> {
    // Get the report to check permissions and get file path
    const report = await this.scientificTasksService.getReport(
      reportId,
      user.id,
    );

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
    res.header(
      'Content-Disposition',
      `attachment; filename="${report.fileName || fileName}"`,
    );

    // Stream the file
    const file = createReadStream(filePath);
    return new StreamableFile(file);
  }

  // ==================== PARAMETERIZED TASK ENDPOINTS ====================

  @Get(':id/progress')
  @ApiOperation({
    summary: 'Get task progress',
    description: 'Get progress statistics for a task',
  })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Returns task progress data' })
  @ApiResponse({ status: 404, description: 'Task not found' })
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
  @ApiOperation({
    summary: 'Get task by ID',
    description: 'Retrieve a specific scientific task',
  })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Returns task data' })
  @ApiResponse({ status: 404, description: 'Task not found' })
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
  @ApiOperation({
    summary: 'Update task',
    description: 'Update a scientific task (creator only)',
  })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  @ApiResponse({ status: 403, description: 'Not task creator' })
  @ApiResponse({ status: 404, description: 'Task not found' })
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
  @ApiOperation({
    summary: 'Delete task',
    description: 'Delete a scientific task (creator only)',
  })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Task deleted' })
  @ApiResponse({ status: 403, description: 'Not task creator' })
  @ApiResponse({ status: 404, description: 'Task not found' })
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
