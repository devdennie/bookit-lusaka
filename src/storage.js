import { addDays } from './dates.js';

const PREFIX = 'bookit-lusaka:v1:';

export function storageKey(configId) {
  return `${PREFIX}${configId}`;
}

export function createStateFromSeed(seed, servicesById, today) {
  const bookings = [];
  (seed?.bookings ?? []).forEach((item, index) => {
    const service = servicesById[item.serviceId];
    if (!service || !item.start) return;
    bookings.push({
      id: `seed-b-${index}`,
      date: addDays(today, Number(item.dayOffset) || 0),
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
    date: addDays(today, Number(item.dayOffset) || 0),
    start: item.start,
    end: item.end,
    staffId: item.staffId || null,
    reason: item.reason || 'Blocked',
  }));

  return { seedVersion: 1, bookings, blocked };
}

export function loadState(configId, seed, servicesById, today) {
  const fresh = () => createStateFromSeed(seed, servicesById, today);
  try {
    const raw = localStorage.getItem(storageKey(configId));
    if (!raw) {
      const created = fresh();
      localStorage.setItem(storageKey(configId), JSON.stringify(created));
      return created;
    }
    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      parsed.seedVersion !== 1 ||
      !Array.isArray(parsed.bookings) ||
      !Array.isArray(parsed.blocked)
    ) {
      const created = fresh();
      localStorage.setItem(storageKey(configId), JSON.stringify(created));
      return created;
    }
    return parsed;
  } catch {
    return fresh();
  }
}

export function saveState(configId, state) {
  try {
    localStorage.setItem(storageKey(configId), JSON.stringify(state));
  } catch {
    /* Private mode can refuse storage. The open tab still keeps the demo. */
  }
}

export function resetState(configId, seed, servicesById, today) {
  const state = createStateFromSeed(seed, servicesById, today);
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
