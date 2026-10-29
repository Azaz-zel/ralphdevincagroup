import { createHmac, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import {
  Body,
  type CanActivate,
  Controller,
  type ExecutionContext,
  Get,
  HttpCode,
  Injectable,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, Length } from 'class-validator';
import type { Request } from 'express';
import { Db } from './db.js';

const scryptAsync = promisify(scrypt) as (password: string, salt: Buffer, length: number) => Promise<Buffer>;
const SESSION_HOURS = 12;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  return `scrypt$${salt.toString('hex')}$${(await scryptAsync(password, salt, 64)).toString('hex')}`;
}

export async function checkPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, salt, hash] = stored.split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'hex');
  if (expected.length === 0) return false;
  const actual = await scryptAsync(password, Buffer.from(salt, 'hex'), expected.length);
  return timingSafeEqual(actual, expected);
}

// Checked against when the email is unknown, so the response time does not reveal which emails exist.
const NO_USER = `scrypt$${'00'.repeat(16)}$${'00'.repeat(64)}`;

function secret(): string {
  const value = process.env.AUTH_SECRET ?? '';
  if (value.length < 32) throw new Error('AUTH_SECRET must be at least 32 characters. Set it in server/.env.');
  return value;
}

const sign = (payload: string) => createHmac('sha256', secret()).update(payload).digest('base64url');

/** A session token: the email and expiry, signed with AUTH_SECRET. */
export function signToken(email: string, now = Date.now()): string {
  const payload = Buffer.from(JSON.stringify({ email, exp: now + SESSION_HOURS * 3_600_000 })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

/** The email in a token that is signed by this server and not expired, otherwise null. */
export function verifyToken(token: string, now = Date.now()): string | null {
  const [payload, signature = ''] = token.split('.');
  const expected = Buffer.from(sign(payload ?? ''));
  const given = Buffer.from(signature);
  if (!payload || given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try {
    const { email, exp } = JSON.parse(Buffer.from(payload, 'base64url').toString()) as { email?: unknown; exp?: unknown };
    return typeof email === 'string' && typeof exp === 'number' && exp > now ? email : null;
  } catch {
    return null;
  }
}

/**
 * The browser sends the token it got from /auth/login. The signature and expiry
 * are checked, and the account must still be in the users table, so deleting a
 * user ends their session.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly db: Db) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { adminEmail?: string }>();
    const header = request.headers.authorization ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) throw new UnauthorizedException('Sign in to continue.');

    const email = verifyToken(token);
    const [user] = email ? await this.db.query<{ email: string }[]>('SELECT email FROM users WHERE email = ?', [email]) : [];
    if (!user) throw new UnauthorizedException('Your session has ended. Sign in again.');

    request.adminEmail = user.email;
    return true;
  }
}

class LoginDto {
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'Enter an email address in the format name@example.com.' })
  email: string;

  @IsString() @Length(1, 200) password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly db: Db) {}

  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async login(@Body() dto: LoginDto): Promise<{ token: string; email: string }> {
    const [user] = await this.db.query<{ email: string; password_hash: string }[]>(
      'SELECT email, password_hash FROM users WHERE email = ?',
      [dto.email],
    );
    const ok = await checkPassword(dto.password, user?.password_hash ?? NO_USER);
    if (!user || !ok) throw new UnauthorizedException('That email and password don’t match. Check both and try again.');
    return { token: signToken(user.email), email: user.email };
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
