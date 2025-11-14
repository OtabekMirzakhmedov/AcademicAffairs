import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
  StreamableFile,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, basename, join } from 'path';
import { createReadStream, existsSync } from 'fs';
import type { Response } from 'express';
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
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadDir = './uploads/scientific-reports';
          // Directory is already created, just use it
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `scientific-report-${uniqueSuffix}${ext}`;
          cb(null, filename);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
      fileFilter: (req, file, cb) => {
        console.log('File upload attempt:', {
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
        });

        // Allow common document types - be more flexible with mime types
        const allowedMimes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/plain',
          'application/octet-stream', // Generic binary, check extension
        ];

        // Also check by file extension as a fallback
        const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt'];
        const fileExt = extname(file.originalname).toLowerCase();

        if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(fileExt)) {
          console.log('File accepted');
          cb(null, true);
        } else {
          console.log('File rejected - invalid type');
          cb(
            new BadRequestException(
              `Invalid file type: ${file.mimetype}. Only PDF, DOC, DOCX, XLS, XLSX, and TXT files are allowed.`,
            ),
            false,
          );
        }
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    console.log('Upload handler called');
    console.log('User:', user?.id);
    console.log('File:', file ? 'present' : 'missing');
    console.log('File details:', file ? {
      fieldname: file.fieldname,
      originalname: file.originalname,
      encoding: file.encoding,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
    } : 'N/A');

    if (!file) {
      throw new BadRequestException('No file uploaded or file was rejected');
    }

    console.log('File uploaded successfully:', file.path);

    return {
      success: true,
      data: {
        filePath: file.path,
        fileName: file.originalname,
      },
      message: 'File uploaded successfully',
    };
  }

  @Get('reports/:id/download')
  async downloadFile(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) reportId: number,
    @Res({ passthrough: true }) res: Response,
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
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${report.fileName || fileName}"`,
    });

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
}
