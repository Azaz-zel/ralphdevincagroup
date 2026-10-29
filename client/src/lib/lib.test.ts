import { describe, expect, it } from 'vitest';
import { validate } from './contact';
import { ago, paragraphs, slugify, spell } from './format';
import { match, safeNext } from './router';

describe('safeNext', () => {
  it('follows an admin path', () => {
    expect(safeNext('?next=/admin/projects/3')).toBe('/admin/projects/3');
  });

  it('refuses anything that could leave the admin or loop', () => {
    expect(safeNext('?next=https://evil.example')).toBe('/admin/inbox');
    expect(safeNext('?next=//evil.example/admin/x')).toBe('/admin/inbox');
    expect(safeNext('?next=/admin/login')).toBe('/admin/inbox');
    expect(safeNext('?next=/admin/x?y=https://evil.example')).toBe('/admin/inbox');
    expect(safeNext('')).toBe('/admin/inbox');
  });
});

describe('match', () => {
  it('reads params and rejects other shapes', () => {
    expect(match('/work/:slug', '/work/bali-cebelok-gesiuh')).toEqual({ slug: 'bali-cebelok-gesiuh' });
    expect(match('/work/:slug', '/work/a/b')).toBeNull();
    expect(match('/admin/projects/:id', '/admin/projects/12/')).toEqual({ id: '12' });
  });
});

describe('validate', () => {
  it('passes a complete message and names each missing field', () => {
    expect(validate({ name: 'Ayu', email: 'ayu@example.com', message: 'Hello' })).toEqual({});
    expect(Object.keys(validate({ name: ' ', email: 'nope', message: '' }))).toEqual(['name', 'email', 'message']);
    expect(validate({ name: 'A', email: 'a@b.co', message: 'x'.repeat(5001) }).message).toMatch(/5,000/);
  });
});

describe('format', () => {
  it('slugifies names, including accented letters', () => {
    expect(slugify('Bali Cebelok Gesiuh')).toBe('bali-cebelok-gesiuh');
    expect(slugify('  Prêt-à-porter!  ')).toBe('pret-a-porter');
  });

  it('splits paragraphs on blank lines', () => {
    expect(paragraphs('One.\n\nTwo.\n  \nThree.')).toEqual(['One.', 'Two.', 'Three.']);
    expect(paragraphs(null)).toEqual([]);
  });

  it('spells small counts and says how long ago', () => {
    expect(spell(3)).toBe('Three');
    expect(spell(14)).toBe('14');
    const now = Date.parse('2026-10-29T12:00:00Z');
    expect(ago('2026-10-29T10:00:00Z', now)).toBe('2h');
    expect(ago('2026-10-26T12:00:00Z', now)).toBe('3d');
  });
});
