import { whatsappIcon } from './art.js';
import { pageHref, presetHref } from './config.js';
import { escapeHtml, whatsappUrl } from './format.js';

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
            <span class="brand-area">${escapeHtml(config.area)}, Lusaka</span>
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
          <p>WhatsApp <strong class="phone-display">${escapeHtml(config.phone?.display || '')}</strong> (placeholder number)</p>
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
  const label = `WhatsApp ${config.phone?.display || ''}, placeholder number`;
  return `<a class="wa-fab" href="${href}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(label)}">${whatsappIcon}<span>WhatsApp</span></a>`;
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
