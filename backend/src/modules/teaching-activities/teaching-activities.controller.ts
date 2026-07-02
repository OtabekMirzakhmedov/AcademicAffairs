import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { TeachingActivitiesService } from './teaching-activities.service';
import { CreateTeachingActivityDto } from './dto/create-teaching-activity.dto';
import { UpdateTeachingActivityDto } from './dto/update-teaching-activity.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('teaching-activities')
@ApiBearerAuth('JWT-auth')
@Controller('teaching-activities')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeachingActivitiesController {
  constructor(
    private readonly teachingActivitiesService: TeachingActivitiesService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create teaching activity',
    description: 'Create a new teaching activity record',
  })
  @ApiResponse({
    status: 201,
    description: 'Teaching activity created successfully',
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(
    @CurrentUser() user: any,
    @Body() createTeachingActivityDto: CreateTeachingActivityDto,
  ) {
    const activity = await this.teachingActivitiesService.create(
      user.id,
      createTeachingActivityDto,
    );
    return {
      success: true,
      data: activity,
      message: 'Teaching activity created successfully',
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Get teaching activities',
    description: 'Get all teaching activities for the current user',
  })
  @ApiQuery({
    name: 'academicPeriodId',
    required: false,
    description: 'Filter by academic period ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns list of teaching activities',
  })
  async findAll(
    @CurrentUser() user: any,
    @Query('academicPeriodId') academicPeriodId?: string,
  ) {
    const activities = await this.teachingActivitiesService.findAll(
      user.id,
      academicPeriodId ? parseInt(academicPeriodId) : undefined,
    );
    return {
      success: true,
      data: activities,
    };
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get teaching statistics',
    description: 'Get teaching hours statistics for current user',
  })
  @ApiQuery({
    name: 'academicPeriodId',
    required: false,
    description: 'Filter by academic period ID',
  })
  @ApiResponse({ status: 200, description: 'Returns teaching statistics' })
  async getStatistics(
    @CurrentUser() user: any,
    @Query('academicPeriodId') academicPeriodId?: string,
  ) {
    const stats = await this.teachingActivitiesService.getStatistics(
      user.id,
      academicPeriodId ? parseInt(academicPeriodId) : undefined,
    );
    return {
      success: true,
      data: stats,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get activity by ID',
    description: 'Retrieve a specific teaching activity',
  })
  @ApiParam({ name: 'id', description: 'Teaching activity ID' })
  @ApiResponse({ status: 200, description: 'Returns teaching activity' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  async findOne(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const activity = await this.teachingActivitiesService.findOne(id, user.id);
    return {
      success: true,
      data: activity,
    };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update activity',
    description: 'Update a teaching activity (only in draft status)',
  })
  @ApiParam({ name: 'id', description: 'Teaching activity ID' })
  @ApiResponse({ status: 200, description: 'Activity updated successfully' })
  @ApiResponse({ status: 400, description: 'Cannot update submitted activity' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  async update(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTeachingActivityDto: UpdateTeachingActivityDto,
  ) {
    const activity = await this.teachingActivitiesService.update(
      id,
      user.id,
      updateTeachingActivityDto,
    );
    return {
      success: true,
      data: activity,
      message: 'Teaching activity updated successfully',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete activity',
    description: 'Delete a teaching activity (only in draft status)',
  })
  @ApiParam({ name: 'id', description: 'Teaching activity ID' })
  @ApiResponse({ status: 200, description: 'Activity deleted' })
  @ApiResponse({ status: 400, description: 'Cannot delete submitted activity' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  async remove(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const result = await this.teachingActivitiesService.remove(id, user.id);
    return {
      success: true,
      data: result,
    };
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Submit activity',
    description: 'Submit teaching activity for validation',
  })
  @ApiParam({ name: 'id', description: 'Teaching activity ID' })
  @ApiResponse({ status: 200, description: 'Activity submitted successfully' })
  @ApiResponse({ status: 400, description: 'Activity already submitted' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  async submit(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const actor = { id: user.id, login: user.login, role: user.role.name };
    const activity = await this.teachingActivitiesService.submit(id, actor);
    return {
      success: true,
      data: activity,
      message: 'Teaching activity submitted successfully',
    };
  }

  @Get('submitted/all')
  @Roles('departmenthead', 'admin')
  @ApiOperation({
    summary: 'Get all submitted activities',
    description: 'Get all submitted activities (for validation)',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns list of submitted activities',
  })
  async getAllSubmitted(@CurrentUser() user: any) {
    const activities = await this.teachingActivitiesService.getAllSubmitted(
      user.id,
    );
    return {
      success: true,
      data: activities,
    };
  }

  @Post(':id/validate')
  @Roles('departmenthead', 'admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Validate activity',
    description: 'Validate a submitted teaching activity (department head)',
  })
  @ApiParam({ name: 'id', description: 'Teaching activity ID' })
  @ApiResponse({ status: 200, description: 'Activity validated successfully' })
  @ApiResponse({ status: 400, description: 'Activity not in submitted status' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  async validate(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const actor = { id: user.id, login: user.login, role: user.role.name };
    const activity = await this.teachingActivitiesService.validate(id, actor);
    return {
      success: true,
      data: activity,
      message: 'Teaching activity validated successfully',
    };
  }

  @Post(':id/reject')
  @Roles('departmenthead', 'admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reject activity',
    description: 'Reject a submitted teaching activity (department head)',
  })
  @ApiParam({ name: 'id', description: 'Teaching activity ID' })
  @ApiResponse({ status: 200, description: 'Activity rejected' })
  @ApiResponse({ status: 400, description: 'Activity not in submitted status' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  async reject(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const actor = { id: user.id, login: user.login, role: user.role.name };
    const activity = await this.teachingActivitiesService.reject(id, actor);
    return {
      success: true,
      data: activity,
      message: 'Teaching activity rejected successfully',
    };
  }
}
