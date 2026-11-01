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

export function applyTheme(config) {
  const root = document.documentElement;
  const theme = config.theme ?? {};
  for (const [key, value] of Object.entries(theme)) {
    if (key.startsWith('--') && typeof value === 'string') {
      root.style.setProperty(key, value);
    }
  }
  const scheme = config.colorScheme === 'dark' ? 'dark' : 'light';
  root.style.colorScheme = scheme;
  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor && theme['--bg']) themeColor.setAttribute('content', theme['--bg']);
  try {
    sessionStorage.setItem(
      `bookit-theme:${config.id}`,
      JSON.stringify({ vars: theme, colorScheme: scheme }),
    );
  } catch {
    /* Ignore quota or private-mode errors. */
  }
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
