import { Global, InternalServerErrorException, Module } from '@nestjs/common';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export const SUPABASE = 'SUPABASE';
export type Db = SupabaseClient;

export const BUCKET = 'work';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set. Copy server/.env.example to server/.env and fill it in.`);
  return value;
}

@Global()
@Module({
  providers: [
    {
      provide: SUPABASE,
      useFactory: (): Db =>
        createClient(required('SUPABASE_URL'), required('SUPABASE_SECRET_KEY'), {
          auth: { persistSession: false, autoRefreshToken: false },
        }),
    },
  ],
  exports: [SUPABASE],
})
export class SupabaseModule {}

export function photoUrl(path: string): string {
  const encoded = path.split('/').map(encodeURIComponent).join('/');
  return `${process.env.SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${encoded}`;
}

/** Unwraps a Supabase result, turning a database error into a 500 without leaking its text. */
export function must<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) {
    console.error(result.error);
    throw new InternalServerErrorException('The database could not be reached. Try again in a moment.');
  }
  return result.data as T;
}
