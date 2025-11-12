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
import { TeachingActivitiesService } from './teaching-activities.service';
import { CreateTeachingActivityDto } from './dto/create-teaching-activity.dto';
import { UpdateTeachingActivityDto } from './dto/update-teaching-activity.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('teaching-activities')
@UseGuards(JwtAuthGuard)
export class TeachingActivitiesController {
  constructor(
    private readonly teachingActivitiesService: TeachingActivitiesService,
  ) {}

  @Post()
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
  async submit(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const activity = await this.teachingActivitiesService.submit(id, user.id);
    return {
      success: true,
      data: activity,
      message: 'Teaching activity submitted successfully',
    };
  }
}
