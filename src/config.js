// WhatsApp numbers in config JSON (the demo uses 260970000000) are placeholders.
export const DEFAULT_CONFIG = 'salon';

export function requestedConfigId(search = window.location.search) {
  const requested = (new URLSearchParams(search).get('config') || DEFAULT_CONFIG).toLowerCase();
  return /^[a-z0-9-]+$/.test(requested) ? requested : DEFAULT_CONFIG;
}

export async function loadConfig(search = window.location.search) {
  const id = requestedConfigId(search);
  const response = await fetch(`${import.meta.env.BASE_URL}config/${id}.json`);
  if (!response.ok) {
    const error = new Error(`Could not load the "${id}" demo.`);
    error.code = 'config';
    throw error;
  }
  const config = await response.json();
  config.id = id;
  return config;
}

export async function loadSeed(id) {
  const response = await fetch(`${import.meta.env.BASE_URL}data/seed.json`);
  if (!response.ok) throw new Error('Could not load sample bookings.');
  const all = await response.json();
  return all[id] || { bookings: [], blocked: [] };
}

export function flattenServices(config) {
  const services = [];
  for (const category of config.categories ?? []) {
    for (const service of category.services ?? []) {
      services.push({
        ...service,
        categoryId: category.id,
        categoryName: category.name,
      });
    }
  }
  return services;
}

/** Publication colours and type live in CSS. Presets do not paint over them. */
const PUBLICATION_TOKENS = new Set([
  '--bg',
  '--bg-elev',
  '--ink',
  '--muted',
  '--accent',
  '--accent-hover',
  '--on-accent',
  '--accent-soft',
  '--line',
  '--rule',
  '--gold',
  '--ok',
  '--danger',
  '--focus',
  '--banner',
  '--banner-ink',
  '--shadow',
  '--font-display',
  '--font-body',
  '--serif',
  '--sans',
]);

export function applyTheme(config) {
  const root = document.documentElement;
  const theme = config.theme ?? {};
  for (const [key, value] of Object.entries(theme)) {
    if (key.startsWith('--') && typeof value === 'string' && !PUBLICATION_TOKENS.has(key)) {
      root.style.setProperty(key, value);
    }
  }
  root.style.colorScheme = 'light';
  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) themeColor.setAttribute('content', '#f4efe4');
  void config;
}

export function pageHref(page, configId = requestedConfigId()) {
  const file = page === 'owner' ? 'owner.html' : 'index.html';
  const query = configId && configId !== DEFAULT_CONFIG ? `?config=${encodeURIComponent(configId)}` : '';
  return `${import.meta.env.BASE_URL}${file}${query}`;
}

export function presetHref(page, configId) {
  const file = page === 'owner' ? 'owner.html' : 'index.html';
  if (!configId || configId === DEFAULT_CONFIG) return `${import.meta.env.BASE_URL}${file}`;
  return `${import.meta.env.BASE_URL}${file}?config=${encodeURIComponent(configId)}`;
}
