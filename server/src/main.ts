import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';
import { configure } from './security.js';

try {
  process.loadEnvFile();
} catch {
  // No .env file: the variables come from the environment (Docker, the host).
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  configure(app);
  await app.listen(process.env.PORT ?? 3001);
}
await bootstrap();
