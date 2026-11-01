import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getAvailableSlots } from './slots.js';

const MONDAY = '2026-11-02';

function hours(overrides = {}) {
  return {
    monday: {
      open: '08:00',
      close: '18:00',
      breaks: [],
      ...overrides,
    },
  };
}

function slots(options) {
  return getAvailableSlots({
    date: MONDAY,
    durationMinutes: 60,
    openingHours: hours(),
    bookings: [],
    blocked: [],
    staffId: 'a',
    staffIds: ['a'],
    intervalMinutes: 30,
    ...options,
  });
}

function starts(options) {
  return slots(options).map((slot) => slot.start);
}

test('hides a start time whose duration overlaps an existing booking', () => {
  const available = starts({
    bookings: [
      { date: MONDAY, start: '09:00', durationMinutes: 120, staffId: 'a', status: 'confirmed' },
    ],
  });

  assert.equal(available.includes('10:00'), false);
  assert.equal(available.includes('09:30'), false);
  assert.equal(available.includes('11:00'), true);
  assert.equal(available.includes('08:00'), true);
});

test('treats back-to-back bookings as free at the exact end time', () => {
  const available = starts({
    bookings: [
      { date: MONDAY, start: '09:00', durationMinutes: 120, staffId: 'a', status: 'confirmed' },
    ],
  });
  assert.equal(available.includes('11:00'), true);
});

test('hides a slot that would run past closing', () => {
  const available = starts({ durationMinutes: 240 });
  assert.equal(available.includes('14:00'), true);
  assert.equal(available.includes('14:30'), false);
  assert.equal(available.includes('15:00'), false);
});

test('hides a long service that would cross a break or pass closing', () => {
  const available = starts({
    durationMinutes: 240,
    openingHours: hours({
      close: '18:30',
      breaks: [{ start: '13:00', end: '14:00' }],
    }),
  });

  assert.equal(available.includes('08:00'), true);
  assert.equal(available.includes('09:00'), true);
  assert.equal(available.includes('10:00'), false);
  assert.equal(available.includes('14:00'), true);
  assert.equal(available.includes('15:00'), false);
});

test('hides slots that fall inside blocked time', () => {
  const available = starts({
    blocked: [{ date: MONDAY, start: '10:00', end: '12:00', staffId: 'a' }],
  });

  assert.equal(available.includes('10:00'), false);
  assert.equal(available.includes('11:00'), false);
  assert.equal(available.includes('11:30'), false);
  assert.equal(available.includes('09:00'), true);
  assert.equal(available.includes('12:00'), true);
});

test('a block for one person still leaves other staff bookable', () => {
  const available = slots({
    staffId: null,
    staffIds: ['a', 'b'],
    blocked: [{ date: MONDAY, start: '10:00', end: '12:00', staffId: 'a' }],
  });
  const atTen = available.find((slot) => slot.start === '10:00');
  assert.ok(atTen);
  assert.equal(atTen.staffId, 'b');
});

test('a whole-shop block hides the slot for every staff member', () => {
  const available = starts({
    staffId: null,
    staffIds: ['a', 'b'],
    blocked: [{ date: MONDAY, start: '10:00', end: '12:00', staffId: null }],
  });
  assert.equal(available.includes('10:00'), false);
});

test('hides a slot that is already booked', () => {
  const available = starts({
    bookings: [
      { date: MONDAY, start: '09:00', durationMinutes: 60, staffId: 'a', status: 'confirmed' },
    ],
  });

  assert.equal(available.includes('09:00'), false);
  assert.equal(available.includes('10:00'), true);
});

test('a completed booking stays hidden and a no-show opens the slot again', () => {
  const completed = starts({
    bookings: [
      { date: MONDAY, start: '09:00', durationMinutes: 60, staffId: 'a', status: 'completed' },
    ],
  });
  const missed = starts({
    bookings: [
      { date: MONDAY, start: '09:00', durationMinutes: 60, staffId: 'a', status: 'no-show' },
    ],
  });

  assert.equal(completed.includes('09:00'), false);
  assert.equal(missed.includes('09:00'), true);
});

test('hides earlier today slots that have already started', () => {
  const available = starts({ nowMinutes: 9 * 60 + 15 });
  assert.equal(available.includes('09:00'), false);
  assert.equal(available.includes('09:30'), true);
});

test('returns nothing on a closed day', () => {
  assert.deepEqual(starts({ date: '2026-11-01' }), []);
});
