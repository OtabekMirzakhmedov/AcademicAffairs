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
import { PublicationsService } from './publications.service';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { UpdatePublicationDto } from './dto/update-publication.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('publications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('teacher')
export class PublicationsController {
  constructor(private readonly publicationsService: PublicationsService) {}

  @Post()
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
  async findAll(@CurrentUser() user: any) {
    const publications = await this.publicationsService.findAllByTeacher(user.id);
    return {
      success: true,
      data: publications,
    };
  }

  @Get('statistics')
  async getStatistics(@CurrentUser() user: any) {
    const statistics = await this.publicationsService.getStatistics(user.id);
    return {
      success: true,
      data: statistics,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const publication = await this.publicationsService.findOne(id);
    return {
      success: true,
      data: publication,
    };
  }

  @Patch(':id')
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
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    const result = await this.publicationsService.remove(id, user.id);
    return {
      success: true,
      data: result,
    };
  }
}
