import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatDemoPhone, formatTime, formatTimeRange } from './format.js';

test('times stay in 24-hour HH:MM', () => {
  assert.equal(formatTime('08:00'), '08:00');
  assert.equal(formatTime('13:30'), '13:30');
  assert.equal(formatTimeRange('08:00', '12:00'), '08:00 – 12:00');
});

test('the demo WhatsApp number formats the same digits shown in the link', () => {
  assert.equal(formatDemoPhone('260970000000'), '+260 97 000 0000');
});
