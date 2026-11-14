const root = document.querySelector('[data-showcase]');
if (root) {
  const track = root.querySelector('[data-track]');
  const cards = [...root.querySelectorAll('[data-card]')];
  const pauseBtn = root.querySelector('[data-pause]');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0;
  let timer = 0;
  let resumeTimer = 0;
  let tick = 0;
  let pausedByUser = false;
  let hovering = false;
  let focusing = false;

  function motionOk() {
    return !reduce.matches && cards.length > 1;
  }

  function flash(card) {
    card.classList.add('is-confirm');
    window.setTimeout(() => card.classList.remove('is-confirm'), 1600);
  }

  function showAll() {
    track.style.transform = '';
    cards.forEach((card) => {
      card.removeAttribute('aria-hidden');
      card.classList.remove('is-confirm');
      card.querySelectorAll('a, button').forEach((el) => el.removeAttribute('tabindex'));
    });
  }

  function layout() {
    const animate = motionOk();
    root.classList.toggle('is-animated', animate);
    if (!animate) {
      showAll();
      return;
    }
    track.style.transform = `translateX(-${index * 100}%)`;
    cards.forEach((card, cardIndex) => {
      const visible = cardIndex === index;
      card.toggleAttribute('aria-hidden', !visible);
      card.querySelectorAll('a, button').forEach((el) => {
        if (visible) el.removeAttribute('tabindex');
        else el.setAttribute('tabindex', '-1');
      });
    });
  }

  function stop() {
    if (timer) window.clearInterval(timer);
    timer = 0;
  }

  function shouldPlay() {
    return motionOk() && !pausedByUser && !hovering && !focusing && !document.hidden;
  }

  function play() {
    stop();
    if (!shouldPlay()) return;
    timer = window.setInterval(() => {
      index = (index + 1) % cards.length;
      tick += 1;
      layout();
      if (tick % 3 === 0) flash(cards[index]);
    }, 4500);
  }

  function bump() {
    stop();
    window.clearTimeout(resumeTimer);
    resumeTimer = window.setTimeout(play, 8000);
  }

  function go(delta) {
    if (!cards.length) return;
    index = (index + delta + cards.length) % cards.length;
    layout();
    bump();
  }

  pauseBtn?.addEventListener('click', () => {
    pausedByUser = !pausedByUser;
    pauseBtn.setAttribute('aria-pressed', String(pausedByUser));
    pauseBtn.textContent = pausedByUser ? 'Play motion' : 'Pause motion';
    if (pausedByUser) stop();
    else play();
  });
  root.querySelector('[data-prev]')?.addEventListener('click', () => go(-1));
  root.querySelector('[data-next]')?.addEventListener('click', () => go(1));

  root.addEventListener('pointerenter', () => {
    hovering = true;
    stop();
  });
  root.addEventListener('pointerleave', () => {
    hovering = false;
    play();
  });
  root.addEventListener('pointerdown', bump);
  root.addEventListener('focusin', () => {
    focusing = true;
    stop();
  });
  root.addEventListener('focusout', () => {
    window.setTimeout(() => {
      focusing = root.contains(document.activeElement);
      play();
    }, 0);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else play();
  });
  if (reduce.addEventListener) reduce.addEventListener('change', () => {
    layout();
    play();
  });

  layout();
  play();
}
