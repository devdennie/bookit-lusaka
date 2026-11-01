const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export const DAY_ORDER = [
  ['monday', 'Monday'],
  ['tuesday', 'Tuesday'],
  ['wednesday', 'Wednesday'],
  ['thursday', 'Thursday'],
  ['friday', 'Friday'],
  ['saturday', 'Saturday'],
  ['sunday', 'Sunday'],
];

export function weekdayName(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  return WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
}

export function addDays(isoDate, days) {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

export function todayISO(timeZone = 'Africa/Lusaka', now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const value = (type) => parts.find((part) => part.type === type)?.value ?? '';
  return `${value('year')}-${value('month')}-${value('day')}`;
}

export function nowMinutes(timeZone = 'Africa/Lusaka', now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const value = (type) => Number(parts.find((part) => part.type === type)?.value ?? '0');
  return value('hour') * 60 + value('minute');
}

export function eachDate(startIso, count) {
  return Array.from({ length: count }, (_, index) => addDays(startIso, index));
}

export function isOpenDay(isoDate, openingHours) {
  if (!openingHours || Object.keys(openingHours).length === 0) return true;
  const day = openingHours[weekdayName(isoDate)];
  return Boolean(day?.open && day?.close);
}

/** Offset counts open days. A closed today uses the next open day as offset 0. */
export function openDayFromOffset(today, offset, openingHours = {}) {
  const magnitude = Math.abs(Number(offset) || 0);
  const direction = Number(offset) < 0 ? -1 : 1;
  let cursor = today;
  if (isOpenDay(cursor, openingHours)) {
    let remaining = magnitude;
    for (let guard = 0; remaining > 0 && guard < 28; guard += 1) {
      cursor = addDays(cursor, direction);
      if (isOpenDay(cursor, openingHours)) remaining -= 1;
    }
    return cursor;
  }
  for (let guard = 0; guard < 21 && !isOpenDay(cursor, openingHours); guard += 1) {
    cursor = addDays(cursor, direction);
  }
  // Walking backward already landed on the previous open day, which is offset -1.
  let remaining = direction < 0 ? Math.max(0, magnitude - 1) : magnitude;
  for (let guard = 0; remaining > 0 && guard < 28; guard += 1) {
    cursor = addDays(cursor, direction);
    if (isOpenDay(cursor, openingHours)) remaining -= 1;
  }
  return cursor;
}
