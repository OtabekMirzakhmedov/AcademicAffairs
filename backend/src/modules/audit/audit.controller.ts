import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { AuditQueryDto } from './dto/audit-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('audit-logs')
@ApiBearerAuth('JWT-auth')
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({
    summary: 'Get audit logs',
    description: 'Paginated audit log with optional filters (admin only)',
  })
  @ApiResponse({ status: 200, description: 'Returns paginated audit logs' })
  async findAll(@Query() query: AuditQueryDto) {
    return { success: true, data: await this.auditService.findAll(query) };
  }

  @Get('entity/:type/:id')
  @ApiOperation({
    summary: 'Get entity audit history',
    description: 'Full history of one entity (admin only)',
  })
  @ApiParam({
    name: 'type',
    description: 'Entity type e.g. TeachingActivity, User',
  })
  @ApiParam({ name: 'id', description: 'Entity ID' })
  @ApiResponse({ status: 200, description: 'Returns entity audit history' })
  async findByEntity(
    @Param('type') type: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return {
      success: true,
      data: await this.auditService.findByEntity(type, id),
    };
  }

  @Get('actor/:userId')
  @ApiOperation({
    summary: 'Get actor audit history',
    description: 'Everything an actor did (admin only)',
  })
  @ApiParam({ name: 'userId', description: 'Actor user ID' })
  @ApiResponse({ status: 200, description: 'Returns actor audit history' })
  async findByActor(@Param('userId', ParseIntPipe) userId: number) {
    return { success: true, data: await this.auditService.findByActor(userId) };
  }
}
