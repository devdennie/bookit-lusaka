import assert from 'node:assert/strict';
import { test } from 'node:test';
import { openDayFromOffset } from './dates.js';

const week = {
  monday: { open: '08:00', close: '18:00' },
  tuesday: { open: '08:00', close: '18:00' },
  wednesday: { open: '08:00', close: '18:00' },
  thursday: { open: '08:00', close: '18:00' },
  friday: { open: '08:00', close: '18:00' },
  saturday: { open: '08:00', close: '17:00' },
  sunday: null,
};

test('a closed Sunday moves offset 0 to the next open day', () => {
  assert.equal(openDayFromOffset('2026-11-01', 0, week), '2026-11-02');
  assert.equal(openDayFromOffset('2026-11-01', 1, week), '2026-11-03');
  assert.equal(openDayFromOffset('2026-11-01', -1, week), '2026-10-31');
});

test('offset 0 stays on an open day', () => {
  assert.equal(openDayFromOffset('2026-11-02', 0, week), '2026-11-02');
  assert.equal(openDayFromOffset('2026-11-02', -1, week), '2026-10-31');
});
