import { demoBanner, loadErrorPage, siteFooter, siteHeader } from './chrome.js';
import { applyTheme, flattenServices, loadConfig, loadSeed, pageHref } from './config.js';
import { addDays, openDayFromOffset, todayISO, weekdayName } from './dates.js';
import {
  endTime,
  escapeHtml,
  formatDateLong,
  formatDuration,
  formatTimeRange,
  hoursLabel,
  priceHtml,
  staffName,
} from './format.js';
import { toMinutes } from './slots.js';
import { loadState, resetState, saveState, storageKey } from './storage.js';

const TIME_ZONE = 'Africa/Lusaka';
const app = document.querySelector('#app');

function statusLabel(status) {
  if (status === 'no-show') return 'No-show';
  if (status === 'completed') return 'Completed';
  return 'Confirmed';
}

function badgeClass(status) {
  if (status === 'no-show') return 'badge badge-no-show';
  if (status === 'completed') return 'badge badge-completed';
  return 'badge';
}

function uid(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

async function boot() {
  let config;
  try {
    config = await loadConfig();
  } catch (error) {
    app.innerHTML = loadErrorPage(error.message);
    app.removeAttribute('aria-busy');
    return;
  }

  applyTheme(config);
  document.title = `${config.name} · Owner`;
  const services = flattenServices(config);
  const servicesById = Object.fromEntries(services.map((service) => [service.id, service]));
  const today = todayISO(TIME_ZONE);
  let seed = { bookings: [], blocked: [] };
  try {
    seed = await loadSeed(config.id);
  } catch {
    seed = { bookings: [], blocked: [] };
  }
  document.body.classList.add('owner-page');
  let state = loadState(config.id, seed, servicesById, today, config.openingHours);
  let selectedDate = openDayFromOffset(today, 0, config.openingHours);
  let blockError = '';
  let announced = '';

  const staffOptions = (config.staff ?? []).map((person) => `
    <option value="${escapeHtml(person.id)}">${escapeHtml(person.name)}</option>
  `).join('');

  function scheduleHtml() {
    const dayBookings = state.bookings
      .filter((booking) => booking.date === selectedDate)
      .slice()
      .sort((a, b) => a.start.localeCompare(b.start));
    const dayBlocks = state.blocked
      .filter((block) => block.date === selectedDate)
      .slice()
      .sort((a, b) => a.start.localeCompare(b.start));
    const dayNoShows = dayBookings.filter((booking) => booking.status === 'no-show').length;
    const allNoShows = state.bookings.filter((booking) => booking.status === 'no-show').length;
    const dayHours = config.openingHours?.[weekdayName(selectedDate)];
    const hoursText = dayHours ? hoursLabel(dayHours) : 'Closed';
    const closedText = dayHours
      ? ''
      : 'Closed this day. You can still look at saved visits or block time.';

    const bookings = dayBookings.length
      ? dayBookings.map((booking) => `
          <article class="booking" data-id="${escapeHtml(booking.id)}">
            <div class="booking-top">
              <p class="when">${escapeHtml(formatTimeRange(booking.start, endTime(booking.start, booking.durationMinutes)))}</p>
              <p class="${badgeClass(booking.status)}">${statusLabel(booking.status)}</p>
            </div>
            <h3>${escapeHtml(booking.serviceName)}</h3>
            <p>${escapeHtml(booking.customerName)} · ${escapeHtml(booking.customerPhone)}</p>
            <p class="muted">${escapeHtml(staffName(config.staff, booking.staffId))} · ${escapeHtml(formatDuration(booking.durationMinutes))} · ${priceHtml(booking.priceZmw)}</p>
            <p class="muted">${booking.depositDemo ? 'Deposit option tapped in the demo · not paid' : 'No deposit · demo only, not paid'}</p>
            <div class="row-actions">
              <button type="button" class="btn-ghost" data-status="completed" aria-pressed="${booking.status === 'completed'}">Mark completed</button>
              <button type="button" class="btn-ghost" data-status="no-show" aria-pressed="${booking.status === 'no-show'}">Mark no-show</button>
            </div>
          </article>
        `).join('')
      : '<p class="empty">No bookings for this day. A booking made on the customer page of this device shows up here.</p>';

    const blocks = dayBlocks.length
      ? dayBlocks.map((block) => `
          <article class="block-card">
            <h3>${escapeHtml(formatTimeRange(block.start, block.end))}</h3>
            <p>${escapeHtml(staffName(config.staff, block.staffId))} · ${escapeHtml(block.reason || 'Blocked')}</p>
            <button type="button" class="btn-ghost" data-unblock="${escapeHtml(block.id)}">Remove block</button>
          </article>
        `).join('')
      : '<p class="empty">Nothing blocked on this day.</p>';

    return `
      <div class="date-switch">
        <button type="button" class="btn-ghost" id="prev-day">Prev day</button>
        <div>
          <h2 id="day-heading" tabindex="-1">${escapeHtml(formatDateLong(selectedDate))}</h2>
          <p class="muted">${escapeHtml(hoursText)}</p>
        </div>
        <button type="button" class="btn-ghost" id="next-day">Next day</button>
      </div>
      <button type="button" class="btn-text today-link" id="jump-today" ${selectedDate === today ? 'disabled' : ''}>Back to today</button>
      <p class="closed-note"${dayHours ? ' aria-hidden="true"' : ''}>${escapeHtml(closedText)}</p>
      <ul class="stats">
        <li class="stat"><strong>${dayBookings.length}</strong><span>Bookings this day</span></li>
        <li class="stat"><strong>${dayNoShows}</strong><span>No-shows this day</span></li>
        <li class="stat"><strong>${allNoShows}</strong><span>No-shows in this demo</span></li>
      </ul>
      <h2>Bookings</h2>
      <div class="card-list">${bookings}</div>
      <h2>Blocked time</h2>
      <div class="card-list">${blocks}</div>
      <form id="block-form" class="panel">
        <fieldset>
          <legend>Block off time</legend>
          <p>On ${escapeHtml(formatDateLong(selectedDate))}. Blocked time is hidden from new bookings on this device.</p>
          <div class="field">
            <label for="block-staff">Who</label>
            <select id="block-staff" name="staff">
              <option value="">Whole shop</option>
              ${staffOptions}
            </select>
          </div>
          <div class="time-row">
            <div class="field">
              <label for="block-start">Start</label>
              <input id="block-start" name="start" type="time" step="1800" required value="15:00">
            </div>
            <div class="field">
              <label for="block-end">End</label>
              <input id="block-end" name="end" type="time" step="1800" required value="16:00">
            </div>
          </div>
          <div class="field">
            <label for="block-reason">Reason</label>
            <input id="block-reason" name="reason" type="text" maxlength="80" placeholder="Stock delivery">
          </div>
          <p class="form-error" role="alert" ${blockError ? '' : 'hidden'}>${escapeHtml(blockError)}</p>
          <button class="btn" type="submit">Block this time</button>
        </fieldset>
      </form>
      <section class="reset-box">
        <h2>Reset the sample day</h2>
        <p>This clears bookings and blocks made in this browser and restores the sample data.</p>
        <button type="button" class="btn-ghost" id="reset-demo">Reset demo data</button>
        <div id="reset-confirm" hidden>
          <p>Replace everything saved on this device with the sample bookings?</p>
          <div class="row-actions">
            <button type="button" class="btn" id="reset-yes">Reset now</button>
            <button type="button" class="btn-ghost" id="reset-no">Cancel</button>
          </div>
        </div>
      </section>
    `;
  }

  function paint(focusSelector) {
    document.querySelector('#schedule').innerHTML = scheduleHtml();
    const live = document.querySelector('#day-live');
    const message = `Showing ${formatDateLong(selectedDate)}`;
    if (live && announced !== message) {
      live.textContent = message;
      announced = message;
    }
    if (focusSelector) document.querySelector(focusSelector)?.focus();
  }

  app.innerHTML = `
    <div class="top-stack">
      ${demoBanner(config.name)}
      ${siteHeader(config, `<a class="btn" href="${pageHref('customer', config.id)}">Customer page</a>`)}
    </div>
    <main id="main">
      <div class="wrap">
        <h1 class="owner-title">${escapeHtml(config.name)}</h1>
        <p class="login-note" role="note"><strong>Demo: no login</strong></p>
        <p class="owner-note" role="note"><strong>Demo owner view, no login in this demo.</strong> Anyone with this link can change the sample schedule. It is saved only in this browser.</p>
        <p id="day-live" class="visually-hidden" aria-live="polite"></p>
        <div id="schedule"></div>
      </div>
    </main>
    ${siteFooter(config, 'owner')}
  `;
  paint();
  app.removeAttribute('aria-busy');

  app.addEventListener('click', (event) => {
    if (event.target.closest('#prev-day')) {
      selectedDate = addDays(selectedDate, -1);
      blockError = '';
      paint('#prev-day');
      return;
    }
    if (event.target.closest('#next-day')) {
      selectedDate = addDays(selectedDate, 1);
      blockError = '';
      paint('#next-day');
      return;
    }
    if (event.target.closest('#jump-today')) {
      selectedDate = today;
      blockError = '';
      paint('#day-heading');
      return;
    }
    const statusBtn = event.target.closest('[data-status]');
    if (statusBtn) {
      const card = statusBtn.closest('[data-id]');
      const booking = state.bookings.find((item) => item.id === card?.dataset.id);
      if (!booking) return;
      booking.status = statusBtn.dataset.status;
      saveState(config.id, state);
      paint(`[data-id="${CSS.escape(booking.id)}"] [data-status="${statusBtn.dataset.status}"]`);
      return;
    }
    const unblock = event.target.closest('[data-unblock]');
    if (unblock) {
      state.blocked = state.blocked.filter((block) => block.id !== unblock.dataset.unblock);
      saveState(config.id, state);
      paint();
      return;
    }
    if (event.target.closest('#reset-demo')) {
      const box = document.querySelector('#reset-confirm');
      if (box) box.hidden = false;
      document.querySelector('#reset-yes')?.focus();
      return;
    }
    if (event.target.closest('#reset-no')) {
      const box = document.querySelector('#reset-confirm');
      if (box) box.hidden = true;
      document.querySelector('#reset-demo')?.focus();
      return;
    }
    if (event.target.closest('#reset-yes')) {
      state = resetState(config.id, seed, servicesById, today, config.openingHours);
      selectedDate = openDayFromOffset(today, 0, config.openingHours);
      blockError = '';
      paint('#reset-demo');
    }
  });

  app.addEventListener('submit', (event) => {
    if (event.target.id !== 'block-form') return;
    event.preventDefault();
    const data = new FormData(event.target);
    const start = String(data.get('start') || '');
    const end = String(data.get('end') || '');
    const startMin = toMinutes(start);
    const endMin = toMinutes(end);
    if (startMin == null || endMin == null || endMin <= startMin) {
      blockError = 'Choose an end time that is later than the start.';
      paint('#block-end');
      return;
    }
    const reason = String(data.get('reason') || '').trim().slice(0, 80) || 'Blocked';
    state.blocked = [
      ...state.blocked,
      {
        id: uid('blk'),
        date: selectedDate,
        start: start.slice(0, 5),
        end: end.slice(0, 5),
        staffId: String(data.get('staff') || '') || null,
        reason,
      },
    ];
    saveState(config.id, state);
    blockError = '';
    paint();
  });

  window.addEventListener('storage', (event) => {
    if (event.key !== storageKey(config.id) || !event.newValue) return;
    try {
      const parsed = JSON.parse(event.newValue);
      if (parsed?.seedVersion === 2) {
        state = parsed;
        paint();
      }
    } catch {
      /* Ignore unreadable storage from another tab. */
    }
  });
}

boot();
