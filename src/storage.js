import { openDayFromOffset } from './dates.js';

const PREFIX = 'bookit-lusaka:v1:';
const SEED_VERSION = 2;

export function storageKey(configId) {
  return `${PREFIX}${configId}`;
}

function seedDate(today, dayOffset, openingHours) {
  return openDayFromOffset(today, Number(dayOffset) || 0, openingHours);
}

export function createStateFromSeed(seed, servicesById, today, openingHours = {}) {
  const bookings = [];
  (seed?.bookings ?? []).forEach((item, index) => {
    const service = servicesById[item.serviceId];
    if (!service || !item.start) return;
    bookings.push({
      id: `seed-b-${index}`,
      date: seedDate(today, item.dayOffset, openingHours),
      start: item.start,
      durationMinutes: service.durationMinutes,
      priceZmw: service.priceZmw,
      serviceId: service.id,
      serviceName: service.name,
      staffId: item.staffId || null,
      customerName: item.customerName,
      customerPhone: item.customerPhone,
      status: item.status || 'confirmed',
      depositDemo: null,
    });
  });

  const blocked = (seed?.blocked ?? []).map((item, index) => ({
    id: `seed-k-${index}`,
    date: seedDate(today, item.dayOffset, openingHours),
    start: item.start,
    end: item.end,
    staffId: item.staffId || null,
    reason: item.reason || 'Blocked',
  }));

  return { seedVersion: SEED_VERSION, seedDay: today, bookings, blocked };
}

function isSeedId(id) {
  return String(id || '').startsWith('seed-');
}

function withKeptChanges(created, previous) {
  if (!previous) return created;
  return {
    ...created,
    bookings: [
      ...created.bookings,
      ...(previous.bookings ?? []).filter((item) => !isSeedId(item.id)),
    ],
    blocked: [
      ...created.blocked,
      ...(previous.blocked ?? []).filter((item) => !isSeedId(item.id)),
    ],
  };
}

export function loadState(configId, seed, servicesById, today, openingHours = {}) {
  const fresh = (previous) => withKeptChanges(
    createStateFromSeed(seed, servicesById, today, openingHours),
    previous,
  );
  try {
    const raw = localStorage.getItem(storageKey(configId));
    if (!raw) {
      const created = fresh(null);
      localStorage.setItem(storageKey(configId), JSON.stringify(created));
      return created;
    }
    const parsed = JSON.parse(raw);
    const usable = parsed && Array.isArray(parsed.bookings) && Array.isArray(parsed.blocked);
    if (!usable || parsed.seedVersion !== SEED_VERSION || parsed.seedDay !== today) {
      const created = fresh(usable ? parsed : null);
      localStorage.setItem(storageKey(configId), JSON.stringify(created));
      return created;
    }
    return parsed;
  } catch {
    return fresh(null);
  }
}

export function saveState(configId, state) {
  try {
    localStorage.setItem(storageKey(configId), JSON.stringify(state));
  } catch {
    /* Private mode can refuse storage. The open tab still keeps the demo. */
  }
}

export function resetState(configId, seed, servicesById, today, openingHours = {}) {
  const state = createStateFromSeed(seed, servicesById, today, openingHours);
  saveState(configId, state);
  return state;
}

export function readStoredState(configId) {
  try {
    const raw = localStorage.getItem(storageKey(configId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
