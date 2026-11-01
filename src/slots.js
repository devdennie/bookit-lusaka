import { weekdayName } from './dates.js';

/** Half-open ranges [start, end) touch without overlapping. */
export function rangesOverlap(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

export function toMinutes(value) {
  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(String(value ?? '').trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 24 || minutes > 59) return null;
  return hours * 60 + minutes;
}

export function fromMinutes(total) {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/** Confirmed and completed bookings hold the chair. A no-show frees it. */
export function blocksAvailability(status) {
  return status !== 'no-show' && status !== 'cancelled';
}

function bookingOverlaps(booking, date, staffId, start, end) {
  if (booking.date !== date || !blocksAvailability(booking.status)) return false;
  if (booking.staffId && booking.staffId !== staffId) return false;
  const bookingStart = toMinutes(booking.start);
  if (bookingStart == null || !Number.isFinite(booking.durationMinutes)) return false;
  return rangesOverlap(start, end, bookingStart, bookingStart + booking.durationMinutes);
}

function blockOverlaps(block, date, staffId, start, end) {
  if (block.date !== date) return false;
  if (block.staffId && block.staffId !== staffId) return false;
  const blockStart = toMinutes(block.start);
  const blockEnd = toMinutes(block.end);
  if (blockStart == null || blockEnd == null) return false;
  return rangesOverlap(start, end, blockStart, blockEnd);
}

function isStaffFree(staffId, date, start, end, bookings, blocked) {
  if (blocked.some((block) => blockOverlaps(block, date, staffId, start, end))) return false;
  if (bookings.some((booking) => bookingOverlaps(booking, date, staffId, start, end))) return false;
  return true;
}

/**
 * Start times where the full service fits inside opening hours,
 * misses breaks, and leaves at least one requested stylist free.
 * `staffId` null means "no preference" across `staffIds`.
 * Pass `nowMinutes` to hide start times that are already in the past.
 */
export function getAvailableSlots({
  date,
  durationMinutes,
  openingHours,
  bookings = [],
  blocked = [],
  staffId = null,
  staffIds = [],
  intervalMinutes = 30,
  nowMinutes = null,
}) {
  if (!date || !Number.isFinite(durationMinutes) || durationMinutes <= 0) return [];
  const day = openingHours?.[weekdayName(date)];
  if (!day?.open || !day?.close) return [];

  const open = toMinutes(day.open);
  const close = toMinutes(day.close);
  if (open == null || close == null || close <= open) return [];

  const breaks = (day.breaks ?? [])
    .map((item) => [toMinutes(item.start), toMinutes(item.end)])
    .filter(([start, end]) => start != null && end != null && end > start);

  const candidates = staffId ? [staffId] : staffIds.filter(Boolean);
  if (candidates.length === 0) return [];

  const interval = Math.max(5, intervalMinutes || 30);
  const slots = [];

  for (let start = open; start + durationMinutes <= close; start += interval) {
    if (nowMinutes != null && start < nowMinutes) continue;
    const end = start + durationMinutes;
    if (breaks.some(([breakStart, breakEnd]) => rangesOverlap(start, end, breakStart, breakEnd))) {
      continue;
    }
    const freeStaff = candidates.find((id) => isStaffFree(id, date, start, end, bookings, blocked));
    if (!freeStaff) continue;
    slots.push({
      start: fromMinutes(start),
      end: fromMinutes(end),
      staffId: freeStaff,
    });
  }

  return slots;
}
