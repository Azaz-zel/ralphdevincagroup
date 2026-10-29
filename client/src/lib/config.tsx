import type { ReactNode } from 'react';

export const site = {
  name: 'Ralph de Vinca Group',
  tagline: 'Wisdom that binds, and endures.',
  location: 'Bali, Indonesia',
  email: 'mangadrian2@gmail.com',
  privacyUpdated: 'September 2026',
  description:
    'An independent group in Bali with two divisions: a fragrance platform and a software practice. Both build things that are not seen, but felt.',
};

/**
 * Photos on the fixed pages. Put a file in client/public/photos/ and set its path
 * here, for example '/photos/perfumery.jpg'. Until then the division mark stands in.
 * Case study photos are uploaded in the admin instead.
 */
export const photos: Record<'perfumery' | 'technology' | 'founder', { src: string | null; alt: string }> = {
  perfumery: { src: null, alt: '' },
  technology: { src: null, alt: '' },
  founder: { src: null, alt: 'Adrian, founder of Ralph de Vinca Group' },
};

export const nav = [
  { href: '/about', label: 'About' },
  { href: '/perfumery', label: 'Perfumery' },
  { href: '/technology', label: 'Technology' },
  { href: '/work', label: 'Work' },
  { href: '/contact', label: 'Contact' },
];

export const principles: { name: string; short: string; body: ReactNode }[] = [
  {
    name: 'Composition',
    short: 'Layers that resolve into one impression.',
    body: 'Nothing is made of a single ingredient. Everything is layers that resolve into one impression. This is as true of a system as it is of a scent.',
  },
  {
    name: 'Precision',
    short: 'Decisions are made by weighing them, not by moving quickly.',
    body: (
      <>
        From <em>rād</em>, counsel. Decisions are made by weighing them, not by moving quickly. This is what separates work that was thought
        through from work that was copied.
      </>
    ),
  },
  {
    name: 'Binding',
    short: 'Not to be visited once. To be worth returning to.',
    body: (
      <>
        From <em>vincire</em>, to bind. The goal is not to be visited once. It is to be worth returning to.
      </>
    ),
  },
  {
    name: 'Endurance',
    short: 'Grows in shade, spreads slowly, almost impossible to kill.',
    body: 'From the vinca plant, which grows in shade, spreads slowly, and is almost impossible to kill. The opposite of burning bright and going out.',
  },
];

export const divisions = {
  perfumery: {
    name: 'Perfumery',
    href: '/perfumery',
    line: 'Fragrance, explained rather than sold',
    summary:
      'A platform for understanding fragrance: houses, notes, and how a composition unfolds over the hours it is worn. Built from an interest, and kept free of anything for sale.',
  },
  technology: {
    name: 'Technology',
    href: '/technology',
    line: 'Systems that hold',
    summary:
      'Websites and internal systems for businesses and institutions. Built so the decisions hold, and nothing has to be torn down halfway.',
  },
};
