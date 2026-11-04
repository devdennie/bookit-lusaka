import { whatsappIcon } from './art.js';
import { pageHref, presetHref } from './config.js';
import { escapeHtml, formatDemoPhone, hoursRows, whatsappUrl } from './format.js';

const PRESETS = [
  ['salon', 'Salon'],
  ['clinic', 'Clinic'],
  ['barber', 'Barber'],
];

export function demoBanner(name) {
  const label = escapeHtml(name);
  return `<p class="demo-banner" role="note">Demo only. ${label} is a fictional business. Prices and bookings on this page are examples, not a live shop.</p>`;
}

export function siteHeader(config, actionHtml) {
  return `
    <header class="site-header">
      <div class="wrap header-inner">
        <a class="brand" href="${pageHref('customer', config.id)}">
          <span class="mark" aria-hidden="true">${escapeHtml(config.initials || '•')}</span>
          <span class="brand-copy">
            <span class="brand-name">${escapeHtml(config.name)}</span>
            <span class="brand-area">${escapeHtml([config.area, config.city].filter(Boolean).join(', '))}</span>
          </span>
        </a>
        ${actionHtml}
      </div>
    </header>`;
}

export function siteFooter(config, page) {
  const presets = PRESETS.map(([id, label]) => {
    const current = id === config.id ? ' aria-current="page"' : '';
    return `<a href="${presetHref(page, id)}"${current}>${label}</a>`;
  }).join('');
  const cross = page === 'owner'
    ? `<a href="${pageHref('customer', config.id)}">Customer page</a>`
    : `<a href="${pageHref('owner', config.id)}">Owner demo</a>`;
  return `
    <footer class="site-footer">
      <div class="wrap footer-grid">
        <div>
          <p class="footer-name">${escapeHtml(config.name)}</p>
          <p>${escapeHtml(config.address || '')}</p>
          <p>WhatsApp <strong class="phone-display">${escapeHtml(formatDemoPhone(config.phone?.whatsappE164))}</strong> <span class="demo-number">demo number</span></p>
        </div>
        <div>
          <p class="footer-label">Demo presets</p>
          <nav class="preset-nav" aria-label="Demo business presets">${presets}</nav>
          <p class="footer-links">${cross}</p>
        </div>
      </div>
      <div class="wrap fine-print">
        <p>Fictional demo. No real bookings, payments or customer records leave this browser.</p>
      </div>
    </footer>`;
}

export function whatsappFab(config) {
  const href = whatsappUrl(
    config.phone?.whatsappE164,
    `Hello ${config.name}, I have a question about booking.`,
  );
  const label = `WhatsApp ${formatDemoPhone(config.phone?.whatsappE164)}, demo number`;
  return `<a class="wa-fab" href="${href}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(label)}">${whatsappIcon}<span>WhatsApp</span><span class="demo-number">demo number</span></a>`;
}

export function landingMasthead(config) {
  const place = escapeHtml([config.area, config.city].filter(Boolean).join(', '));
  const kicker = escapeHtml(config.tagline || config.name);
  const book = '<a class="book-today" href="#booking">Book today</a>';
  return `
    <header class="masthead">
      <div class="masthead-banner">
        ${book}
        <p class="masthead-kicker">${kicker}</p>
        ${book}
      </div>
      <h1 class="masthead-title">${escapeHtml(config.name)}</h1>
      <p class="masthead-place">
        <svg class="pin" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/>
        </svg>
        <span>${place}</span>
      </p>
    </header>`;
}

export function meetStylist(config) {
  const noun = config.staffNoun || 'stylist';
  const lead = config.staff?.[0];
  const name = lead?.name || config.name;
  const role = lead?.role || noun;
  const place = [config.area, config.city].filter(Boolean).join(', ');
  const base = import.meta.env.BASE_URL;
  const frames = (config.gallery ?? []).slice(0, 3);
  const pictures = frames.map((image, index) => `
    <figure class="frame${index === 0 ? ' frame-tall' : ''}${index === 1 ? ' frame-tag' : ''}">
      <img src="${base}${image.src}" alt="${escapeHtml(image.alt || '')}" width="800" height="600" loading="lazy" decoding="async">
      ${index === 1 ? '<p class="bubble">The whole sitting, not a squeeze.</p>' : ''}
    </figure>
  `).join('');
  return `
    <section class="meet" aria-labelledby="meet-title">
      <div class="collage">
        ${pictures}
      </div>
      <div class="meet-copy">
        <h2 id="meet-title">Meet your <span class="meet-accent">${escapeHtml(noun)}</span></h2>
        <p>${escapeHtml(name)} is the ${escapeHtml(role.toLowerCase())} in ${escapeHtml(place)}. Each visit is booked for the full sitting, so the time you choose is the time you keep.</p>
        <a class="book-today" href="#booking">Book today</a>
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
  const hours = hourBands(config.openingHours).map((band) => `
    <tr>
      <th scope="row">${escapeHtml(band.days)}</th>
      <td>${escapeHtml(band.value)}</td>
    </tr>
  `).join('');
  const place = [config.area, config.city].filter(Boolean).join(', ');
  const handles = (config.social ?? []).map((item) => `
    <li><span>${escapeHtml(item.network)}</span> <strong>${escapeHtml(item.handle)}</strong></li>
  `).join('');
  return `
    <section class="info-grid" aria-label="Hours, visit and social">
      <article class="info-box">
        <h2>Hours</h2>
        <div class="info-body">
          <table class="info-hours">
            <caption class="visually-hidden">Opening hours</caption>
            <tbody>${hours}</tbody>
          </table>
        </div>
      </article>
      <article class="info-box">
        <h2>Visit</h2>
        <div class="info-body">
          <p class="info-label">WhatsApp</p>
          <p><strong class="phone-display">${escapeHtml(formatDemoPhone(config.phone?.whatsappE164))}</strong> <span class="demo-number">demo number</span></p>
          <p class="info-label">Location</p>
          <p>${escapeHtml(config.address || '')}</p>
          <p>${escapeHtml(place)}</p>
        </div>
      </article>
      <article class="info-box tag-box">
        <h2>Tag us</h2>
        <div class="info-body">
          <p>Share a visit and mention these accounts. They are placeholders, not live profiles.</p>
          <ul class="handle-list">${handles}</ul>
        </div>
      </article>
    </section>`;
}

export function landingPolicies(config) {
  const items = (config.policies ?? []).map((policy) => `
    <article>
      <h3>${escapeHtml(policy.title)}</h3>
      <p>${escapeHtml(policy.body)}</p>
    </article>
  `).join('');
  if (!items) return '';
  return `
    <section class="policies" aria-labelledby="policies-title">
      <h2 id="policies-title">Booking policies <span class="example-tag">sample</span></h2>
      <p class="help">Sample wording only. Change the policies list in this business config.</p>
      <div class="policy-grid">${items}</div>
    </section>`;
}

export function loadErrorPage(message) {
  const home = import.meta.env.BASE_URL;
  return `
    ${demoBanner('This booking page')}
    <main id="main" class="wrap narrow">
      <h1>That demo is not available</h1>
      <p>${escapeHtml(message)}</p>
      <p><a class="btn" href="${home}">Back to the salon demo</a></p>
    </main>`;
}
