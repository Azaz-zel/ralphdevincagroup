import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    // Placeholders so the app boots; the e2e tests never reach Supabase.
    env: { SUPABASE_URL: 'http://127.0.0.1:54321', SUPABASE_SECRET_KEY: 'test', ADMIN_EMAILS: 'owner@example.com' },
  },
});
