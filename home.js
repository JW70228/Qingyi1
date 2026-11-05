(() => {
  'use strict';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const intro = document.querySelector('.intro');
  const closeIntro = () => {
    const hadFocus = intro.contains(document.activeElement);
    intro.hidden = true;
    if (hadFocus) document.querySelector('.brand').focus();
  };
  document.querySelector('.intro-skip').addEventListener('click', closeIntro);
  if (reducedMotion.matches || window.location.hash) closeIntro();
  else window.setTimeout(closeIntro, 2400);

  // Decorative animation stays in the hero and uses fewer particles on phones.
  const rainfall = document.querySelector('.rainfall');
  if (!reducedMotion.matches) {
    const colors = ['gold', 'orange', 'deeppink', 'skyblue', 'darkcyan', 'green', 'turquoise'];
    const drops = document.createDocumentFragment();
    const count = window.matchMedia('(max-width: 680px)').matches ? 18 : 55;
    for (let i = 0; i < count; i++) {
      const drop = document.createElement('span');
      drop.className = 'drop';
      drop.style.background = `linear-gradient(transparent, ${colors[i % colors.length]})`;
      drop.style.left = `${Math.random() * 99}%`;
      drop.style.animationDelay = `${Math.random() * -7}s`;
      drop.style.animationDuration = `${3 + Math.random() * 5}s`;
      drops.append(drop);
    }
    rainfall.append(drops);
  }

  // Keep loading and playback independent from the page's load event.
  // Below-fold videos fetch only as they approach the viewport.
  const videos = [...document.querySelectorAll('video')];
  const saveData = navigator.connection?.saveData === true;
  const prepareVideo = video => {
    const source = video.querySelector('source[data-src]');
    if (source) {
      source.src = source.dataset.src;
      delete source.dataset.src;
      video.load();
    }
  };
  const playVideo = video => {
    prepareVideo(video);
    if (!reducedMotion.matches && !saveData && !document.hidden) {
      const playback = video.play();
      if (playback?.catch) playback.catch(() => { /* User controls remain available. */ });
    }
  };
  let videoObserver;
  if ('IntersectionObserver' in window) {
    videoObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        entry.target.dataset.visible = String(entry.isIntersecting);
        if (entry.isIntersecting) playVideo(entry.target);
        else entry.target.pause();
      }
    }, { threshold: 0.15 });
    videos.forEach(video => videoObserver.observe(video));
  } else {
    videos.forEach(prepareVideo);
  }
  document.addEventListener('visibilitychange', () => {
    videos.forEach(video => {
      if (document.hidden) video.pause();
      else if (video.dataset.visible === 'true') playVideo(video);
    });
  });
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) {
      closeIntro();
      rainfall.replaceChildren();
      videos.forEach(video => video.pause());
    }
  });

  const carousel = document.querySelector('.scrollbox');
  const previous = document.querySelector('.work-prev');
  const next = document.querySelector('.work-next');
  const updateControls = () => {
    previous.disabled = carousel.scrollLeft <= 2;
    next.disabled = carousel.scrollLeft >= carousel.scrollWidth - carousel.clientWidth - 2;
  };
  const advance = direction => {
    const card = carousel.querySelector('.scrollbox_container_card');
    const gap = parseFloat(getComputedStyle(carousel.firstElementChild).gap) || 16;
    carousel.scrollBy({ left: direction * (card.getBoundingClientRect().width + gap), behavior: reducedMotion.matches ? 'auto' : 'smooth' });
  };
  previous.addEventListener('click', () => advance(-1));
  next.addEventListener('click', () => advance(1));
  carousel.addEventListener('scroll', updateControls, { passive: true });
  window.addEventListener('resize', updateControls, { passive: true });
  carousel.addEventListener('keydown', event => {
    if (event.target !== carousel) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      advance(event.key === 'ArrowRight' ? 1 : -1);
    }
  });

  // Native touch scrolling is untouched; desktop dragging never opens a card.
  let dragging = false;
  let moved = false;
  let startX = 0;
  let startScroll = 0;
  carousel.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    dragging = true;
    moved = false;
    startX = event.clientX;
    startScroll = carousel.scrollLeft;
  });
  window.addEventListener('pointermove', event => {
    if (!dragging) return;
    const distance = event.clientX - startX;
    if (Math.abs(distance) > 6) {
      moved = true;
      carousel.classList.add('is-dragging');
    }
    if (moved) carousel.scrollLeft = startScroll - distance;
  });
  const endDrag = () => {
    dragging = false;
    carousel.classList.remove('is-dragging');
    window.setTimeout(() => { moved = false; }, 0);
  };
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);
  carousel.addEventListener('dragstart', event => event.preventDefault());
  carousel.addEventListener('click', event => {
    if (moved) { event.preventDefault(); event.stopPropagation(); }
  }, true);
  updateControls();
})();
