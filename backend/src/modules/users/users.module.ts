import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { ReportsPdfModule } from '../reports-pdf/reports-pdf.module';

@Module({
  imports: [PrismaModule, ReportsPdfModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
