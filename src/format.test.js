import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatCallNumber, formatDemoPhone, formatTime, formatTimeRange, priceHtml } from './format.js';

test('times stay in 24-hour HH:MM', () => {
  assert.equal(formatTime('08:00'), '08:00');
  assert.equal(formatTime('13:30'), '13:30');
  assert.equal(formatTimeRange('08:00', '12:00'), '08:00 – 12:00');
});

test('WhatsApp numbers are shown as +260 XXX XXX XXX', () => {
  assert.equal(formatDemoPhone('260771606619'), '+260 771 606 619');
  assert.equal(formatDemoPhone('260967447059'), '+260 967 447 059');
  assert.equal(formatDemoPhone('260970000000'), '+260 970 000 000');
});

test('a local call number is grouped and not rewritten to +260', () => {
  assert.equal(formatCallNumber('0573954949'), '057 395 4949');
});

test('a missing price is labelled Price on request', () => {
  assert.match(priceHtml(null), /Price on request/);
  assert.match(priceHtml(50), /ZMW 50/);
  assert.doesNotMatch(priceHtml(50), /example/);
  assert.doesNotMatch(priceHtml(null), /example/);
});
