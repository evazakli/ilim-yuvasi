// Time and Date formatting utilities matching the Python CustomTkinter implementation

export const TURKISH_MONTHS = [
  '', 'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export const TURKISH_WEEKDAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

export function formatDateDDMMYYYY(date: Date = new Date()): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

export function formatTimeHHMMSS(date: Date = new Date()): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

export function getWeekdayName(date: Date = new Date()): string {
  const dayIdx = (date.getDay() + 6) % 7; // Monday = 0
  return TURKISH_WEEKDAYS[dayIdx];
}

export function formatRemainingSeconds(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// Auto-formatter for date input: GG/AA/YYYY
export function maskDateInput(input: string): string {
  const digits = input.replace(/\D/g, '').slice(0, 8);
  if (digits.length > 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  } else if (digits.length > 2) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return digits;
}

// Auto-formatter for time input: SS:DD
export function maskTimeInput(input: string): string {
  const digits = input.replace(/\D/g, '').slice(0, 4);
  if (digits.length > 2) {
    return `${digits.slice(0, 2)}:${digits.slice(2)}`;
  }
  return digits;
}

// Calculate countdown string for events matching Python relativedelta
export function calculateEventCountdown(dateStr: string, timeStr: string = '00:00'): { countdown: string; isPast: boolean } {
  // Format: DD/MM/YYYY and HH:mm
  const parts = dateStr.split('/');
  if (parts.length !== 3) return { countdown: 'Geçersiz', isPast: false };

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);

  const [hours, mins] = timeStr.split(':').map(v => parseInt(v, 10) || 0);

  const targetDate = new Date(year, month, day, hours, mins, 0);
  const now = new Date();

  const diffMs = targetDate.getTime() - now.getTime();
  if (diffMs <= 0) {
    return { countdown: 'Geçti', isPast: true };
  }

  const diffSec = Math.floor(diffMs / 1000);
  const days = Math.floor(diffSec / 86400);
  const remHours = Math.floor((diffSec % 86400) / 3600);
  const remMinutes = Math.floor((diffSec % 3600) / 60);

  const partsOut: string[] = [];
  if (days > 365) {
    const years = Math.floor(days / 365);
    partsOut.push(`${years} yıl`);
  }
  if (days > 30) {
    const months = Math.floor((days % 365) / 30);
    if (months > 0) partsOut.push(`${months} ay`);
  }
  if (days > 0) {
    const remainingDays = days % 30;
    if (remainingDays > 0) partsOut.push(`${remainingDays} gün`);
  }

  if (partsOut.length === 0) {
    if (remHours > 0) partsOut.push(`${remHours} sa`);
    if (remMinutes > 0) partsOut.push(`${remMinutes} dk`);
  }

  if (partsOut.length === 0) {
    return { countdown: 'Az kaldı', isPast: false };
  }

  return { countdown: `${partsOut.join(', ')} kaldı`, isPast: false };
}
