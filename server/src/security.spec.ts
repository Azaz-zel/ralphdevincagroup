import { ForbiddenException, UnauthorizedException, type ExecutionContext } from '@nestjs/common';
import { AdminGuard } from './admin.js';
import { keepOwnPhotos, sniffPhoto, toWebp } from './projects/project.entity.js';
import { ProjectsService } from './projects/projects.service.js';
import type { Db } from './supabase.js';

function guardWith(user: object | null, error: object | null = null) {
  const db = { auth: { getUser: async () => ({ data: { user }, error }) } } as unknown as Db;
  return new AdminGuard(db);
}

function context(authorization?: string): ExecutionContext {
  const request = { headers: authorization ? { authorization } : {} };
  return { switchToHttp: () => ({ getRequest: () => request }) } as unknown as ExecutionContext;
}

describe('AdminGuard', () => {
  beforeEach(() => {
    process.env.ADMIN_EMAILS = 'owner@example.com';
  });

  it('refuses a request without a bearer token', async () => {
    await expect(guardWith(null).canActivate(context())).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(guardWith(null).canActivate(context('Basic abc'))).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('refuses a token Supabase does not accept', async () => {
    const guard = guardWith(null, { message: 'invalid JWT' });
    await expect(guard.canActivate(context('Bearer forged'))).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('refuses a real account that is not on ADMIN_EMAILS', async () => {
    const guard = guardWith({ email: 'stranger@example.com', email_confirmed_at: '2026-10-29T00:00:00Z' });
    await expect(guard.canActivate(context('Bearer t'))).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('refuses the admin email while it is unconfirmed', async () => {
    const guard = guardWith({ email: 'owner@example.com', email_confirmed_at: null });
    await expect(guard.canActivate(context('Bearer t'))).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('refuses everyone when ADMIN_EMAILS is empty', async () => {
    process.env.ADMIN_EMAILS = '';
    const guard = guardWith({ email: 'owner@example.com', email_confirmed_at: '2026-10-29T00:00:00Z' });
    await expect(guard.canActivate(context('Bearer t'))).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('lets the confirmed admin through', async () => {
    const guard = guardWith({ email: 'Owner@Example.com', email_confirmed_at: '2026-10-29T00:00:00Z' });
    await expect(guard.canActivate(context('Bearer t'))).resolves.toBe(true);
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

describe('toWebp', () => {
  it('re-encodes a PNG as WebP no wider than 2400px', async () => {
    const sharp = (await import('sharp')).default;
    const png = await sharp({ create: { width: 3000, height: 1000, channels: 3, background: '#c9a35a' } }).png().toBuffer();
    const out = await toWebp(png);
    expect(sniffPhoto(out)?.mime).toBe('image/webp');
    expect((await sharp(out).metadata()).width).toBe(2400);
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

describe('ProjectsService.reorder', () => {
  // A stand-in for Supabase that knows three projects and records each position update.
  const fakeDb = (updates: [number, number][]) =>
    ({
      from: () => ({
        select: () => Promise.resolve({ data: [{ id: 1 }, { id: 2 }, { id: 3 }], error: null }),
        update: (row: { position: number }) => ({
          eq: (_column: string, id: number) => {
            updates.push([id, row.position]);
            return Promise.resolve({ data: null, error: null });
          },
        }),
      }),
    }) as unknown as Db;

  it.each([[[1, 2]], [[1, 2, 2]], [[1, 2, 4]], [[1, 2, 3, 4]]])('refuses %j, which is not exactly the current projects', async (ids) => {
    const updates: [number, number][] = [];
    await expect(new ProjectsService(fakeDb(updates)).reorder(ids)).rejects.toThrow('The list changed');
    expect(updates).toEqual([]);
  });

  it('numbers the projects in the order given', async () => {
    const updates: [number, number][] = [];
    const service = new ProjectsService(fakeDb(updates));
    service.listAdmin = async () => [];
    await service.reorder([3, 1, 2]);
    expect(updates).toEqual([[3, 1], [1, 2], [2, 3]]);
  });
});
