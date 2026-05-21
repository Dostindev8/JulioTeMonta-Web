(function () {
  const root = document.getElementById('richardCarousel');
  if (!root) return;

  const slides = [
    { src: 'images/richardtemonta.png', alt: 'Richard Te Monta' },
    { src: 'images/ganador2.png', alt: 'Ganador Abril 2024 del camión' },
    { src: 'images/Ganador3.png', alt: 'Ganadora del Mira 2018 marzo 2025' },
    { src: 'images/ganadora1.png', alt: 'Ganadora oficial Richard Te Monta' },
    { src: 'images/RifaActual.png', alt: 'Gran rifa Villa Altagracia' },
    { src: 'images/Rifa.png', alt: 'Gran rifa Monta a Mamá' },
  ];

  let i = 0;
  let timer;
  let paused = false;

  const track = root.querySelector('.rc-track');
  const dotsWrap = root.querySelector('.rc-dots');
  const prev = root.querySelector('.rc-prev');
  const next = root.querySelector('.rc-next');

  slides.forEach((s, idx) => {
    const slide = document.createElement('div');
    slide.className = 'rc-slide' + (idx === 0 ? ' active' : '');
    slide.innerHTML =
      '<img src="' + s.src + '" alt="' + s.alt + '" ' +
      (idx === 0 ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"') + ' width="900" height="420">';
    track.appendChild(slide);

    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'rc-dot' + (idx === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Slide ' + (idx + 1));
    dot.addEventListener('click', () => go(idx));
    dotsWrap.appendChild(dot);
  });

  const slideEls = () => track.querySelectorAll('.rc-slide');
  const dotEls = () => dotsWrap.querySelectorAll('.rc-dot');

  function go(n) {
    slideEls().forEach((el, x) => el.classList.toggle('active', x === n));
    dotEls().forEach((el, x) => el.classList.toggle('active', x === n));
    i = n;
  }

  function nextSlide() {
    go((i + 1) % slides.length);
  }

  function prevSlide() {
    go((i - 1 + slides.length) % slides.length);
  }

  function start() {
    clearInterval(timer);
    timer = setInterval(() => {
      if (!paused) nextSlide();
    }, 4000);
  }

  prev?.addEventListener('click', () => {
    prevSlide();
    start();
  });
  next?.addEventListener('click', () => {
    nextSlide();
    start();
  });

  root.addEventListener('mouseenter', () => { paused = true; });
  root.addEventListener('mouseleave', () => { paused = false; });

  let touchX = 0;
  root.addEventListener(
    'touchstart',
    (e) => {
      touchX = e.changedTouches[0].screenX;
    },
    { passive: true }
  );
  root.addEventListener(
    'touchend',
    (e) => {
      const dx = e.changedTouches[0].screenX - touchX;
      if (Math.abs(dx) > 50) (dx > 0 ? prevSlide : nextSlide)();
      start();
    },
    { passive: true }
  );

  start();
})();
