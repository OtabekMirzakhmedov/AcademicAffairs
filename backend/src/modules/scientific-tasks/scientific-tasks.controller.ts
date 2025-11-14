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
} from '@nestjs/common';
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
