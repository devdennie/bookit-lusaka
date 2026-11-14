const base = import.meta.env.BASE_URL;

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char]));
}

function paintCredits(credits) {
  const note = document.querySelector('#photo-credits');
  if (!note || !Array.isArray(credits)) return;
  const seen = new Set();
  const links = [];
  for (const item of credits) {
    const href = item.source_page_url || '';
    const credit = item.photographer || '';
    if (!credit || !href || seen.has(href)) continue;
    seen.add(href);
    links.push(`<a href="${escapeHtml(href)}">${escapeHtml(credit)}</a>`);
  }
  if (links.length === 0) return;
  note.innerHTML = `Photos: ${links.join(', ')}. <a href="https://www.pexels.com/license/">Pexels License</a>.`;
  note.hidden = false;
}

try {
  const response = await fetch(`${base}data/credits.json`);
  if (response.ok) paintCredits(await response.json());
} catch {
  /* The hero still shows if the credit list cannot be loaded. */
}
