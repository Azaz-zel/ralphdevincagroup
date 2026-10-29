import { Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { AdminGuard } from '../admin.js';
import { InquiriesService } from './inquiries.service.js';
import { CreateInquiryDto, UpdateStatusDto } from './inquiry.entity.js';

@Controller('inquiries')
export class InquiriesController {
  constructor(private readonly service: InquiriesService) {}

  @Post()
  @HttpCode(201)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async create(@Body() dto: CreateInquiryDto, @Req() request: Request): Promise<{ sent: true }> {
    // A filled honeypot gets the same answer as a real message, so the bot learns nothing.
    if (!dto.company_website) {
      await this.service.create(dto, { ip: request.ip, userAgent: request.get('user-agent') });
    }
    return { sent: true };
  }
}

@Controller('admin/inquiries')
@UseGuards(AdminGuard)
export class AdminInquiriesController {
  constructor(private readonly service: InquiriesService) {}

  @Get()
  list(@Query('status') status?: string, @Query('q') q?: string) {
    return this.service.list(status, q);
  }

  @Get(':id')
  open(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.open(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateStatusDto) {
    return this.service.setStatus(id, dto.status);
  }
}
