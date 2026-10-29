import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AdminController, AuthController } from './admin.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DbModule } from './db.js';
import { InquiriesModule } from './inquiries/inquiries.module.js';
import { ProjectsModule } from './projects/projects.module.js';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    DbModule,
    InquiriesModule,
    ProjectsModule,
  ],
  controllers: [AppController, AuthController, AdminController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
