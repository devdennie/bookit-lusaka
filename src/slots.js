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

function dayWindow(date, openingHours) {
  const day = openingHours?.[weekdayName(date)];
  if (!day?.open || !day?.close) return null;
  const open = toMinutes(day.open);
  const close = toMinutes(day.close);
  if (open == null || close == null || close <= open) return null;
  const breaks = (day.breaks ?? [])
    .map((item) => [toMinutes(item.start), toMinutes(item.end)])
    .filter(([start, end]) => start != null && end != null && end > start);
  return { open, close, breaks };
}

function classifyStart({
  start,
  durationMinutes,
  breaks,
  date,
  bookings,
  blocked,
  staffId,
  staffIds,
  nowMinutes,
}) {
  const end = start + durationMinutes;
  const past = nowMinutes != null && start < nowMinutes;
  const crossesBreak = breaks.some(([breakStart, breakEnd]) => rangesOverlap(start, end, breakStart, breakEnd));
  const candidates = staffId ? [staffId] : staffIds.filter(Boolean);
  const freeStaff = candidates.find((id) => isStaffFree(id, date, start, end, bookings, blocked));
  if (!past && !crossesBreak && freeStaff) {
    return { available: true, staffId: freeStaff, reason: null };
  }
  let reason = 'unavailable';
  if (!freeStaff) reason = 'booked';
  else if (crossesBreak) reason = 'break';
  else if (past) reason = 'past';
  return { available: false, staffId: null, reason };
}

/**
 * Every start that finishes by closing, including ones that cannot be booked.
 * Runs of three or more unavailable starts collapse into one labelled row.
 */
export function getSlotTimeline({
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
  const window = dayWindow(date, openingHours);
  if (!window) return [];

  const interval = Math.max(5, intervalMinutes || 30);
  const raw = [];
  for (let start = window.open; start + durationMinutes <= window.close; start += interval) {
    const classified = classifyStart({
      start,
      durationMinutes,
      breaks: window.breaks,
      date,
      bookings,
      blocked,
      staffId,
      staffIds,
      nowMinutes,
    });
    raw.push({
      start: fromMinutes(start),
      end: fromMinutes(start + durationMinutes),
      ...classified,
    });
  }

  const timeline = [];
  let index = 0;
  while (index < raw.length) {
    if (raw[index].available) {
      timeline.push({
        kind: 'open',
        start: raw[index].start,
        end: raw[index].end,
        staffId: raw[index].staffId,
        available: true,
      });
      index += 1;
      continue;
    }
    let endIndex = index;
    while (endIndex < raw.length && !raw[endIndex].available) endIndex += 1;
    const run = raw.slice(index, endIndex);
    if (run.length >= 3) {
      const next = raw[endIndex];
      const endLabel = next ? next.start : run[run.length - 1].end;
      const fullyBooked = run.every((item) => item.reason === 'booked');
      const title = fullyBooked ? 'Fully booked' : 'Unavailable';
      timeline.push({
        kind: 'span',
        start: run[0].start,
        end: endLabel,
        available: false,
        label: `${title} ${run[0].start}-${endLabel}`,
      });
    } else {
      run.forEach((item) => {
        timeline.push({
          kind: 'unavailable',
          start: item.start,
          end: item.end,
          available: false,
          label: 'Unavailable',
        });
      });
    }
    index = endIndex;
  }
  return timeline;
}

/**
 * Start times where the full service fits inside opening hours,
 * misses breaks, and leaves at least one requested stylist free.
 * `staffId` null means "no preference" across `staffIds`.
 * Pass `nowMinutes` to hide start times that are already in the past.
 */
export function getAvailableSlots(options) {
  return getSlotTimeline(options)
    .filter((item) => item.kind === 'open')
    .map(({ start, end, staffId }) => ({ start, end, staffId }));
}
