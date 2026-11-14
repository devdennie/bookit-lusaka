import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const landing = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('the landing page links to the three booking pages', () => {
  assert.match(landing, /href="book\.html\?config=salon"/);
  assert.match(landing, /href="book\.html\?config=barber"/);
  assert.match(landing, /href="book\.html\?config=clinic"/);
  assert.match(landing, /Chipo's Braids &amp; Beauty/);
  assert.match(landing, /Saka's Barbershop/);
  assert.match(landing, /Mtendere Physio Studio/);
});

test('the landing page does not collect a password', () => {
  assert.doesNotMatch(landing, /type="password"/i);
  assert.doesNotMatch(landing, /type="email"/i);
  assert.match(landing, /noindex/);
  assert.match(landing, /does not imply a partnership/);
  assert.match(landing, /Coming soon/);
});

test('vite builds the hub, the booking page and the owner view', () => {
  const book = readFileSync(new URL('../book.html', import.meta.url), 'utf8');
  const vite = readFileSync(new URL('../vite.config.js', import.meta.url), 'utf8');
  assert.match(book, /src="\.\/src\/main\.js"/);
  assert.match(book, /config\/' \+ id \+ '\.json'/);
  assert.match(vite, /index\.html/);
  assert.match(vite, /book\.html/);
  assert.match(vite, /owner\.html/);
});
