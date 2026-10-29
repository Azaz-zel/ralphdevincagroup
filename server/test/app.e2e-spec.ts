import { Test, TestingModule } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';
import { configure } from './../src/security.js';

// None of these requests reach Supabase: each is answered before any query runs.
describe('API (e2e)', () => {
  let app: NestExpressApplication;
  const valid = { name: 'Ayu', email: 'ayu@example.com', message: 'Hello', company_website: 'bot-filled' };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleFixture.createNestApplication<NestExpressApplication>();
    configure(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer()).get('/').expect(200).expect('Hello World!');
  });

  describe('contact form', () => {
    it('rejects a bad email', () => {
      return request(app.getHttpServer()).post('/inquiries').send({ ...valid, email: 'not-an-email' }).expect(400);
    });

    it('rejects a message over 5,000 characters', () => {
      return request(app.getHttpServer()).post('/inquiries').send({ ...valid, message: 'x'.repeat(5001) }).expect(400);
    });

    it('refuses fields a visitor may not set, such as status', () => {
      return request(app.getHttpServer()).post('/inquiries').send({ ...valid, status: 'replied' }).expect(400);
    });

    it('refuses an unknown division', () => {
      return request(app.getHttpServer()).post('/inquiries').send({ ...valid, division: 'admin' }).expect(400);
    });

    it('answers a filled honeypot as if the message was sent', () => {
      return request(app.getHttpServer()).post('/inquiries').send(valid).expect(201, { sent: true });
    });

    it('stops the sixth message within a minute', async () => {
      const server = app.getHttpServer();
      for (let i = 0; i < 5; i++) await request(server).post('/inquiries').send(valid).expect(201);
      await request(server).post('/inquiries').send(valid).expect(429);
    });
  });

  describe('admin', () => {
    const routes: [string, string][] = [
      ['get', '/admin/me'],
      ['get', '/admin/inquiries'],
      ['get', '/admin/inquiries/3f1c2a7e-0000-4000-8000-000000000000'],
      ['patch', '/admin/inquiries/3f1c2a7e-0000-4000-8000-000000000000'],
      ['get', '/admin/projects'],
      ['post', '/admin/projects'],
      ['put', '/admin/projects/1'],
      ['delete', '/admin/projects/1'],
      ['post', '/admin/projects/1/photos'],
    ];

    it.each(routes)('%s %s is closed without a token', async (method, path) => {
      await (request(app.getHttpServer()) as unknown as Record<string, (p: string) => request.Test>)[method](path).expect(401);
    });

    it('is closed with a token that is not a bearer token', () => {
      return request(app.getHttpServer()).get('/admin/inquiries').set('Authorization', 'Basic YWRtaW46YWRtaW4=').expect(401);
    });
  });

  describe('headers', () => {
    it('sends security headers and hides the framework', async () => {
      const response = await request(app.getHttpServer()).get('/');
      expect(response.headers['x-powered-by']).toBeUndefined();
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['content-security-policy']).toContain("default-src 'none'");
    });

    it('does not let admin responses be cached', async () => {
      const response = await request(app.getHttpServer()).get('/admin/me');
      expect(response.headers['cache-control']).toBe('no-store');
    });

    it('allows the site’s own origin and no other', async () => {
      const own = await request(app.getHttpServer()).get('/').set('Origin', 'http://localhost:5173');
      expect(own.headers['access-control-allow-origin']).toBe('http://localhost:5173');
      const other = await request(app.getHttpServer()).get('/').set('Origin', 'https://evil.example');
      expect(other.headers['access-control-allow-origin']).toBeUndefined();
    });
  });
});
