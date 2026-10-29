import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    // Placeholders so the app boots; the e2e tests never reach the database.
    env: { DATABASE_URL: 'mysql://test:test@127.0.0.1:1/test', AUTH_SECRET: 'test-secret-test-secret-test-secret' },
  },
});
