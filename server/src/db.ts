import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { Global, Injectable, InternalServerErrorException, Module, type OnModuleDestroy } from '@nestjs/common';
import { createPool, type Pool } from 'mysql2/promise';

/** Uploaded photos live here and are served at /uploads. */
export const UPLOADS = resolve(process.env.UPLOADS_DIR ?? 'uploads');

export function photoUrl(path: string): string {
  const encoded = path.split('/').map(encodeURIComponent).join('/');
  return `${process.env.PUBLIC_URL ?? `http://localhost:${process.env.PORT ?? 3001}`}/uploads/${encoded}`;
}

export async function saveFile(path: string, data: Buffer): Promise<void> {
  const target = join(UPLOADS, path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, data, { flag: 'wx' });
}

export async function removeFiles(paths: string[]): Promise<void> {
  const results = await Promise.allSettled(paths.map((path) => rm(join(UPLOADS, path), { force: true })));
  // The row is already saved; a leftover file only costs disk space, so log it rather than fail the request.
  const failed = results.filter((result) => result.status === 'rejected');
  if (failed.length) console.error('Could not remove photos', paths, failed);
}

/** MySQL error number for a duplicate value in a unique column. */
export const DUPLICATE = 1062;

@Injectable()
export class Db implements OnModuleDestroy {
  private readonly pool: Pool;

  constructor() {
    const uri = process.env.DATABASE_URL;
    if (!uri) throw new Error('DATABASE_URL is not set. Copy server/.env.example to server/.env and fill it in.');
    this.pool = createPool({ uri, timezone: 'Z', connectionLimit: 10 });
    // TIMESTAMP columns are read and written in UTC, matching timezone: 'Z' above.
    this.pool.on('connection', (connection) => connection.query("SET time_zone = '+00:00'"));
  }

  /** Runs one parameterised query. A database error becomes a 500 without leaking its text; a duplicate is rethrown for the caller. */
  async query<T = unknown>(sql: string, values: unknown[] = []): Promise<T> {
    try {
      const [result] = await this.pool.query(sql, values);
      return result as T;
    } catch (error) {
      if ((error as { errno?: number }).errno === DUPLICATE) throw error;
      console.error(error);
      throw new InternalServerErrorException('The database could not be reached. Try again in a moment.');
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}

@Global()
@Module({ providers: [Db], exports: [Db] })
export class DbModule {}
