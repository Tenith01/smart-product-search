export function normalise(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ');
}

export function tokenize(query: string): string[] {
  return normalise(query).split(' ').filter(Boolean);
}
