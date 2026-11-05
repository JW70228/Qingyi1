"use strict";
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const intro = document.querySelector('.intro');
window.setTimeout(() => { intro.style.display = 'none'; }, reducedMotion.matches ? 0 : 3000);

// Preserve the original colored rain effect and its desktop density.
const main = document.querySelector('body');
const colors = ['gold', 'orange', 'deeppink', 'skyblue', 'darkcyan', 'green', 'turquoise'];
const count = reducedMotion.matches ? 0 : (window.matchMedia('(max-width: 900px)').matches ? 55 : 190);
for (let i = 0; i < count; i++) {
  const index = Math.floor(Math.random() * colors.length);
  const drop = document.createElement('div');
  drop.classList.add('drop');
  drop.setAttribute('aria-hidden', 'true');
  Object.assign(drop.style, {
    background: `linear-gradient(transparent, ${colors[index]})`,
    left: `min(${Math.random() * 98}vw, calc(100% - 5px))`,
    animationDelay: Math.random() * -3 + 's',
    animationDuration: 2 + Math.random() * 5 + 's'
  });
  main.appendChild(drop);
}

// Original horizontal work strip: native touch scrolling and desktop dragging.
const workScroll = document.querySelector('.scrollbox');
let isDown = false;
let startX = 0;
let scrollLeft = 0;
let isDragging = false;
workScroll.addEventListener('mousedown', event => {
  if (event.button !== 0) return;
  isDown = true; isDragging = false;
  workScroll.style.cursor = 'grabbing';
  startX = event.clientX; scrollLeft = workScroll.scrollLeft;
});
window.addEventListener('mouseup', () => {
  isDown = false; workScroll.style.cursor = 'grab';
  window.setTimeout(() => { isDragging = false; }, 0);
});
window.addEventListener('mousemove', event => {
  if (!isDown) return;
  event.preventDefault();
  const walk = (event.clientX - startX) * 1.2;
  if (Math.abs(walk) > 6) isDragging = true;
  workScroll.scrollLeft = scrollLeft - walk;
});
workScroll.addEventListener('dragstart', event => event.preventDefault());
workScroll.addEventListener('click', event => {
  if (isDragging) { event.preventDefault(); event.stopPropagation(); }
}, true);
document.querySelectorAll('[role="link"]').forEach(link => {
  link.addEventListener('keydown', event => {
    if (event.key === 'Enter') { event.preventDefault(); link.click(); }
  });
});

// Preserve the original transition without blocking on large video downloads.
const loading = {
  container: document.querySelector('.loading'),
  in(target) {
    this.container.classList.remove('loading_out');
    window.setTimeout(() => { window.location.href = target; }, reducedMotion.matches ? 0 : 1000);
  },
  out() { this.container.classList.add('loading_out'); }
};
loading.out();
window.addEventListener('pageshow', () => loading.out());

const videos = [...document.querySelectorAll('video')];
const saveData = navigator.connection?.saveData === true;
let introFinished = reducedMotion.matches;
const playVideo = video => {
  if (reducedMotion.matches || saveData || document.hidden) return;
  const source = video.querySelector('source[data-src]');
  if (source) { source.src = source.dataset.src; delete source.dataset.src; video.load(); }
  if (video.id === 'myVideo' && !introFinished) return;
  video.play()?.catch(() => {});
};
window.setTimeout(() => {
  introFinished = true;
  const video = document.getElementById('myVideo');
  if (video.dataset.visible === 'true') playVideo(video);
}, 3000);
if ('IntersectionObserver' in window) {
  const videoObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      entry.target.dataset.visible = String(entry.isIntersecting);
      if (entry.isIntersecting) playVideo(entry.target); else entry.target.pause();
    });
  }, { threshold: .15 });
  videos.forEach(video => videoObserver.observe(video));
}
document.addEventListener('visibilitychange', () => {
  videos.forEach(video => {
    if (document.hidden) video.pause(); else if (video.dataset.visible === 'true') playVideo(video);
  });
});

// Original skill bars: same thick bars, spacing, colors and reveal behavior.
const skillItems = document.querySelectorAll('main li');
const skillOffset = 70;
function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();
  return rect.top + skillOffset >= 0 && rect.left >= 0 &&
    rect.bottom - skillOffset <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth);
}
function handleScroll() {
  skillItems.forEach(item => item.classList.toggle('show', isElementInViewport(item)));
}
window.addEventListener('scroll', handleScroll, { passive: true });
window.addEventListener('resize', handleScroll, { passive: true });
handleScroll();
