import { heroMarkup, whatsappIcon } from './art.js';
import { pageHref, presetHref } from './config.js';
import {
  escapeHtml,
  formatCallNumber,
  formatDemoPhone,
  hasOpeningHours,
  hoursRows,
  whatsappUrl,
} from './format.js';

const PRESETS = [
  ['barber', 'Barber'],
  ['salon', 'Salon'],
  ['dinah', 'Nails and lashes'],
  ['tutoring', 'Tutoring'],
  ['steaming', 'Suit steaming'],
  ['printing', 'Print and copy'],
];

function digits(value) {
  return String(value ?? '').replace(/\D/g, '');
}

export function contactHtml(config) {
  const parts = [];
  const wa = formatDemoPhone(config.phone?.whatsappE164);
  if (wa) {
    parts.push(`WhatsApp <strong class="phone-display">${escapeHtml(wa)}</strong>`);
  }
  const call = config.phone?.call;
  if (digits(call)) {
    const shown = formatCallNumber(call);
    parts.push(`Call <a href="tel:${escapeHtml(digits(call))}"><strong class="phone-display">${escapeHtml(shown)}</strong></a>`);
  }
  return parts.join('<br>');
}

function placeLine(config) {
  return [config.area, config.city].filter(Boolean).join(', ');
}

function isWithheldCopy(text) {
  return /\bdemo\b|sample note/i.test(String(text || ''));
}

export function siteHeader(config, actionHtml) {
  const place = placeLine(config);
  return `
    <header class="site-header">
      <div class="wrap header-inner">
        <a class="brand" href="${pageHref('customer', config.id)}">
          <span class="mark" aria-hidden="true">${escapeHtml(config.initials || '•')}</span>
          <span class="brand-copy">
            <span class="brand-name">${escapeHtml(config.name)}</span>
            ${place ? `<span class="brand-area">${escapeHtml(place)}</span>` : ''}
          </span>
        </a>
        <nav class="header-actions" aria-label="Page">
          <a class="btn-text" href="${pageHref('home')}">PamoHub</a>
          ${actionHtml}
        </nav>
      </div>
    </header>`;
}

export function siteFooter(config, page) {
  const presets = PRESETS.map(([id, label]) => {
    const current = id === config.id ? ' aria-current="page"' : '';
    return `<a href="${presetHref(page, id)}"${current}>${label}</a>`;
  }).join('');
  const cross = page === 'owner'
    ? `<a href="${pageHref('customer', config.id)}">Booking page</a>`
    : `<a href="${pageHref('owner', config.id)}">Owner view</a>`;
  const contacts = contactHtml(config);
  const address = config.address ? `<p>${escapeHtml(config.address)}</p>` : '';
  return `
    <footer class="site-footer">
      <div class="wrap footer-grid">
        <div>
          <p class="footer-name">${escapeHtml(config.name)}</p>
          ${address}
          ${contacts ? `<p>${contacts}</p>` : ''}
        </div>
        <div>
          <p class="footer-label">Businesses</p>
          <nav class="preset-nav" aria-label="Businesses">${presets}</nav>
          <p class="footer-links"><a href="${pageHref('nipa')}">Services at NIPA</a> ${cross} <a href="${pageHref('home')}">PamoHub</a></p>
        </div>
      </div>
      <div class="wrap fine-print">
        <p>A booking is saved in this browser. Send it on WhatsApp when a number is listed.</p>
      </div>
    </footer>`;
}

export function whatsappFab(config) {
  const number = digits(config.phone?.whatsappE164);
  if (!number) return '';
  const href = whatsappUrl(number, `Hello ${config.name}, I have a question about booking.`);
  const label = `WhatsApp ${formatDemoPhone(number)}`;
  return `<a class="wa-fab" href="${href}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(label)}">${whatsappIcon}<span>WhatsApp</span></a>`;
}

export function landingHero(config, { status = '', art = '' } = {}) {
  const headline = escapeHtml(config.hero?.headline || '');
  const blurb = escapeHtml(config.hero?.blurb || '');
  const contacts = contactHtml(config);
  return `
    <section class="hero" aria-label="Today">
      <div class="wrap hero-grid">
        <div>
          <h2 class="hero-title">${headline}</h2>
          <p class="lede">${blurb}</p>
          ${contacts ? `<p class="contact-line">${contacts}</p>` : ''}
          <p class="status-pill">${escapeHtml(status)}</p>
          <div class="hero-actions">
            <a class="btn-ghost" href="#services">Browse services</a>
          </div>
        </div>
        <div class="hero-art">${art}</div>
      </div>
    </section>`;
}

export function landingMasthead(config) {
  const place = placeLine(config);
  const kicker = escapeHtml(config.tagline || config.name);
  const book = '<a class="book-today" href="#booking">Book</a>';
  return `
    <header class="masthead">
      <div class="masthead-banner">
        <a class="wordmark" href="${pageHref('home')}">PamoHub</a>
        <p class="masthead-kicker">${kicker}</p>
        ${book}
      </div>
      <h1 class="masthead-title">${escapeHtml(config.name)}</h1>
      ${place ? `<p class="masthead-place"><span>${escapeHtml(place)}</span></p>` : ''}
    </header>`;
}

export function meetStylist(config) {
  const noun = config.staffNoun || 'stylist';
  const lead = config.staff?.[0];
  const name = lead?.name || config.name;
  const role = (lead?.role || noun).toLowerCase();
  const place = placeLine(config);
  const where = place ? ` in ${escapeHtml(place)}` : '';
  const base = import.meta.env?.BASE_URL || '/';
  const bubble = escapeHtml(config.bubble || '');
  const studies = (config.gallery ?? []).slice(0, 2);
  const sentence = lead?.name
    ? `${escapeHtml(name)} is the ${escapeHtml(role)}${where}. Each visit is booked for the full sitting, so the time you choose is the time you keep.`
    : `${escapeHtml(config.name)} takes bookings for the full visit${where}. The time you choose is the time you keep.`;
  const leadFrame = `
    <figure class="frame frame-tall">
      <div class="frame-art" role="img" aria-label="${escapeHtml(config.collageAlt || '')}">${heroMarkup(config.illustration)}</div>
    </figure>`;
  const pictures = studies.map((image, index) => `
    <figure class="frame${index === 0 ? ' frame-tag' : ''}">
      <img src="${base}${image.src}" alt="${escapeHtml(image.alt || '')}" width="800" height="600" loading="lazy" decoding="async">
      ${index === 0 && bubble ? `<p class="bubble">${bubble}</p>` : ''}
    </figure>
  `).join('');
  return `
    <section class="meet" aria-labelledby="meet-title">
      <div class="collage">
        ${leadFrame}
        ${pictures}
      </div>
      <div class="meet-copy">
        <h2 id="meet-title">Meet your <span class="meet-accent">${escapeHtml(noun)}</span></h2>
        <p>${sentence}</p>
        <a class="book-today" href="#booking">Book</a>
      </div>
    </section>`;
}

function hourBands(openingHours) {
  const bands = [];
  for (const row of hoursRows(openingHours)) {
    const previous = bands[bands.length - 1];
    if (previous && previous.value === row.value) {
      previous.end = row.label;
    } else {
      bands.push({ start: row.label, end: row.label, value: row.value });
    }
  }
  return bands.map((band) => ({
    days: band.start === band.end ? band.start : `${band.start} – ${band.end}`,
    value: band.value,
  }));
}

export function landingInfo(config) {
  const knownHours = hasOpeningHours(config.openingHours);
  const hours = knownHours
    ? hourBands(config.openingHours).map((band) => `
    <tr>
      <th scope="row">${escapeHtml(band.days)}</th>
      <td>${escapeHtml(band.value)}</td>
    </tr>
  `).join('')
    : '';
  const place = placeLine(config);
  const contacts = contactHtml(config);
  const handles = (config.social ?? [])
    .filter((item) => item?.handle && !isWithheldCopy(item.handle))
    .map((item) => `
    <li><span>${escapeHtml(item.network)}</span> <strong>${escapeHtml(item.handle)}</strong></li>
  `).join('');
  const hoursBlock = knownHours
    ? `<table class="info-hours"><caption class="visually-hidden">Opening hours</caption><tbody>${hours}</tbody></table>`
    : '<p>Hours to be confirmed.</p>';
  const visitBits = [
    contacts ? `<p>${contacts}</p>` : '',
    config.address ? `<p>${escapeHtml(config.address)}</p>` : '',
    place && place !== config.address ? `<p>${escapeHtml(place)}</p>` : '',
  ].join('');
  const tagBox = handles
    ? `<article class="info-box tag-box"><h2>Find us</h2><div class="info-body"><ul class="handle-list">${handles}</ul></div></article>`
    : '';
  return `
    <section class="info-grid" aria-label="Hours and visit">
      <article class="info-box">
        <h2>Hours</h2>
        <div class="info-body">${hoursBlock}</div>
      </article>
      <article class="info-box">
        <h2>Visit</h2>
        <div class="info-body">${visitBits || '<p>Location to be confirmed.</p>'}</div>
      </article>
      ${tagBox}
    </section>`;
}

export function landingPolicies(config) {
  const items = (config.policies ?? [])
    .filter((policy) => !isWithheldCopy(policy.title) && !isWithheldCopy(policy.body))
    .map((policy) => `
    <article>
      <h3>${escapeHtml(policy.title)}</h3>
      <p>${escapeHtml(policy.body)}</p>
    </article>
  `).join('');
  if (!items) return '';
  return `
    <section class="policies" aria-labelledby="policies-title">
      <h2 id="policies-title">Booking policies</h2>
      <div class="policy-grid">${items}</div>
    </section>`;
}

export function loadErrorPage(message) {
  const home = import.meta.env.BASE_URL;
  return `
    <main id="main" class="wrap narrow">
      <h1>That page is not available</h1>
      <p>${escapeHtml(message)}</p>
      <p><a class="btn" href="${home}">Back to PamoHub</a></p>
    </main>`;
}
