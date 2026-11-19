import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AdminController } from './admin.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { InquiriesModule } from './inquiries/inquiries.module.js';
import { ProjectsModule } from './projects/projects.module.js';
import { SupabaseModule } from './supabase.js';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    SupabaseModule,
    InquiriesModule,
    ProjectsModule,
  ],
  controllers: [AppController, AdminController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
