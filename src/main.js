import { heroMarkup } from './art.js';
import { demoBanner, loadErrorPage, siteFooter, siteHeader, whatsappFab } from './chrome.js';
import {
  applyTheme,
  flattenServices,
  loadConfig,
  loadSeed,
  requestedConfigId,
} from './config.js';
import { addDays, eachDate, todayISO, weekdayName } from './dates.js';
import {
  bookingMessage,
  endTime,
  escapeHtml,
  formatDateLong,
  formatDayParts,
  formatDuration,
  formatPrice,
  formatTime,
  formatTimeRange,
  hoursRows,
  priceHtml,
  staffName,
  whatsappUrl,
} from './format.js';
import { getAvailableSlots } from './slots.js';
import { loadState, readStoredState, saveState } from './storage.js';

const TIME_ZONE = 'Africa/Lusaka';
const DAY_COUNT = 14;

const app = document.querySelector('#app');

function capitalNoun(config) {
  const word = config.staffNoun || 'stylist';
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function safeSwatch(value) {
  return /^#[0-9a-fA-F]{3,8}$/.test(value || '') ? value : 'var(--accent)';
}

function imageSrc(src) {
  if (!/^images\/[a-z0-9.-]+\.svg$/.test(src || '')) return '';
  return `${import.meta.env.BASE_URL}${src}`;
}

function uid(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function demoRef() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let value = 'DEMO-';
  for (let index = 0; index < 4; index += 1) {
    value += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return value;
}

function freshFlow(serviceId) {
  return {
    step: serviceId ? 'staff' : 'service',
    serviceId: serviceId || null,
    staffChoice: 'any',
    date: null,
    slot: null,
    slots: [],
    name: '',
    phone: '',
    depositProvider: null,
    depositRef: '',
    depositStage: 'choose',
    error: '',
    saved: null,
  };
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
  document.title = `${config.name} · Book`;
  document.querySelector('meta[name="description"]')?.setAttribute(
    'content',
    `Demo booking page for the fictional ${config.name} in ${config.area}, Lusaka. Example prices only.`,
  );
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', config.name);

  const services = flattenServices(config);
  const servicesById = Object.fromEntries(services.map((service) => [service.id, service]));
  const today = todayISO(TIME_ZONE);
  let seed = { bookings: [], blocked: [] };
  try {
    seed = await loadSeed(config.id);
  } catch {
    seed = { bookings: [], blocked: [] };
  }
  let state = loadState(config.id, seed, servicesById, today);
  let flow = freshFlow(null);

  const noun = capitalNoun(config);

  function eligibleStaff(service) {
    const people = config.staff ?? [];
    if (!service?.staffIds?.length) return people;
    return people.filter((person) => service.staffIds.includes(person.id));
  }

  function providerName(id) {
    return config.deposit?.providers?.find((item) => item.id === id)?.name || 'Selected option';
  }

  function computeSlots(date, service, staffChoice) {
    const people = eligibleStaff(service);
    return getAvailableSlots({
      date,
      durationMinutes: service.durationMinutes,
      openingHours: config.openingHours,
      bookings: state.bookings,
      blocked: state.blocked,
      staffId: staffChoice && staffChoice !== 'any' ? staffChoice : null,
      staffIds: people.map((person) => person.id),
      intervalMinutes: config.intervalMinutes || 30,
      nowMinutes: date === today ? minutesNow() : null,
    });
  }

  function minutesNow() {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: TIME_ZONE,
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(new Date());
    const value = (type) => Number(parts.find((part) => part.type === type)?.value || 0);
    return value('hour') * 60 + value('minute');
  }

  function stepPlan() {
    const steps = [
      ['service', 'Service'],
      ['staff', noun],
      ['date', 'Date'],
      ['time', 'Time'],
      ['details', 'Details'],
    ];
    if (config.deposit?.enabled) steps.push(['deposit', 'Deposit']);
    steps.push(['review', 'Review']);
    return steps;
  }

  function todayStatus() {
    const day = config.openingHours?.[weekdayName(today)];
    if (!day) {
      const upcoming = eachDate(addDays(today, 1), 7).find((iso) => config.openingHours?.[weekdayName(iso)]);
      if (!upcoming) return 'Closed today';
      const next = config.openingHours[weekdayName(upcoming)];
      const label = formatDateLong(upcoming).split(' ')[0].replace(',', '');
      return `Closed today · Opens ${label} ${formatTime(next.open)}`;
    }
    return `Open today · ${formatTime(day.open)} – ${formatTime(day.close)}`;
  }

  function summaryHtml() {
    const service = servicesById[flow.serviceId];
    if (!service || flow.step === 'service') return '';
    let html = `<p class="summary">${escapeHtml(service.name)} · ${escapeHtml(formatDuration(service.durationMinutes))} · ${priceHtml(service.priceZmw)}`;
    if (flow.staffChoice && flow.staffChoice !== 'any' && !['staff'].includes(flow.step)) {
      html += ` · ${escapeHtml(staffName(config.staff, flow.staffChoice))}`;
    }
    if (flow.date && !['staff', 'date'].includes(flow.step)) {
      html += ` · ${escapeHtml(formatDateLong(flow.date))}`;
    }
    html += '</p>';
    return html;
  }

  function serviceStep() {
    const groups = (config.categories ?? []).map((category) => `
      <section>
        <h3>${escapeHtml(category.name)}</h3>
        <ul class="pick-list">
          ${(category.services ?? []).map((service) => `
            <li>
              <button type="button" class="pick" data-service="${escapeHtml(service.id)}">
                <strong>${escapeHtml(service.name)}</strong>
                <span>${escapeHtml(formatDuration(service.durationMinutes))} · ${priceHtml(service.priceZmw)}</span>
              </button>
            </li>
          `).join('')}
        </ul>
      </section>
    `).join('');
    return `<h2 id="booker-title">Choose a service</h2>${groups}`;
  }

  function staffStep() {
    const service = servicesById[flow.serviceId];
    const people = eligibleStaff(service);
    const choices = [
      `<button type="button" class="pick" data-staff="any"><strong>No preference</strong><span>First ${escapeHtml(config.staffNoun || 'stylist')} who is free for the whole visit</span></button>`,
      ...people.map((person) => `
        <button type="button" class="pick" data-staff="${escapeHtml(person.id)}">
          <strong>${escapeHtml(person.name)}</strong>
          <span>${escapeHtml(person.role || '')}</span>
        </button>
      `),
    ].join('');
    return `
      <h2 id="booker-title">Choose a ${escapeHtml(config.staffNoun || 'stylist')}</h2>
      ${summaryHtml()}
      <p>Optional. No preference is enough, or tap a name.</p>
      <div class="pick-list">${choices}</div>
      <button type="button" class="btn-text" id="change-service">Change service</button>
    `;
  }

  function dateStep() {
    const days = eachDate(today, DAY_COUNT).map((iso) => {
      const parts = formatDayParts(iso);
      const closed = !config.openingHours?.[weekdayName(iso)];
      const label = `${formatDateLong(iso)}${closed ? ', closed' : ''}`;
      return `
        <button type="button" class="day" data-date="${iso}" ${closed ? 'disabled' : ''} aria-label="${escapeHtml(label)}">
          <span class="dow">${escapeHtml(parts.weekday)}</span>
          <span class="dom">${escapeHtml(parts.day)}</span>
          <span class="mon">${closed ? 'Closed' : escapeHtml(parts.month)}</span>
        </button>`;
    }).join('');
    return `
      <h2 id="booker-title">Pick a date</h2>
      ${summaryHtml()}
      <div class="day-strip" role="group" aria-label="Upcoming days">${days}</div>
      <p class="help">Closed days stay visible and cannot be selected.</p>
    `;
  }

  function timeStep() {
    const service = servicesById[flow.serviceId];
    const available = computeSlots(flow.date, service, flow.staffChoice);
    flow.slots = available;
    const error = flow.error ? `<p class="form-error" role="alert">${escapeHtml(flow.error)}</p>` : '';
    const grid = available.length
      ? `<div class="slot-grid" role="radiogroup" aria-label="Available times">${available.map((slot, index) => `
          <button type="button" class="slot" role="radio" aria-checked="false" tabindex="${index === 0 ? '0' : '-1'}" data-start="${slot.start}" aria-label="${escapeHtml(formatTimeRange(slot.start, slot.end))}">
            <span class="slot-start">${escapeHtml(formatTime(slot.start))}</span>
            <small>to ${escapeHtml(formatTime(slot.end))}</small>
          </button>
        `).join('')}</div>`
      : `<p class="empty" role="status">No open times on this day. A ${escapeHtml(formatDuration(service.durationMinutes))} appointment has to finish before closing, stay clear of breaks, and avoid booked or blocked time.</p>`;
    return `
      <h2 id="booker-title">Pick a time</h2>
      ${summaryHtml()}
      <p class="help">Booked, blocked and too-short times are hidden, so a long braid cannot overlap another visit or run past closing.</p>
      ${error}
      ${grid}
    `;
  }

  function detailsStep() {
    const invalidName = Boolean(flow.error) && flow.name.trim().length < 2;
    const invalidPhone = Boolean(flow.error) && flow.phone.replace(/\D/g, '').length < 9;
    return `
      <h2 id="booker-title">Your details</h2>
      ${summaryHtml()}
      <form id="details-form" novalidate>
        <div class="field">
          <label for="cust-name">Your name</label>
          <input id="cust-name" name="name" type="text" autocomplete="name" required maxlength="80" value="${escapeHtml(flow.name)}" ${invalidName ? 'aria-invalid="true" aria-describedby="details-error"' : ''}>
        </div>
        <div class="field">
          <label for="cust-phone">Phone number</label>
          <input id="cust-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" required placeholder="097…" value="${escapeHtml(flow.phone)}" ${invalidPhone ? 'aria-invalid="true" aria-describedby="details-error"' : ''}>
        </div>
        <p id="details-error" class="form-error" role="alert" ${flow.error ? '' : 'hidden'}>${escapeHtml(flow.error)}</p>
        <button class="btn btn-block" type="submit">Continue</button>
      </form>
    `;
  }

  function depositStep() {
    const amount = priceHtml(config.deposit.amountZmw);
    if (flow.depositStage === 'mock' && flow.depositProvider) {
      return `
        <h2 id="booker-title">Pay deposit to secure your slot</h2>
        <p class="demo-stamp">Demo</p>
        <div class="mock-receipt" role="status">
          <h3>No payment was taken</h3>
          <p>You tapped ${escapeHtml(providerName(flow.depositProvider))}. This is a mock. Nothing was sent to MTN, Airtel or Zamtel, and no money moved.</p>
          <p>Demo reference <strong>${escapeHtml(flow.depositRef)}</strong>. It is not a payment receipt.</p>
          <p>Amount shown: ${amount}</p>
        </div>
        <button type="button" class="btn btn-block" id="deposit-continue">Continue</button>
        <button type="button" class="btn-text" id="deposit-clear">Choose a different option</button>
      `;
    }
    const providers = (config.deposit?.providers ?? []).map((provider) => `
      <button type="button" class="provider" data-provider="${escapeHtml(provider.id)}">
        <span class="swatch" style="background:${safeSwatch(provider.swatch)}" aria-hidden="true"></span>
        <span>${escapeHtml(provider.name)}</span>
      </button>
    `).join('');
    return `
      <h2 id="booker-title">Pay deposit to secure your slot</h2>
      <p class="demo-stamp">Demo</p>
      <p>Optional. This screen is a mock only. No payment is taken and no data is sent anywhere.</p>
      <p class="deposit-amt">${amount}</p>
      <div class="provider-list">${providers}</div>
      <button type="button" class="btn btn-block" id="skip-deposit">Continue without a deposit</button>
    `;
  }

  function reviewList(start, end, staffId) {
    const service = servicesById[flow.serviceId];
    const deposit = flow.depositProvider
      ? `${providerName(flow.depositProvider)} selected · demo only, not paid`
      : 'Not paid · demo only';
    return `
      <dl class="review">
        <div><dt>Service</dt><dd>${escapeHtml(service.name)}</dd></div>
        <div><dt>Date</dt><dd>${escapeHtml(formatDateLong(flow.date))}</dd></div>
        <div><dt>Time</dt><dd>${escapeHtml(formatTimeRange(start, end))}</dd></div>
        <div><dt>Duration</dt><dd>${escapeHtml(formatDuration(service.durationMinutes))}</dd></div>
        <div><dt>Price</dt><dd>${priceHtml(service.priceZmw)}</dd></div>
        <div><dt>${escapeHtml(noun)}</dt><dd>${escapeHtml(staffName(config.staff, staffId))}</dd></div>
        <div><dt>Name</dt><dd>${escapeHtml(flow.name)}</dd></div>
        <div><dt>Phone</dt><dd>${escapeHtml(flow.phone)}</dd></div>
        <div><dt>Deposit</dt><dd>${escapeHtml(deposit)}</dd></div>
      </dl>`;
  }

  function reviewStep() {
    const end = flow.slot.end || endTime(flow.slot.start, servicesById[flow.serviceId].durationMinutes);
    return `
      <h2 id="booker-title">Confirm your booking</h2>
      <p>Check the details, then save them on this device. You can send them on WhatsApp after that.</p>
      ${reviewList(flow.slot.start, end, flow.slot.staffId)}
      <button type="button" class="btn btn-block" id="confirm-booking">Confirm booking</button>
    `;
  }

  function doneStep() {
    const saved = flow.saved;
    const end = endTime(saved.start, saved.durationMinutes);
    const href = whatsappUrl(config.phone.whatsappE164, bookingMessage({
      businessName: config.name,
      serviceName: saved.serviceName,
      dateLabel: formatDateLong(saved.date),
      timeLabel: formatTimeRange(saved.start, end),
      durationLabel: formatDuration(saved.durationMinutes),
      priceLabel: formatPrice(saved.priceZmw),
      customerName: saved.customerName,
      customerPhone: saved.customerPhone,
      depositLabel: saved.depositDemo
        ? `${providerName(saved.depositDemo)} selected on the demo screen (not charged)`
        : null,
    }));
    return `
      <h2 id="booker-title">Saved in this demo</h2>
      <p>The booking is on this device and will show in the owner view. Nothing has been sent yet.</p>
      ${reviewList(saved.start, end, saved.staffId)}
      <a class="btn btn-block" href="${href}" target="_blank" rel="noopener noreferrer">Send booking on WhatsApp</a>
      <p class="phone-note">WhatsApp is shown as <strong class="phone-display">${escapeHtml(config.phone.display)}</strong>. That is a placeholder, not a live number.</p>
      <button type="button" class="btn-text" id="book-another">Book another service</button>
    `;
  }

  function renderStepBody() {
    switch (flow.step) {
      case 'staff': return staffStep();
      case 'date': return dateStep();
      case 'time': return timeStep();
      case 'details': return detailsStep();
      case 'deposit': return depositStep();
      case 'review': return reviewStep();
      case 'done': return doneStep();
      default: return serviceStep();
    }
  }

  function renderStep() {
    const plan = stepPlan();
    const index = plan.findIndex(([id]) => id === flow.step);
    const kicker = document.querySelector('#booker-kicker');
    const progress = document.querySelector('#booker-progress');
    const back = document.querySelector('#booker-back');
    const live = document.querySelector('#booker-live');
    if (flow.step === 'done') {
      kicker.textContent = 'Saved on this device';
      progress.style.width = '100%';
      back.hidden = true;
    } else {
      kicker.textContent = `Step ${index + 1} of ${plan.length} · ${plan[index][1]}`;
      progress.style.width = `${((index + 1) / plan.length) * 100}%`;
      back.hidden = index <= 0;
    }
    document.querySelector('#booker-step').innerHTML = `<div class="step-panel">${renderStepBody()}</div>`;
    if (live.textContent !== kicker.textContent) live.textContent = kicker.textContent;
    if (flow.step === 'details' && flow.error) {
      document.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }
    const title = document.getElementById('booker-title');
    if (title) {
      title.tabIndex = -1;
      title.focus();
    }
  }

  function openBooker(serviceId) {
    const known = serviceId && servicesById[serviceId] ? serviceId : null;
    flow = freshFlow(known);
    const dialog = document.querySelector('#booker');
    if (!dialog.open) dialog.showModal();
    renderStep();
  }

  function submitDetails(form) {
    const data = new FormData(form);
    flow.name = String(data.get('name') || '').trim();
    flow.phone = String(data.get('phone') || '').trim();
    const digits = flow.phone.replace(/\D/g, '');
    if (flow.name.length < 2 || flow.name.length > 80 || digits.length < 9 || digits.length > 15) {
      flow.error = 'Enter your name and a phone number with at least 9 digits.';
      renderStep();
      return;
    }
    flow.error = '';
    flow.depositStage = 'choose';
    flow.step = config.deposit?.enabled ? 'deposit' : 'review';
    renderStep();
  }

  function confirmBooking() {
    const service = servicesById[flow.serviceId];
    const stored = readStoredState(config.id);
    if (stored?.seedVersion === 1 && Array.isArray(stored.bookings) && Array.isArray(stored.blocked)) {
      state = stored;
    }
    const available = computeSlots(flow.date, service, flow.staffChoice);
    const match = available.find((slot) => slot.start === flow.slot?.start);
    if (!match || (flow.staffChoice !== 'any' && match.staffId !== flow.staffChoice)) {
      flow.slot = null;
      flow.error = 'That time was just taken. Please pick another.';
      flow.step = 'time';
      renderStep();
      return;
    }
    const booking = {
      id: uid('bk'),
      date: flow.date,
      start: match.start,
      durationMinutes: service.durationMinutes,
      priceZmw: service.priceZmw,
      serviceId: service.id,
      serviceName: service.name,
      staffId: match.staffId,
      customerName: flow.name,
      customerPhone: flow.phone,
      status: 'confirmed',
      depositDemo: flow.depositProvider,
    };
    state.bookings = [...state.bookings, booking];
    saveState(config.id, state);
    flow.saved = booking;
    flow.slot = match;
    flow.step = 'done';
    flow.error = '';
    renderStep();
  }

  function moveRadio(current, direction) {
    const radios = [...document.querySelectorAll('#booker [role="radio"]')];
    const index = radios.indexOf(current);
    if (index < 0 || radios.length === 0) return;
    let next = index;
    if (direction === 'next') next = (index + 1) % radios.length;
    if (direction === 'prev') next = (index - 1 + radios.length) % radios.length;
    if (direction === 'first') next = 0;
    if (direction === 'last') next = radios.length - 1;
    radios.forEach((radio, radioIndex) => {
      radio.tabIndex = radioIndex === next ? 0 : -1;
    });
    radios[next].focus();
  }

  function renderPage() {
    const categories = (config.categories ?? []).map((category) => `
      <a href="#cat-${escapeHtml(category.id)}">${escapeHtml(category.name)}</a>
    `).join('');
    const groups = (config.categories ?? []).map((category) => `
      <section class="service-group" id="cat-${escapeHtml(category.id)}" aria-labelledby="heading-${escapeHtml(category.id)}">
        <header class="group-head">
          <h3 id="heading-${escapeHtml(category.id)}">${escapeHtml(category.name)}</h3>
          <p>${escapeHtml(category.blurb || '')}</p>
        </header>
        <div class="service-list">
          ${(category.services ?? []).map((service) => `
            <article class="service">
              <h4>${escapeHtml(service.name)}</h4>
              <p class="price-block">${priceHtml(service.priceZmw)}</p>
              <p class="desc">${escapeHtml(service.description || '')}</p>
              <p class="meta">${escapeHtml(formatDuration(service.durationMinutes))}</p>
              <button type="button" class="btn btn-small" data-book="${escapeHtml(service.id)}" aria-label="Book ${escapeHtml(service.name)}">Book</button>
            </article>
          `).join('')}
        </div>
      </section>
    `).join('');
    const hours = hoursRows(config.openingHours).map((row) => `
      <tr><th scope="row">${escapeHtml(row.label)}</th><td>${escapeHtml(row.value)}</td></tr>
    `).join('');
    const gallery = (config.gallery ?? []).map((image) => `
      <figure>
        <img src="${imageSrc(image.src)}" alt="${escapeHtml(image.alt || '')}" width="800" height="600" loading="lazy" decoding="async">
      </figure>
    `).join('');

    app.innerHTML = `
      <div class="top-stack">
        ${demoBanner(config.name)}
        ${siteHeader(config, '<button type="button" class="btn book-now" id="book-now">Book now</button>')}
      </div>
      <main id="main">
        <section class="hero">
          <div class="wrap hero-grid">
            <div>
              <p class="eyebrow">${escapeHtml(config.area)}, Lusaka</p>
              <h1>${escapeHtml(config.name)}</h1>
              <p class="lede">${escapeHtml(config.tagline || '')}</p>
              <p class="contact-line">WhatsApp <strong class="phone-display">${escapeHtml(config.phone.display)}</strong></p>
              <p class="status-pill">${escapeHtml(todayStatus())}</p>
              <div class="hero-actions">
                <button type="button" class="btn" data-open="book">Book now</button>
                <a class="btn-ghost" href="#services">Browse services</a>
              </div>
            </div>
            <div class="hero-art">${heroMarkup(config.illustration)}</div>
          </div>
        </section>
        <section class="band" aria-labelledby="how-title">
          <div class="wrap">
            <p class="eyebrow">How it works</p>
            <h2 id="how-title">Three short steps</h2>
            <ol class="steps">
              <li><span class="step-num">1</span><h3>Choose a service</h3><p>Add a ${escapeHtml(config.staffNoun || 'stylist')} if you want one.</p></li>
              <li><span class="step-num">2</span><h3>Pick a time that fits</h3><p>Long visits only appear when the whole slot is free.</p></li>
              <li><span class="step-num">3</span><h3>Confirm on WhatsApp</h3><p>Your name, time and example price are filled in for you.</p></li>
            </ol>
          </div>
        </section>
        <section class="band" id="services" aria-labelledby="services-title">
          <div class="wrap services">
            <div class="services-intro">
              <p class="eyebrow">Services</p>
              <h2 id="services-title">Book a time</h2>
              <p>Prices are in Zambian kwacha and every one is marked example.</p>
              <nav class="cat-nav" aria-label="Service categories">${categories}</nav>
            </div>
            <div>${groups}</div>
          </div>
        </section>
        <section class="band" aria-labelledby="visit-title">
          <div class="wrap visit">
            <div>
              <p class="eyebrow">Visit</p>
              <h2 id="visit-title">${escapeHtml(config.area)}</h2>
              <p>${escapeHtml(config.address || '')}</p>
              <p>WhatsApp <strong class="phone-display">${escapeHtml(config.phone.display)}</strong> (placeholder number)</p>
              <table class="hours">
                <caption class="visually-hidden">Opening hours</caption>
                <tbody>${hours}</tbody>
              </table>
            </div>
            <div class="gallery">${gallery}</div>
          </div>
        </section>
      </main>
      ${siteFooter(config, 'customer')}
      ${whatsappFab(config)}
      <dialog class="booker" id="booker" aria-labelledby="booker-title">
        <div class="booker-shell">
          <div class="booker-bar">
            <button type="button" class="btn-ghost" id="booker-back">Back</button>
            <p id="booker-kicker" class="step-kicker"></p>
            <button type="button" class="btn-ghost" id="booker-close">Close</button>
          </div>
          <div class="progress" aria-hidden="true"><span id="booker-progress"></span></div>
          <div id="booker-step" class="booker-step"></div>
          <p id="booker-live" class="visually-hidden" aria-live="polite"></p>
        </div>
      </dialog>
    `;
  }

  renderPage();
  app.removeAttribute('aria-busy');

  const dialog = document.querySelector('#booker');
  document.querySelector('#book-now').addEventListener('click', () => openBooker(null));
  document.querySelector('#main').addEventListener('click', (event) => {
    if (event.target.closest('[data-open="book"]')) openBooker(null);
    const book = event.target.closest('[data-book]');
    if (book) openBooker(book.dataset.book);
  });
  document.querySelector('#booker-close').addEventListener('click', () => dialog.close());
  document.querySelector('#booker-back').addEventListener('click', () => {
    const plan = stepPlan();
    const index = plan.findIndex(([id]) => id === flow.step);
    if (index <= 0) {
      dialog.close();
      return;
    }
    flow.error = '';
    flow.step = plan[index - 1][0];
    if (flow.step === 'date' || flow.step === 'staff' || flow.step === 'service') flow.slot = null;
    renderStep();
  });

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      dialog.close();
      return;
    }
    const serviceBtn = event.target.closest('[data-service]');
    if (serviceBtn && flow.step === 'service') {
      flow.serviceId = serviceBtn.dataset.service;
      flow.staffChoice = 'any';
      flow.date = null;
      flow.slot = null;
      flow.step = 'staff';
      renderStep();
      return;
    }
    const staffBtn = event.target.closest('[data-staff]');
    if (staffBtn && flow.step === 'staff') {
      flow.staffChoice = staffBtn.dataset.staff;
      flow.slot = null;
      flow.step = 'date';
      renderStep();
      return;
    }
    const dayBtn = event.target.closest('[data-date]');
    if (dayBtn && flow.step === 'date' && !dayBtn.disabled) {
      flow.date = dayBtn.dataset.date;
      flow.slot = null;
      flow.error = '';
      flow.step = 'time';
      renderStep();
      return;
    }
    const slotBtn = event.target.closest('[data-start]');
    if (slotBtn && flow.step === 'time') {
      const slot = flow.slots.find((item) => item.start === slotBtn.dataset.start);
      if (!slot) return;
      slotBtn.setAttribute('aria-checked', 'true');
      flow.slot = slot;
      flow.error = '';
      flow.step = 'details';
      renderStep();
      return;
    }
    if (event.target.closest('#change-service')) {
      flow.step = 'service';
      flow.slot = null;
      flow.date = null;
      renderStep();
      return;
    }
    const providerBtn = event.target.closest('[data-provider]');
    if (providerBtn && flow.step === 'deposit') {
      flow.depositProvider = providerBtn.dataset.provider;
      flow.depositRef = demoRef();
      flow.depositStage = 'mock';
      renderStep();
      return;
    }
    if (event.target.closest('#skip-deposit')) {
      flow.depositProvider = null;
      flow.depositRef = '';
      flow.step = 'review';
      renderStep();
      return;
    }
    if (event.target.closest('#deposit-continue')) {
      flow.step = 'review';
      renderStep();
      return;
    }
    if (event.target.closest('#deposit-clear')) {
      flow.depositProvider = null;
      flow.depositRef = '';
      flow.depositStage = 'choose';
      renderStep();
      return;
    }
    if (event.target.closest('#confirm-booking')) {
      confirmBooking();
      return;
    }
    if (event.target.closest('#book-another')) {
      flow = freshFlow(null);
      renderStep();
    }
  });

  dialog.addEventListener('submit', (event) => {
    if (event.target.id !== 'details-form') return;
    event.preventDefault();
    submitDetails(event.target);
  });

  dialog.addEventListener('input', (event) => {
    if (event.target.name === 'name') flow.name = event.target.value;
    if (event.target.name === 'phone') flow.phone = event.target.value;
  });

  dialog.addEventListener('keydown', (event) => {
    const radio = event.target.closest?.('[role="radio"]');
    if (!radio) return;
    const map = {
      ArrowRight: 'next',
      ArrowDown: 'next',
      ArrowLeft: 'prev',
      ArrowUp: 'prev',
      Home: 'first',
      End: 'last',
    };
    const direction = map[event.key];
    if (!direction) return;
    event.preventDefault();
    moveRadio(radio, direction);
  });

  window.addEventListener('storage', (event) => {
    if (event.key !== `bookit-lusaka:v1:${config.id}` || !event.newValue) return;
    try {
      const parsed = JSON.parse(event.newValue);
      if (parsed?.seedVersion === 1) {
        state = parsed;
        if (dialog.open && (flow.step === 'time' || flow.step === 'date')) renderStep();
      }
    } catch {
      /* Ignore unreadable storage from another tab. */
    }
  });

  if (requestedConfigId() && !services.length) {
    app.innerHTML = loadErrorPage('This demo has no services yet.');
  }
}

boot();
