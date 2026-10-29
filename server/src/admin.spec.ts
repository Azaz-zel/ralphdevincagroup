import { checkPassword, hashPassword, signToken, verifyToken } from './admin.js';
import { toSearchTerm } from './inquiries/inquiry.entity.js';

describe('passwords', () => {
  it('accepts the right password and refuses a wrong one', async () => {
    const stored = await hashPassword('correct horse battery');
    expect(stored).toMatch(/^scrypt\$[0-9a-f]{32}\$[0-9a-f]{128}$/);
    await expect(checkPassword('correct horse battery', stored)).resolves.toBe(true);
    await expect(checkPassword('correct horse batterz', stored)).resolves.toBe(false);
  });

  it('refuses a malformed stored hash', async () => {
    await expect(checkPassword('x', 'plain-text')).resolves.toBe(false);
    await expect(checkPassword('x', 'scrypt$00$')).resolves.toBe(false);
  });
});

describe('session tokens', () => {
  beforeEach(() => {
    process.env.AUTH_SECRET = 'a'.repeat(32);
  });

  it('round-trips the email until it expires', () => {
    const token = signToken('owner@example.com', 0);
    expect(verifyToken(token, 1000)).toBe('owner@example.com');
    expect(verifyToken(token, 12 * 3_600_000 + 1)).toBeNull();
  });

  it('refuses a token with an edited payload or signed with another secret', () => {
    const [, signature] = signToken('owner@example.com').split('.');
    const forged = Buffer.from(JSON.stringify({ email: 'owner@example.com', exp: Date.now() + 9e9 })).toString('base64url');
    expect(verifyToken(`${forged}.${signature}`)).toBeNull();

    const token = signToken('owner@example.com');
    process.env.AUTH_SECRET = 'b'.repeat(32);
    expect(verifyToken(token)).toBeNull();
    expect(verifyToken('garbage')).toBeNull();
  });

  it('will not sign with a short secret', () => {
    process.env.AUTH_SECRET = 'short';
    expect(() => signToken('owner@example.com')).toThrow(/AUTH_SECRET/);
  });
});

describe('toSearchTerm', () => {
  it('strips quotes, backslashes and asterisks', () => {
    expect(toSearchTerm('a"),id.eq.1\*')).toBe('a),id.eq.1');
  });

  it('trims, caps length and ignores non-strings', () => {
    expect(toSearchTerm('  bali  ')).toBe('bali');
    expect(toSearchTerm('x'.repeat(300))).toHaveLength(100);
    expect(toSearchTerm(['array'])).toBe('');
  });
});
