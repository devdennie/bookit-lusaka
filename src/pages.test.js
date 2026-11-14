import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

function page(name) {
  return readFileSync(new URL(`../${name}`, import.meta.url), 'utf8');
}

test('the landing page links to the campus page and does not list providers', () => {
  const html = page('index.html');
  assert.match(html, /href="campuses\.html"/);
  assert.match(html, /Choose your campus/);
  assert.match(html, /Explore services/);
  assert.doesNotMatch(html, /book\.html\?config=/);
  assert.doesNotMatch(html, /Extol|Dinah|Chipo|Mtendere/);
});

test('the campus page links to the NIPA services page', () => {
  const html = page('campuses.html');
  assert.match(html, /href="nipa\.html"/);
  assert.match(html, /aria-label="ZCAS, coming soon"/);
  assert.match(html, /aria-label="Evelyn Hone College, coming soon"/);
  assert.match(html, /aria-label="UNZA \(University of Zambia\), coming soon"/);
  assert.match(html, /aria-label="Cavendish University Zambia, coming soon"/);
  assert.match(html, /aria-label="Copperbelt University, coming soon"/);
  assert.match(html, /does not imply a partnership/);
  assert.match(html, /<button[^>]*aria-label="ZCAS, coming soon"/);
  assert.doesNotMatch(html, /href="[^"]*zcas/i);
});

test('the NIPA services page links to all seven booking pages', () => {
  const html = page('nipa.html');
  for (const href of [
    'book.html?config=barber',
    'book.html?config=salon',
    'book.html?config=dinah#cat-nails',
    'book.html?config=dinah#cat-lashes',
    'book.html?config=tutoring',
    'book.html?config=steaming',
    'book.html?config=printing',
  ]) {
    assert.ok(html.includes(`href="${href}"`), href);
  }
  assert.match(html, /Extol the International Barber/);
  assert.match(html, /Dinah's Nail Art &amp; Lashes/);
  assert.doesNotMatch(html, /Mtendere|clinic/);
});
