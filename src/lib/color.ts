export function nameToBgColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 40%, 25%)`;
}

export function nameToTextColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 60%, 70%)`;
}

export function getCustomerLevel(orderCount: number): { label: string; icon: string; color: string } {
  if (orderCount >= 15) return { label: 'Cliente Premium', icon: '💎', color: 'text-blue-400' };
  if (orderCount >= 5) return { label: 'Cliente VIP', icon: '⭐', color: 'text-yellow-400' };
  if (orderCount >= 1) return { label: 'Cliente Frequente', icon: '🤝', color: 'text-green-400' };
  return { label: 'Novo Cliente', icon: '🌱', color: 'text-zinc-400' };
}
