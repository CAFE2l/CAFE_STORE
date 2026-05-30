export function sanitizeSku(value: string | null | undefined) {
  return (value ?? '').toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 30);
}

export function generateSku(name: string): string {
  const slug = name
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.slice(0, 3))
    .join('-');
  const suffix = Math.random().toString(36).substring(2, 8).toUpperCase();

  return `CAF-${slug || 'PRO'}-${suffix}`;
}
