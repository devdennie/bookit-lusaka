import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { landingHero, meetStylist } from './chrome.js';

const css = readFileSync(new URL('./styles.css', import.meta.url), 'utf8');

function preset(id) {
  return JSON.parse(readFileSync(new URL(`../public/config/${id}.json`, import.meta.url), 'utf8'));
}

function ruleBlock(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = [...css.matchAll(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, 'g'))].map((match) => match[1]);
  assert.ok(parts.length > 0, `${selector} has a style rule`);
  return parts.join('\n');
}

test('the hero headline and blurb are rendered and not hidden', () => {
  const expected = {
    salon: 'The whole sitting, not a squeeze.',
    barber: 'Haircuts, lining and dyeing.',
    dinah: 'The full set, with time to finish.',
    tutoring: 'A full session, start to finish.',
    steaming: 'A pressed suit, ready to wear.',
    printing: 'Print, copy and bind.',
  };
  for (const [id, headline] of Object.entries(expected)) {
    const config = preset(id);
    const html = landingHero(config, { status: 'Open today · 08:00 – 19:00', art: '<svg></svg>' });
    const title = html.match(/<h2 class="hero-title"[^>]*>([\s\S]*?)<\/h2>/);
    const blurb = html.match(/<p class="lede">([\s\S]*?)<\/p>/);
    assert.ok(title, `${id} hero headline element`);
    assert.equal(title[1], headline);
    assert.doesNotMatch(title[0], /visually-hidden|aria-hidden|\bhidden\b/);
    assert.ok(blurb && blurb[1].trim().length > 0, `${id} hero blurb`);
    assert.doesNotMatch(blurb[0], /visually-hidden|aria-hidden|\bhidden\b/);
  }

  const bubbles = {
    salon: 'The whole sitting, not a squeeze.',
    barber: 'The full chair, booked properly.',
    dinah: 'Come with your inspo pictures.',
    tutoring: 'Time to work through it.',
    steaming: 'Ready for the appointment.',
    printing: 'Ready for collection.',
  };
  for (const [id, line] of Object.entries(bubbles)) {
    const html = meetStylist(preset(id));
    assert.match(html, new RegExp(`<p class="bubble">${line.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</p>`));
    assert.match(html, new RegExp(`aria-label="${preset(id).collageAlt}"`));
    assert.match(html, /class="frame-art"/);
  }
  for (const id of ['barber', 'dinah', 'tutoring', 'steaming', 'printing']) {
    assert.doesNotMatch(meetStylist(preset(id)), /The whole sitting, not a squeeze\./);
  }

  for (const selector of ['.hero-title', '.lede']) {
    const block = ruleBlock(selector);
    assert.match(block, /color:\s*var\(--(?:ink|muted)\)/);
    assert.doesNotMatch(block, /opacity:\s*0|color:\s*(?:transparent|var\(--bg\))|visibility:\s*hidden|font-size:\s*0|display:\s*none/);
  }
});
