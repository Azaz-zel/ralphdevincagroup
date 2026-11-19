import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { NextFunction, Request, Response } from 'express';

/** Headers for an API that only ever returns JSON: nothing here should be framed, sniffed or cached. */
export function securityHeaders(request: Request, response: Response, next: NextFunction): void {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('X-Frame-Options', 'DENY');
  response.setHeader('Referrer-Policy', 'no-referrer');
  response.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
  if (request.path.startsWith('/admin')) response.setHeader('Cache-Control', 'no-store');
  next();
}

/** Everything main.ts sets on the app, shared with the e2e tests so they test the real thing. */
export function configure(app: NestExpressApplication): void {
  if (process.env.TRUST_PROXY === '1') app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use(securityHeaders);
  app.enableCors({
    origin: (process.env.CLIENT_ORIGINS ?? 'http://localhost:5173').split(',').map((origin) => origin.trim()),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  // whitelist + forbidNonWhitelisted: a field the DTO does not declare (status, id, images...) is refused, not ignored.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
}
