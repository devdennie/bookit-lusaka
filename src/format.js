import { DAY_ORDER } from './dates.js';
import { fromMinutes, toMinutes } from './slots.js';

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char]));
}

export function formatPrice(amount) {
  const number = Number(amount);
  if (!Number.isFinite(number)) return 'ZMW —';
  const body = Number.isInteger(number) ? String(number) : number.toFixed(2);
  return `ZMW ${body}`;
}

export function priceHtml(amount) {
  return `<span class="price-amt">${formatPrice(amount)}</span> <span class="example-tag">example</span>`;
}

export function formatDuration(minutes) {
  const total = Number(minutes);
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  if (hours && mins) return `${hours} hr ${mins} min`;
  if (hours === 1) return '1 hour';
  if (hours) return `${hours} hours`;
  return `${mins} min`;
}

export function formatTime(hhmm) {
  const total = toMinutes(hhmm);
  if (total == null) return String(hhmm ?? '');
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function formatTimeRange(start, end) {
  return `${formatTime(start)} – ${formatTime(end)}`;
}

export function endTime(start, durationMinutes) {
  const begin = toMinutes(start);
  if (begin == null) return start;
  return fromMinutes(begin + durationMinutes);
}

function utcDate(iso) {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function formatDateLong(iso) {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(utcDate(iso));
}

export function formatDayParts(iso) {
  const date = utcDate(iso);
  return {
    weekday: new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: 'UTC' }).format(date),
    day: String(date.getUTCDate()),
    month: new Intl.DateTimeFormat('en-GB', { month: 'short', timeZone: 'UTC' }).format(date),
  };
}

export function hoursLabel(day) {
  if (!day?.open || !day?.close) return 'Closed';
  const open = `${formatTime(day.open)} – ${formatTime(day.close)}`;
  const breaks = (day.breaks ?? [])
    .filter((item) => item.start && item.end)
    .map((item) => `${formatTime(item.start)} – ${formatTime(item.end)}`);
  return breaks.length ? `${open} · break ${breaks.join(', ')}` : open;
}

export function hoursRows(openingHours) {
  return DAY_ORDER.map(([key, label]) => ({
    key,
    label,
    value: hoursLabel(openingHours?.[key]),
  }));
}

export function staffName(staff, staffId) {
  if (!staffId) return 'Whole shop';
  return (staff ?? []).find((person) => person.id === staffId)?.name || 'Staff';
}

/**
 * `e164` is a placeholder in this demo (260970000000), not a real WhatsApp account.
 * The visible number is this same value, formatted (260970000000 becomes +260 97 000 0000).
 */
export function formatDemoPhone(e164) {
  const digits = String(e164 ?? '').replace(/\D/g, '');
  if (digits.startsWith('260') && digits.length === 12) {
    const local = digits.slice(3);
    return `+260 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5)}`;
  }
  return digits ? `+${digits}` : '';
}

export function whatsappUrl(e164, text) {
  const digits = String(e164 ?? '').replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function bookingMessage({
  businessName,
  serviceName,
  dateLabel,
  timeLabel,
  durationLabel,
  priceLabel,
  customerName,
  customerPhone,
  depositLabel,
}) {
  const lines = [
    `Hello ${businessName}, I would like to book:`,
    '',
    `Service: ${serviceName}`,
    `Date: ${dateLabel}`,
    `Time: ${timeLabel}`,
    `Duration: ${durationLabel}`,
    `Price: ${priceLabel} (example)`,
    `Name: ${customerName}`,
    `Phone: ${customerPhone}`,
  ];
  if (depositLabel) lines.push(`Deposit: ${depositLabel}`);
  lines.push('', 'Sent from the demo booking page. Example prices only. No payment was taken.');
  return lines.join('\n');
}
