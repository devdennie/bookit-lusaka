const salon = `
<svg viewBox="0 0 640 760" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <rect width="640" height="760" fill="var(--accent-soft)"/>
  <circle cx="470" cy="170" r="78" fill="var(--bg-elev)"/>
  <circle cx="210" cy="520" r="132" fill="none" stroke="var(--accent)" stroke-width="16"/>
  <path d="M70 280c48-110 130-110 178 0s130 110 178 0 130-110 178 0" fill="none" stroke="var(--ink)" stroke-width="10" stroke-linecap="round"/>
  <path d="M70 328c48-110 130-110 178 0s130 110 178 0 130-110 178 0" fill="none" stroke="var(--accent)" stroke-width="10" stroke-linecap="round"/>
  <path d="M70 376c48-110 130-110 178 0s130 110 178 0 130-110 178 0" fill="none" stroke="var(--gold)" stroke-width="10" stroke-linecap="round"/>
  <rect x="64" y="64" width="168" height="14" rx="7" fill="var(--ink)"/>
  <rect x="64" y="94" width="104" height="14" rx="7" fill="var(--accent)"/>
</svg>`;

const barber = `
<svg viewBox="0 0 640 760" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <rect width="640" height="760" fill="var(--accent-soft)"/>
  <rect x="150" y="120" width="340" height="460" fill="var(--bg-elev)"/>
  <rect x="190" y="180" width="260" height="18" fill="var(--accent)"/>
  <rect x="190" y="230" width="180" height="18" fill="var(--ink)"/>
  <path d="M190 340h260M190 400h260M190 460h180" fill="none" stroke="var(--gold)" stroke-width="10" stroke-linecap="round"/>
  <circle cx="470" cy="600" r="46" fill="var(--accent)"/>
</svg>`;

const dinah = `
<svg viewBox="0 0 640 760" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <rect width="640" height="760" fill="var(--accent-soft)"/>
  <rect x="70" y="80" width="500" height="600" rx="36" fill="var(--bg-elev)"/>
  <g fill="none" stroke="var(--accent)" stroke-width="16" stroke-linecap="round">
    <path d="M140 460c24-120 60-120 84 0"/>
    <path d="M250 460c28-150 70-150 98 0"/>
    <path d="M380 460c22-100 54-100 76 0"/>
    <path d="M480 460c16-70 40-70 56 0"/>
  </g>
  <path d="M120 180c40 30 70 30 110 0s70-30 110 0 70 30 110 0 60 30 90 0" fill="none" stroke="var(--ink)" stroke-width="8" stroke-linecap="round"/>
</svg>`;

const tutoring = `
<svg viewBox="0 0 640 760" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <rect width="640" height="760" fill="var(--accent-soft)"/>
  <rect x="80" y="90" width="480" height="560" rx="28" fill="var(--bg-elev)"/>
  <g fill="none" stroke="var(--accent)" stroke-width="12" stroke-linecap="round">
    <path d="M130 220h300"/>
    <path d="M130 300h360"/>
    <path d="M130 380h320"/>
    <path d="M130 460h240"/>
    <path d="M130 540h280"/>
  </g>
  <circle cx="470" cy="560" r="36" fill="var(--accent)"/>
</svg>`;

const steaming = `
<svg viewBox="0 0 640 760" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <rect width="640" height="760" fill="var(--accent-soft)"/>
  <path d="M170 180h300l80 110v280H90V290z" fill="var(--bg-elev)" stroke="var(--accent)" stroke-width="14" stroke-linejoin="round"/>
  <path d="M170 180l150 80 150-80" fill="none" stroke="var(--ink)" stroke-width="12" stroke-linejoin="round"/>
  <path d="M320 260v310" fill="none" stroke="var(--accent)" stroke-width="10" stroke-linecap="round"/>
  <path d="M150 640c40-30 70-30 110 0s70 30 110 0 70-30 110 0" fill="none" stroke="var(--ink)" stroke-width="8" stroke-linecap="round"/>
</svg>`;

const printing = `
<svg viewBox="0 0 640 760" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <rect width="640" height="760" fill="var(--accent-soft)"/>
  <rect x="150" y="120" width="280" height="360" rx="16" fill="var(--bg-elev)" stroke="var(--accent)" stroke-width="12"/>
  <rect x="210" y="160" width="300" height="400" rx="16" fill="var(--bg-elev)" stroke="var(--ink)" stroke-width="12"/>
  <path d="M250 250h180M250 310h220M250 370h160M250 430h200" fill="none" stroke="var(--accent)" stroke-width="10" stroke-linecap="round"/>
  <rect x="120" y="560" width="400" height="70" rx="16" fill="var(--accent)"/>
</svg>`;

const icons = { salon, barber, dinah, tutoring, steaming, printing };

export function heroMarkup(kind) {
  return icons[kind] || icons.salon;
}

export const whatsappIcon = `
<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
  <path fill="currentColor" d="M12.04 2C6.58 2 2.15 6.4 2.15 11.83c0 1.74.46 3.44 1.34 4.94L2 22l5.39-1.4a10 10 0 0 0 4.65 1.18h.01c5.46 0 9.89-4.4 9.89-9.83C21.94 6.4 17.5 2 12.04 2zm5.76 14.04c-.24.68-1.4 1.3-1.94 1.38-.5.08-1.12.11-1.81-.11-.42-.14-.95-.31-1.64-.6-2.88-1.24-4.76-4.14-4.9-4.33-.14-.2-1.16-1.54-1.16-2.94s.73-2.08 1-2.36c.24-.28.64-.41 1.02-.41.12 0 .23 0 .33.01.3.01.45.03.65.5.24.58.82 2 .89 2.15.07.14.12.32.02.51-.1.2-.14.32-.28.49-.14.17-.3.38-.42.51-.14.14-.28.29-.12.56.16.28.72 1.18 1.54 1.91 1.06.94 1.95 1.23 2.23 1.37.28.14.44.12.6-.07.17-.2.7-.82.89-1.1.19-.28.38-.23.64-.14.26.09 1.64.77 1.92.91.28.14.46.21.53.33.07.12.07.68-.17 1.36z"/>
</svg>`;
