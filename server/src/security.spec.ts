import { UnauthorizedException, type ExecutionContext } from '@nestjs/common';
import { AdminGuard, signToken } from './admin.js';
import type { Db } from './db.js';
import { keepOwnPhotos, sniffPhoto } from './projects/project.entity.js';

function guardWith(users: string[]) {
  const db = { query: async (_sql: string, [email]: string[]) => users.filter((user) => user === email).map((user) => ({ email: user })) };
  return new AdminGuard(db as unknown as Db);
}

function context(authorization?: string): ExecutionContext {
  const request = { headers: authorization ? { authorization } : {} };
  return { switchToHttp: () => ({ getRequest: () => request }) } as unknown as ExecutionContext;
}

describe('AdminGuard', () => {
  beforeEach(() => {
    process.env.AUTH_SECRET = 'a'.repeat(32);
  });

  it('refuses a request without a bearer token', async () => {
    await expect(guardWith([]).canActivate(context())).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(guardWith([]).canActivate(context('Basic abc'))).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('refuses a token this server did not sign', async () => {
    await expect(guardWith(['owner@example.com']).canActivate(context('Bearer forged.token'))).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('refuses a valid token for an account that was deleted', async () => {
    const token = signToken('owner@example.com');
    await expect(guardWith([]).canActivate(context('Bearer ' + token))).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('lets an existing admin through', async () => {
    const token = signToken('owner@example.com');
    await expect(guardWith(['owner@example.com']).canActivate(context('Bearer ' + token))).resolves.toBe(true);
  });
});

describe('sniffPhoto', () => {
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
  const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0]);
  const webp = Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WEBPVP8 ')]);

  it('recognises real JPEG, PNG and WebP files', () => {
    expect(sniffPhoto(jpeg)?.mime).toBe('image/jpeg');
    expect(sniffPhoto(png)?.mime).toBe('image/png');
    expect(sniffPhoto(webp)?.mime).toBe('image/webp');
  });

  it('refuses HTML, SVG and empty files whatever they claim to be', () => {
    expect(sniffPhoto(Buffer.from('<html><script>alert(1)</script></html>'))).toBeNull();
    expect(sniffPhoto(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"/>'))).toBeNull();
    expect(sniffPhoto(Buffer.alloc(0))).toBeNull();
  });
});

describe('keepOwnPhotos', () => {
  const current = [
    { path: '1/a.jpg', alt: 'A' },
    { path: '1/b.jpg', alt: 'B' },
  ];

  it('keeps the requested order and new alt text of the project’s own photos', () => {
    expect(keepOwnPhotos(current, [{ path: '1/b.jpg', alt: 'B2' }, { path: '1/a.jpg', alt: 'A' }])).toEqual([
      { path: '1/b.jpg', alt: 'B2' },
      { path: '1/a.jpg', alt: 'A' },
    ]);
  });

  it('drops paths from another project and duplicates', () => {
    expect(keepOwnPhotos(current, [{ path: '2/secret.jpg', alt: '' }, { path: '1/a.jpg', alt: '' }, { path: '1/a.jpg', alt: '' }])).toEqual([
      { path: '1/a.jpg', alt: '' },
    ]);
  });

  it('keeps everything when the request does not mention photos', () => {
    expect(keepOwnPhotos(current, undefined)).toBe(current);
  });
});
