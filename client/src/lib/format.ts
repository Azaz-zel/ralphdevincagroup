const WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'];

export const spell = (n: number): string => WORDS[n] ?? String(n);
export const pad = (n: number): string => String(n).padStart(2, '0');
export const plural = (n: number, word: string): string => (n === 1 ? word : word + 's');

export const divisionLabel = (division: string): string =>
  division === 'perfumery' ? 'Perfumery' : division === 'technology' ? 'Technology' : 'Not sure';

export function dateTime(iso: string | null | undefined): string {
  if (!iso) return 'Not yet';
  return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/** "2h", "3d", "1w": how long ago, in the shortest unit that reads naturally. */
export function ago(iso: string, now = Date.now()): string {
  const minutes = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d`;
  if (days < 60) return `${Math.round(days / 7)}w`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Paragraphs are stored separated by a blank line. */
export const paragraphs = (text: string | null | undefined): string[] =>
  (text ?? '').split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);

/** A URL address from a project name: "Bali Cebelok Gesiuh" becomes "bali-cebelok-gesiuh". */
export const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
