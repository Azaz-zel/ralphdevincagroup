import { isAdmin } from './admin.js';
import { toSearchTerm } from './inquiries/inquiry.entity.js';

describe('isAdmin', () => {
  it('accepts a listed email regardless of case and spacing', () => {
    expect(isAdmin('Owner@Example.com', ' owner@example.com , other@example.com')).toBe(true);
  });

  it('rejects an unlisted email, a missing email and an empty list', () => {
    expect(isAdmin('stranger@example.com', 'owner@example.com')).toBe(false);
    expect(isAdmin(undefined, 'owner@example.com')).toBe(false);
    expect(isAdmin('owner@example.com', '')).toBe(false);
  });
});

describe('toSearchTerm', () => {
  it('strips the characters that could break out of a quoted filter', () => {
    expect(toSearchTerm('a"),id.eq.1\\*')).toBe('a),id.eq.1');
  });

  it('trims, caps length and ignores non-strings', () => {
    expect(toSearchTerm('  bali  ')).toBe('bali');
    expect(toSearchTerm('x'.repeat(300))).toHaveLength(100);
    expect(toSearchTerm(['array'])).toBe('');
  });
});
