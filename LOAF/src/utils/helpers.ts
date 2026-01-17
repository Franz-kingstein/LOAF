export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function todayDate(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function parseDate(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00Z`);
}
