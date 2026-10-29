import { hashPassword } from './admin.js';
import { Db } from './db.js';

try {
  process.loadEnvFile();
} catch {
  // No .env file: the variables come from the environment.
}

const [email, password] = process.argv.slice(2);
if (!email?.includes('@') || !password || password.length < 12) {
  console.error('Usage: npm run admin:create -- <email> <password of 12 or more characters>');
  process.exit(1);
}

const db = new Db();
// Running it again for the same email resets that password.
await db.query('INSERT INTO users (email, password_hash) VALUES (?, ?) ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)', [
  email.trim().toLowerCase(),
  await hashPassword(password),
]);
await db.onModuleDestroy();
console.log(`${email} can now sign in at /admin/login.`);
