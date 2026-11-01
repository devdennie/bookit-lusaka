import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { weekdayName } from './dates.js';
import { createStateFromSeed } from './storage.js';

function readJson(path) {
  return JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
}

function servicesById(config) {
  const map = {};
  for (const category of config.categories) {
    for (const service of category.services) map[service.id] = service;
  }
  return map;
}

test('sample bookings never land on a closed Sunday and today has one no-show', () => {
  const salon = readJson('../public/config/salon.json');
  const seed = readJson('../public/data/seed.json').salon;
  const sunday = '2026-11-01';
  const state = createStateFromSeed(seed, servicesById(salon), sunday, salon.openingHours);

  assert.equal(state.bookings.some((item) => weekdayName(item.date) === 'sunday'), false);
  assert.equal(state.blocked.some((item) => weekdayName(item.date) === 'sunday'), false);

  const noShows = state.bookings.filter((item) => item.status === 'no-show');
  assert.equal(noShows.length, 1);
  assert.equal(noShows[0].date, '2026-11-02');
  assert.equal(state.bookings.filter((item) => item.date === '2026-11-02' && item.status === 'no-show').length, 1);
});

test('an open today keeps the single no-show on that day', () => {
  const salon = readJson('../public/config/salon.json');
  const seed = readJson('../public/data/seed.json').salon;
  const monday = '2026-11-02';
  const state = createStateFromSeed(seed, servicesById(salon), monday, salon.openingHours);
  const noShows = state.bookings.filter((item) => item.status === 'no-show');
  assert.equal(noShows.length, 1);
  assert.equal(noShows[0].date, monday);
  assert.equal(state.bookings.some((item) => weekdayName(item.date) === 'sunday'), false);
});
