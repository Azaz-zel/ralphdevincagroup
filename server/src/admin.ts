import {
  type CanActivate,
  Controller,
  type ExecutionContext,
  ForbiddenException,
  Get,
  Inject,
  Injectable,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { SUPABASE, type Db } from './supabase.js';

export function isAdmin(email: string | undefined, list = ''): boolean {
  const allowed = list
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
  return !!email && allowed.includes(email.toLowerCase());
}

/**
 * The browser signs in with Supabase Auth and sends its access token. The
 * token is checked with Supabase, and the email must be on ADMIN_EMAILS, so a
 * stray sign-up never reaches the admin.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(@Inject(SUPABASE) private readonly db: Db) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { adminEmail?: string }>();
    const header = request.headers.authorization ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) throw new UnauthorizedException('Sign in to continue.');

    const { data, error } = await this.db.auth.getUser(token);
    if (error || !data.user) throw new UnauthorizedException('Your session has ended. Sign in again.');
    // An unconfirmed address proves nothing about who owns it.
    if (!data.user.email_confirmed_at || !isAdmin(data.user.email, process.env.ADMIN_EMAILS)) {
      throw new ForbiddenException('This account is not allowed to use the admin.');
    }

    request.adminEmail = data.user.email;
    return true;
  }
}

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  @Get('me')
  me(@Req() request: Request & { adminEmail?: string }): { email: string | undefined } {
    return { email: request.adminEmail };
  }
}
