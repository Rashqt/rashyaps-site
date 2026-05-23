/* ================================================================
   Rashqyiiiiee — script.js v5
   Loader · Theme · Search · Filters · More · LNT · Comments · Share
   ================================================================ */
'use strict';

/* ── State ──────────────────────────────────────────────── */
const S = {
  blogs:[], projects:[], experience:[], reviews:[],
  skills:[], comments:{}, likes:{},
  lateNightThoughts:[], currently:{},
  lntIndex: 0,
  blogsVisible: 4,
  projectsVisible: 4,
  reviewsVisible: 3,
  BLOG_INIT: 4,
  PROJ_INIT: 4,
  REV_INIT:  3,
  currentFilter: 'all',
  searchQuery: ''
};

/* ── Boot ───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  initLoader();
  initTheme();
  await loadData();
  initNavbar();
  initMobileNav();
  initScrollReveal();
  initPageLinks();

  const p = document.body.dataset.page;
  if (p === 'index')   initIndex();
  if (p === 'blog')    initBlogPage();
  if (p === 'post')    initPostPage();
  if (p === 'about')   initAboutPage();
  if (p === 'contact') initContactPage();
});

/* ════════════════════════════════════════════════════════════
   LOADER
   ════════════════════════════════════════════════════════════ */
function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;
  // Fade out after content is ready
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('done');
      setTimeout(() => loader.remove(), 700);
    }, 900);
  });
  // Fallback if load event already fired
  setTimeout(() => {
    loader.classList.add('done');
    setTimeout(() => loader.remove(), 700);
  }, 2200);
}

/* ════════════════════════════════════════════════════════════
   THEME
   ════════════════════════════════════════════════════════════ */
function initTheme() {
  const saved = localStorage.getItem('ry_theme') || 'dark';
  setTheme(saved, false);
  const btn = document.getElementById('theme-btn');
  if (btn) btn.addEventListener('click', toggleTheme);
}

function setTheme(theme, animate = true) {
  const html = document.documentElement;
  const icon = document.getElementById('theme-icon');

  if (animate) {
    const veil = document.getElementById('theme-veil');
    if (veil) {
      veil.style.opacity = '1';
      setTimeout(() => {
        html.dataset.theme = theme;
        updateIcon(theme, icon);
        veil.style.opacity = '0';
      }, 200);
    } else {
      html.dataset.theme = theme;
      updateIcon(theme, icon);
    }
  } else {
    html.dataset.theme = theme;
    updateIcon(theme, icon);
  }
  localStorage.setItem('ry_theme', theme);
}

function toggleTheme() {
  const cur = document.documentElement.dataset.theme || 'dark';
  setTheme(cur === 'dark' ? 'light' : 'dark', true);
}

function updateIcon(theme, el) {
  if (!el) return;
  el.style.transform = 'scale(0) rotate(90deg)';
  el.style.opacity   = '0';
  setTimeout(() => {
    el.textContent     = theme === 'dark' ? '🌙' : '☀️';
    el.style.transform = 'scale(1) rotate(0deg)';
    el.style.opacity   = '1';
  }, 140);
}

document.addEventListener('DOMContentLoaded', () => {
  const icon = document.getElementById('theme-icon');
  if (icon) {
    icon.style.transition = 'transform .25s ease, opacity .2s ease';
    icon.style.display    = 'inline-block';
  }
});

/* ════════════════════════════════════════════════════════════
   DATA
   ════════════════════════════════════════════════════════════ */
async function loadData() {
  try {
    const r = await fetch('data.json');
    const d = await r.json();
    S.blogs             = d.blogs             || [];
    S.projects          = d.projects          || [];
    S.experience        = d.experience        || [];
    S.reviews           = d.reviews           || [];
    S.skills            = d.skills            || [];
    S.lateNightThoughts = d.lateNightThoughts || [];
    S.currently         = d.currently         || {};

    S.likes    = JSON.parse(localStorage.getItem('ry_likes')    || '{}');
    const stored = JSON.parse(localStorage.getItem('ry_comments') || '{}');
    const seed   = d.comments || {};
    const keys   = new Set([...Object.keys(seed), ...Object.keys(stored)]);
    keys.forEach(k => { S.comments[k] = stored[k] || seed[k] || []; });
  } catch(e) { console.warn('data.json:', e); }
}

function saveLikes()    { localStorage.setItem('ry_likes',    JSON.stringify(S.likes));    }
function saveComments() { localStorage.setItem('ry_comments', JSON.stringify(S.comments)); }

/* ════════════════════════════════════════════════════════════
   VEILS & PAGE TRANSITIONS
   ════════════════════════════════════════════════════════════ */
function initVeil() {
  const v = document.getElementById('page-veil');
  if (v) setTimeout(() => v.classList.remove('show'), 60);
}

function initPageLinks() {
  initVeil();
  const v = document.getElementById('page-veil');
  document.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') ||
        href.startsWith('mailto') || href.startsWith('tel') || href.startsWith('upi')) return;
    a.addEventListener('click', e => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      if (!v) { location.href = href; return; }
      v.classList.add('show');
      setTimeout(() => location.href = href, 280);
    });
  });
}

/* ════════════════════════════════════════════════════════════
   NAVBAR
   ════════════════════════════════════════════════════════════ */
function initNavbar() {
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  const up = () => nav.classList.toggle('stuck', window.scrollY > 24);
  window.addEventListener('scroll', up, { passive: true });
  up();
  // Active link highlight
  const path = location.pathname.split('/').pop() || 'index.html';
  nav.querySelectorAll('.nav-links a').forEach(a => {
    const href = (a.getAttribute('href') || '').split('#')[0];
    if (href === path || (path === '' && href === 'index.html')) a.classList.add('active');
  });
}

/* ════════════════════════════════════════════════════════════
   MOBILE NAV
   ════════════════════════════════════════════════════════════ */
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const mob    = document.querySelector('.mobile-nav');
  const close  = document.querySelector('.mob-close');
  if (!toggle || !mob) return;
  const open = () => { mob.classList.add('open'); toggle.classList.add('open'); document.body.style.overflow = 'hidden'; };
  const shut = () => { mob.classList.remove('open'); toggle.classList.remove('open'); document.body.style.overflow = ''; };
  toggle.addEventListener('click', () => mob.classList.contains('open') ? shut() : open());
  if (close) close.addEventListener('click', shut);
  mob.querySelectorAll('a').forEach(a => a.addEventListener('click', shut));
}

/* ════════════════════════════════════════════════════════════
   SCROLL REVEAL
   ════════════════════════════════════════════════════════════ */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal:not(.in)');
  if (!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); } });
  }, { threshold: 0.09, rootMargin: '0px 0px -36px 0px' });
  els.forEach(el => obs.observe(el));
}

/* ════════════════════════════════════════════════════════════
   TOAST
   ════════════════════════════════════════════════════════════ */
function toast(msg, icon = '✦') {
  const old = document.querySelector('.toast');
  if (old) old.remove();
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<span style="font-size:16px">${icon}</span><span>${msg}</span>`;
  document.body.appendChild(t);
  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('show')));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 320); }, 3000);
}

async function copyText(text, msg = 'Copied!') {
  try { await navigator.clipboard.writeText(text); toast(msg, '📋'); }
  catch { toast('Copy: ' + text, '⚠'); }
}

/* ════════════════════════════════════════════════════════════
   LIKE
   ════════════════════════════════════════════════════════════ */
function toggleLike(id, btn) {
  S.likes[id] = !S.likes[id];
  saveLikes();
  const blog  = S.blogs.find(b => b.id == id);
  const count = btn.querySelector('.like-count');
  const heart = btn.querySelector('.heart');
  if (S.likes[id]) {
    btn.classList.add('liked');
    heart.textContent = '❤️';
    if (count && blog) count.textContent = blog.likes + 1;
    btn.style.transform = 'scale(1.2)';
    setTimeout(() => btn.style.transform = '', 200);
  } else {
    btn.classList.remove('liked');
    heart.textContent = '🤍';
    if (count && blog) count.textContent = blog.likes;
  }
}

/* ════════════════════════════════════════════════════════════
   BLOG CARD HTML
   ════════════════════════════════════════════════════════════ */
function blogCardHTML(blog, extra = '') {
  const liked = S.likes[blog.id];
  const count = liked ? blog.likes + 1 : blog.likes;
  return `
  <article class="blog-card ${extra}" data-id="${blog.id}"
    data-tags="${(blog.tags||[]).join(',')}"
    data-title="${esc(blog.title).toLowerCase()}"
    data-preview="${esc(blog.preview).toLowerCase()}"
    role="button" tabindex="0">
    <div class="blog-card-top">
      <span class="blog-cat">${blog.category}</span>
      ${blog.featured ? '<span class="featured-badge">✦ Pinned</span>' : ''}
      <span class="blog-date-sm">${blog.date}</span>
    </div>
    <h3 class="blog-title-card">${blog.title}</h3>
    <p class="blog-preview-txt">${blog.preview}</p>
    <div class="blog-card-bot">
      <span class="read-time">◷ ${blog.readTime}</span>
      <button class="like-btn ${liked?'liked':''}" data-id="${blog.id}" aria-label="Like">
        <span class="heart">${liked?'❤️':'🤍'}</span>
        <span class="like-count">${count}</span>
      </button>
    </div>
  </article>`;
}

function attachCardListeners(container) {
  container.querySelectorAll('.blog-card').forEach(card => {
    const id = card.dataset.id;
    const go = e => { if (!e.target.closest('.like-btn')) location.href = `post.html?id=${id}`; };
    card.addEventListener('click', go);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') go(e); });
    const lb = card.querySelector('.like-btn');
    if (lb) lb.addEventListener('click', e => { e.stopPropagation(); toggleLike(id, lb); });
  });
}

/* ════════════════════════════════════════════════════════════
   MORE BUTTON HELPER
   ════════════════════════════════════════════════════════════ */
function initMoreBtn(btnId, showFn) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.addEventListener('click', () => {
    showFn();
    // If all shown, hide button
    btn.closest('.more-wrap')?.classList.add('hidden');
  });
}

/* ════════════════════════════════════════════════════════════
   INDEX PAGE
   ════════════════════════════════════════════════════════════ */
function initIndex() {
  renderIndexBlogs();
  renderProjects();
  renderExperience();
  renderReviews();
  renderSkills('skills-grid');
  renderCurrently();
  initLNT();
  initSupportSection();
  initContactForm('cf-form', 'cf-msg');
  initNewsletter('nl-form');
}

/* ── Index blog preview (3 initially, More reveals rest) ── */
function renderIndexBlogs() {
  const g = document.getElementById('blog-grid');
  if (!g) return;
  const all = S.blogs.slice(0, 6);
  g.innerHTML = all.map((b, i) => blogCardHTML(b, i >= S.BLOG_INIT ? 'hidden-card' : 'reveal')).join('');
  attachCardListeners(g);
  initScrollReveal();

  const moreWrap = document.getElementById('more-blogs-wrap');
  if (all.length > S.BLOG_INIT && moreWrap) {
    moreWrap.style.display = 'block';
    document.getElementById('more-blogs-btn')?.addEventListener('click', () => {
      g.querySelectorAll('.hidden-card').forEach((c, i) => {
        setTimeout(() => { c.classList.add('visible'); c.classList.remove('hidden-card'); }, i * 80);
      });
      moreWrap.style.display = 'none';
      initScrollReveal();
    });
  }
}

/* ── Projects ──────────────────────────────────────────── */
function renderProjects() {
  const g = document.getElementById('projects-grid');
  if (!g) return;
  g.innerHTML = S.projects.map((p, i) => `
    <div class="card proj-card ${i >= S.PROJ_INIT ? 'hidden-card' : 'reveal'}">
      <div class="proj-head">
        <h3 class="proj-name">${p.title}</h3>
        <span class="proj-status s-${p.status.toLowerCase()}">${p.status}</span>
      </div>
      <p class="proj-desc">${p.description}</p>
      <div class="proj-tech">${p.tech.map(t => `<span class="tech-pill">${t}</span>`).join('')}</div>
      <a href="${p.link}" class="proj-link" target="_blank" rel="noopener">View project →</a>
      <span class="proj-yr">${p.year}</span>
    </div>`).join('');
  initScrollReveal();

  const mw = document.getElementById('more-proj-wrap');
  if (S.projects.length > S.PROJ_INIT && mw) {
    mw.style.display = 'block';
    document.getElementById('more-proj-btn')?.addEventListener('click', () => {
      g.querySelectorAll('.hidden-card').forEach((c, i) => {
        setTimeout(() => { c.classList.add('visible'); c.classList.remove('hidden-card'); }, i * 80);
      });
      mw.style.display = 'none';
      initScrollReveal();
    });
  }
}

/* ── Experience ────────────────────────────────────────── */
function renderExperience() {
  const el = document.getElementById('exp-timeline');
  if (!el) return;
  el.innerHTML = S.experience.map(x => `
    <div class="tl-item reveal">
      <div class="tl-dot"></div>
      <div class="tl-year">${x.year}</div>
      <h3 class="tl-title">${x.title}</h3>
      <p class="tl-company">${x.company}</p>
      <p class="tl-desc">${x.description}</p>
    </div>`).join('');
  initScrollReveal();
}

/* ── Reviews ───────────────────────────────────────────── */
function renderReviews() {
  const g = document.getElementById('reviews-grid');
  if (!g) return;
  g.innerHTML = S.reviews.map((r, i) => `
    <div class="card card-p review-card ${i >= S.REV_INIT ? 'hidden-card' : 'reveal'}">
      <p class="review-txt">${r.text}</p>
      <div class="review-author">
        <div class="rev-av">${r.avatar}</div>
        <div><div class="rev-name">${r.name}</div><div class="rev-role">${r.role}</div></div>
      </div>
    </div>`).join('');
  initScrollReveal();

  const mw = document.getElementById('more-rev-wrap');
  if (S.reviews.length > S.REV_INIT && mw) {
    mw.style.display = 'block';
    document.getElementById('more-rev-btn')?.addEventListener('click', () => {
      g.querySelectorAll('.hidden-card').forEach((c, i) => {
        setTimeout(() => { c.classList.add('visible'); c.classList.remove('hidden-card'); }, i * 80);
      });
      mw.style.display = 'none';
      initScrollReveal();
    });
  }
}

/* ── Skills ────────────────────────────────────────────── */
function renderSkills(id) {
  const g = document.getElementById(id);
  if (!g || !S.skills.length) return;
  const cm = { pink:'c-pink', purple:'c-purple', blue:'c-blue', teal:'c-teal' };
  g.innerHTML = S.skills.map(s => `
    <div class="skill-card ${cm[s.color]||'c-blue'} reveal">
      <span class="sk-icon">${s.icon}</span>
      <h3 class="sk-title">${s.category}</h3>
      <ul class="sk-list">${s.items.map(i => `<li>${i}</li>`).join('')}</ul>
    </div>`).join('');
  initScrollReveal();
}

/* ── Currently ─────────────────────────────────────────── */
function renderCurrently() {
  const g = document.getElementById('currently-grid');
  if (!g || !Object.keys(S.currently).length) return;
  g.innerHTML = Object.values(S.currently).map(c => `
    <div class="card currently-card reveal">
      <span class="c-icon">${c.icon}</span>
      <div class="c-label">${c.label}</div>
      <div class="c-value">${c.value}</div>
    </div>`).join('');
  initScrollReveal();
}

/* ── Late Night Thoughts ───────────────────────────────── */
function initLNT() {
  const el   = document.getElementById('lnt-thought');
  const btn  = document.getElementById('lnt-btn');
  const dots = document.getElementById('lnt-dots');
  if (!el || !S.lateNightThoughts.length) return;

  S.lntIndex = Math.floor(Math.random() * S.lateNightThoughts.length);
  el.textContent = S.lateNightThoughts[S.lntIndex];

  if (dots) {
    dots.innerHTML = S.lateNightThoughts.map((_, i) =>
      `<span class="lnt-dot ${i === S.lntIndex ? 'active' : ''}" data-i="${i}"></span>`
    ).join('');
    dots.querySelectorAll('.lnt-dot').forEach(d =>
      d.addEventListener('click', () => showThought(parseInt(d.dataset.i)))
    );
  }

  if (btn) btn.addEventListener('click', () => showThought((S.lntIndex + 1) % S.lateNightThoughts.length));

  // Auto-rotate every 9 seconds
  setInterval(() => showThought((S.lntIndex + 1) % S.lateNightThoughts.length), 9000);
}

function showThought(idx) {
  const el   = document.getElementById('lnt-thought');
  const dots = document.getElementById('lnt-dots');
  if (!el) return;
  el.classList.add('fade-out');
  setTimeout(() => {
    S.lntIndex = idx;
    el.textContent = S.lateNightThoughts[S.lntIndex];
    el.classList.remove('fade-out');
    el.classList.add('fade-in');
    setTimeout(() => el.classList.remove('fade-in'), 450);
    if (dots) dots.querySelectorAll('.lnt-dot').forEach((d, i) =>
      d.classList.toggle('active', i === S.lntIndex)
    );
  }, 330);
}

/* ── Support ───────────────────────────────────────────── */
function initSupportSection() {
  document.querySelectorAll('.upi-row[data-copy]').forEach(el => {
    el.addEventListener('click', () => copyText(el.dataset.copy, 'UPI ID copied!'));
    el.setAttribute('tabindex', '0');
    el.addEventListener('keydown', e => { if (e.key === 'Enter') copyText(el.dataset.copy, 'UPI ID copied!'); });
  });
  const cb = document.getElementById('coffee-btn');
  if (cb) cb.addEventListener('click', () => window.open('https://buymeacoffee.com/rashqyiiiiee', '_blank', 'noopener'));
}

/* ── Contact form ──────────────────────────────────────── */
function initContactForm(fid, mid) {
  const form = document.getElementById(fid);
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn  = form.querySelector('[type="submit"]');
    const msg  = document.getElementById(mid);
    const orig = btn.textContent;
    btn.textContent = 'Sending…'; btn.disabled = true;
    setTimeout(() => {
      if (msg) { msg.className = 'form-notice ok'; msg.textContent = '✓ Message received. I\'ll be in touch soon.'; }
      toast('Message sent!', '✉️');
      form.reset(); btn.textContent = orig; btn.disabled = false;
      if (msg) setTimeout(() => { msg.className = 'form-notice'; }, 5000);
    }, 1300);
  });
}

/* ── Newsletter ────────────────────────────────────────── */
function initNewsletter(fid) {
  const form = document.getElementById(fid);
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const inp  = form.querySelector('input[type="email"]');
    const btn  = form.querySelector('button[type="submit"]');
    if (!inp || !inp.value.trim()) return;
    const orig = btn.textContent;
    btn.textContent = '✓ You\'re in'; btn.disabled = true;
    toast('Welcome to the quiet corner 🌙', '✦');
    inp.value = '';
    setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 2800);
  });
}

/* ════════════════════════════════════════════════════════════
   BLOG PAGE
   ════════════════════════════════════════════════════════════ */
function initBlogPage() {
  renderFeaturedBlogs();
  renderBlogListing();
  initBlogSearch();
  initBlogFilters();
  initBlogMoreBtn();
}

function getFilteredBlogs() {
  return S.blogs.filter(b => {
    const matchFilter = S.currentFilter === 'all' || b.category === S.currentFilter || (b.tags || []).includes(S.currentFilter);
    const q = S.searchQuery.trim().toLowerCase();
    const matchSearch = !q || b.title.toLowerCase().includes(q) || b.preview.toLowerCase().includes(q) || (b.tags || []).some(t => t.includes(q));
    return matchFilter && matchSearch;
  });
}

function renderFeaturedBlogs() {
  const g = document.getElementById('featured-grid');
  if (!g) return;
  const featured = S.blogs.filter(b => b.featured);
  if (!featured.length) { document.getElementById('featured-section')?.remove(); return; }
  g.innerHTML = featured.map(b => blogCardHTML(b, 'featured-card reveal')).join('');
  attachCardListeners(g);
  initScrollReveal();
}

function renderBlogListing() {
  const g = document.getElementById('blog-list-grid');
  if (!g) return;
  const list = getFilteredBlogs();

  if (!list.length) {
    g.innerHTML = `<div class="no-results" style="grid-column:1/-1">nothing here yet.<br/>maybe later tonight.</div>`;
    document.getElementById('more-list-wrap')?.style.setProperty('display', 'none');
    return;
  }

  g.innerHTML = list.map((b, i) => blogCardHTML(b, i >= S.BLOG_INIT ? 'hidden-card' : 'reveal')).join('');
  attachCardListeners(g);
  initScrollReveal();

  const mw = document.getElementById('more-list-wrap');
  if (mw) mw.style.display = list.length > S.BLOG_INIT ? 'block' : 'none';
}

function initBlogSearch() {
  const input = document.getElementById('blog-search');
  if (!input) return;
  let timer;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      S.searchQuery = input.value;
      S.BLOG_INIT   = 4; // reset pagination on search
      renderBlogListing();
      initBlogMoreBtn();
    }, 220);
  });
}

function initBlogFilters() {
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      S.currentFilter = tab.dataset.filter;
      S.BLOG_INIT = 4;
      renderBlogListing();
      initBlogMoreBtn();
    });
  });
}

function initBlogMoreBtn() {
  const btn = document.getElementById('more-list-btn');
  if (!btn) return;
  // Remove old listener by cloning
  const fresh = btn.cloneNode(true);
  btn.parentNode.replaceChild(fresh, btn);
  fresh.addEventListener('click', () => {
    const g = document.getElementById('blog-list-grid');
    if (!g) return;
    g.querySelectorAll('.hidden-card').forEach((c, i) => {
      setTimeout(() => { c.classList.add('visible'); c.classList.remove('hidden-card'); }, i * 80);
    });
    document.getElementById('more-list-wrap')?.style.setProperty('display', 'none');
    initScrollReveal();
  });
}

/* ════════════════════════════════════════════════════════════
   POST PAGE
   ════════════════════════════════════════════════════════════ */
function initPostPage() {
  const id   = parseInt(new URLSearchParams(location.search).get('id'));
  const blog = S.blogs.find(b => b.id === id);
  const area = document.getElementById('post-area');

  if (!blog) {
    if (area) area.innerHTML = `<div style="text-align:center;padding:80px 0;color:var(--text-m)">
      <div style="font-size:32px;margin-bottom:12px;opacity:.4">◌</div>
      <p style="font-size:14px">Post not found. <a href="blog.html" style="color:var(--a-blue)">Browse all →</a></p>
    </div>`;
    return;
  }

  document.title = `${blog.title} — Rashqyiiiiee`;
  renderPost(blog);
  renderComments(id);
  initCommentForm(id);
}

function renderPost(blog) {
  const area = document.getElementById('post-area');
  if (!area) return;
  const liked = S.likes[blog.id];
  const count = liked ? blog.likes + 1 : blog.likes;

  area.innerHTML = `
    <div class="post-meta-row">
      <span class="blog-cat">${blog.category}</span>
      <span class="blog-date-sm">${blog.date}</span>
      <span class="read-time">◷ ${blog.readTime}</span>
    </div>
    <h1 class="post-title">${blog.title}</h1>
    <p class="post-lede">${blog.preview}</p>
    <div class="post-div"></div>
    <div class="post-body">${blog.content}</div>
    <div class="post-like-bar">
      <button class="like-btn ${liked?'liked':''}" id="post-like-btn" data-id="${blog.id}"
        style="font-size:15px;gap:9px;padding:9px 18px;border:1px solid var(--border);border-radius:30px;">
        <span class="heart" style="font-size:18px">${liked?'❤️':'🤍'}</span>
        <span class="like-count">${count}</span>
        <span style="font-size:13px;color:var(--text-m)">likes</span>
      </button>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${(blog.tags||[]).map(t => `<span class="tag">#${t}</span>`).join('')}
      </div>
    </div>
    <div class="share-box">
      <div class="share-lbl">Share this post</div>
      <div class="share-row" id="share-row"></div>
    </div>`;

  const lb = document.getElementById('post-like-btn');
  if (lb) lb.addEventListener('click', () => toggleLike(blog.id, lb));
  buildShareBtns(blog);
}

function buildShareBtns(blog) {
  const row = document.getElementById('share-row');
  if (!row) return;
  const url = encodeURIComponent(location.href);
  const txt = encodeURIComponent(`${blog.title} — RashYaps`);
  [
    { cls:'tw', icon:'𝕏',  label:'Twitter',   fn:()=>window.open(`https://twitter.com/intent/tweet?text=${txt}&url=${url}`,'_blank','noopener') },
    { cls:'fb', icon:'f',  label:'Facebook',  fn:()=>window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`,'_blank','noopener') },
    { cls:'wa', icon:'💬', label:'WhatsApp',  fn:()=>window.open(`https://wa.me/?text=${txt}%20${url}`,'_blank','noopener') },
    { cls:'dc', icon:'◈',  label:'Discord',   fn:()=>copyText(location.href,'Link copied!') },
    { cls:'ig', icon:'◎',  label:'Instagram', fn:()=>copyText(location.href,'Link copied — share on Instagram!') },
    { cls:'cp', icon:'⧉',  label:'Copy link', fn:()=>copyText(location.href,'Link copied!') },
  ].forEach(b => {
    const btn = document.createElement('button');
    btn.className = `share-pill ${b.cls}`;
    btn.innerHTML = `<span style="font-size:14px">${b.icon}</span>${b.label}`;
    btn.addEventListener('click', b.fn);
    row.appendChild(btn);
  });
}

/* ── Comments ─────────────────────────────────────────── */
function renderComments(postId) {
  const list  = document.getElementById('comment-list');
  const badge = document.getElementById('c-count-badge');
  if (!list) return;
  const arr = S.comments[postId] || [];
  if (badge) badge.textContent = `${arr.length} comment${arr.length !== 1 ? 's' : ''}`;
  if (!arr.length) {
    list.innerHTML = `<div class="no-comments">No comments yet.<br/>Be the first to leave a thought ✦</div>`;
    return;
  }
  list.innerHTML = arr.map((c, i) => `
    <div class="c-item" style="animation:fadeUp .4s ease ${i*.07}s both">
      <div class="c-head">
        <div class="c-av">${esc(c.name).slice(0,2).toUpperCase()}</div>
        <span class="c-name">${esc(c.name)}</span>
        <div class="c-meta">
          <span class="c-date">${c.date}</span>
          ${i === 0 ? '<span class="c-new">new</span>' : ''}
        </div>
      </div>
      <p class="c-text">${esc(c.message)}</p>
    </div>`).join('');
}

function initCommentForm(postId) {
  const form = document.getElementById('comment-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = form.querySelector('#c-name').value.trim();
    const msg  = form.querySelector('#c-msg').value.trim();
    if (!name || !msg) { toast('Name and message are required.', '⚠'); return; }
    const now = new Date();
    if (!S.comments[postId]) S.comments[postId] = [];
    S.comments[postId].unshift({
      name, message: msg,
      date: now.toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric'}),
      timestamp: now.getTime()
    });
    saveComments();
    renderComments(postId);
    form.reset();
    toast('Comment posted ✦', '💬');
    document.getElementById('comment-list')?.scrollIntoView({ behavior:'smooth', block:'start' });
  });
}

/* ════════════════════════════════════════════════════════════
   ABOUT PAGE
   ════════════════════════════════════════════════════════════ */
function initAboutPage() {
  renderSkills('skills-grid-about');
  initStoryNav();
}

function initStoryNav() {
  const items    = document.querySelectorAll('.sn-item');
  const chapters = document.querySelectorAll('.story-chapter');
  if (!items.length || !chapters.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) items.forEach(it => it.classList.toggle('on', it.dataset.target === e.target.id));
    });
  }, { threshold: 0.35 });
  chapters.forEach(ch => obs.observe(ch));
  items.forEach(it => it.addEventListener('click', () =>
    document.getElementById(it.dataset.target)?.scrollIntoView({ behavior:'smooth', block:'start' })
  ));
}

/* ════════════════════════════════════════════════════════════
   CONTACT PAGE
   ════════════════════════════════════════════════════════════ */
function initContactPage() {
  initContactForm('cp-form', 'cp-msg');
  initNewsletter('cp-nl-form');
  initSupportSection();
}

/* ── Helper ──────────────────────────────────────────────── */
function esc(s) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(String(s)));
  return d.innerHTML;
}

/* ── Lazy images ─────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const imgs = document.querySelectorAll('img[data-src]');
  if ('IntersectionObserver' in window) {
    const lo = new IntersectionObserver(es => {
      es.forEach(e => { if (e.isIntersecting) { e.target.src = e.target.dataset.src; lo.unobserve(e.target); } });
    });
    imgs.forEach(img => lo.observe(img));
  } else {
    imgs.forEach(img => { img.src = img.dataset.src; });
  }
});
