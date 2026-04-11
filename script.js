/* ============================================================
   RashYaps — script.js  v3 (Premium Polish)
   ============================================================ */
'use strict';

/* ─── State ──────────────────────────────────────────────── */
const S = {
  blogs:[], projects:[], experience:[],
  reviews:[], skills:[], comments:{}, likes:{}
};

/* ─── Boot ───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  initVeil();
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

/* ─── Data ───────────────────────────────────────────────── */
async function loadData() {
  try {
    const r    = await fetch('data.json');
    const data = await r.json();
    S.blogs      = data.blogs      || [];
    S.projects   = data.projects   || [];
    S.experience = data.experience || [];
    S.reviews    = data.reviews    || [];
    S.skills     = data.skills     || [];
    S.likes      = JSON.parse(localStorage.getItem('ry_likes')    || '{}');
    const stored = JSON.parse(localStorage.getItem('ry_comments') || '{}');
    const seed   = data.comments || {};
    const keys   = new Set([...Object.keys(seed), ...Object.keys(stored)]);
    keys.forEach(k => { S.comments[k] = stored[k] || seed[k] || []; });
  } catch(e) { console.warn('data.json load failed:', e); }
}
function saveLikes()    { localStorage.setItem('ry_likes',    JSON.stringify(S.likes));    }
function saveComments() { localStorage.setItem('ry_comments', JSON.stringify(S.comments)); }

/* ─── Page veil ──────────────────────────────────────────── */
function initVeil() {
  const v = document.getElementById('page-veil');
  if (v) setTimeout(() => v.classList.remove('show'), 60);
}

/* ─── Navbar ─────────────────────────────────────────────── */
function initNavbar() {
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  const update = () => nav.classList.toggle('stuck', window.scrollY > 24);
  window.addEventListener('scroll', update, { passive: true });
  update();
  // Active link highlight
  const path = location.pathname.split('/').pop() || 'index.html';
  nav.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href').split('#')[0];
    if (href === path || (path === '' && href === 'index.html')) a.classList.add('active');
  });
}

/* ─── Mobile nav ─────────────────────────────────────────── */
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const mob    = document.querySelector('.mobile-nav');
  const close  = document.querySelector('.mobile-nav-close');
  if (!toggle || !mob) return;

  const open  = () => { mob.classList.add('open');  toggle.classList.add('open');  document.body.style.overflow='hidden'; };
  const shut  = () => { mob.classList.remove('open');toggle.classList.remove('open');document.body.style.overflow=''; };

  toggle.addEventListener('click', () => mob.classList.contains('open') ? shut() : open());
  if (close) close.addEventListener('click', shut);
  mob.querySelectorAll('a').forEach(a => a.addEventListener('click', shut));
}

/* ─── Scroll reveal ──────────────────────────────────────── */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal:not(.in)');
  if (!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -36px 0px' });
  els.forEach(el => obs.observe(el));
}

/* ─── Page links (transition) ────────────────────────────── */
function initPageLinks() {
  const v = document.getElementById('page-veil');
  document.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel') || href.startsWith('upi')) return;
    a.addEventListener('click', e => {
      if (e.metaKey||e.ctrlKey||e.shiftKey||e.altKey) return;
      e.preventDefault();
      if (!v) { location.href = href; return; }
      v.classList.add('show');
      setTimeout(() => location.href = href, 280);
    });
  });
}

/* ─── Toast ──────────────────────────────────────────────── */
function toast(msg, icon = '✦') {
  const old = document.querySelector('.toast');
  if (old) old.remove();
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<span style="font-size:16px">${icon}</span><span>${msg}</span>`;
  document.body.appendChild(t);
  requestAnimationFrame(() => { requestAnimationFrame(() => t.classList.add('show')); });
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 320); }, 2900);
}

/* ─── Clipboard ──────────────────────────────────────────── */
async function copyToClipboard(text, msg = 'Copied!') {
  try { await navigator.clipboard.writeText(text); toast(msg, '📋'); }
  catch { toast('Copy manually: ' + text, '⚠'); }
}

/* ─── Like toggle ────────────────────────────────────────── */
function toggleLike(id, btn) {
  S.likes[id] = !S.likes[id];
  saveLikes();
  const blog  = S.blogs.find(b => b.id == id);
  const count = btn.querySelector('.like-count');
  const heart = btn.querySelector('.heart');
  if (S.likes[id]) {
    btn.classList.add('liked');
    heart.textContent = '❤️';
    if (count) count.textContent = blog.likes + 1;
    btn.style.transform = 'scale(1.18)';
    setTimeout(() => btn.style.transform = '', 200);
  } else {
    btn.classList.remove('liked');
    heart.textContent = '🤍';
    if (count) count.textContent = blog.likes;
  }
}

/* ─── Blog card HTML ─────────────────────────────────────── */
function blogCardHTML(blog) {
  const liked = S.likes[blog.id];
  const count = liked ? blog.likes + 1 : blog.likes;
  return `<article class="blog-card reveal" data-id="${blog.id}" role="button" tabindex="0" aria-label="Read: ${blog.title}">
    <div class="blog-card-top">
      <span class="blog-cat">${blog.category}</span>
      <span class="blog-date-sm">${blog.date}</span>
    </div>
    <h3 class="blog-title-card">${blog.title}</h3>
    <p class="blog-preview-text">${blog.preview}</p>
    <div class="blog-card-bottom">
      <span class="read-time">◷ ${blog.readTime}</span>
      <button class="like-btn ${liked?'liked':''}" data-id="${blog.id}" aria-label="Like this post">
        <span class="heart">${liked?'❤️':'🤍'}</span>
        <span class="like-count">${count}</span>
      </button>
    </div>
  </article>`;
}

function attachCardListeners(el) {
  el.querySelectorAll('.blog-card').forEach(card => {
    const id = card.dataset.id;
    const navigate = e => { if (!e.target.closest('.like-btn')) location.href = `post.html?id=${id}`; };
    card.addEventListener('click', navigate);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') navigate(e); });
    const lb = card.querySelector('.like-btn');
    if (lb) lb.addEventListener('click', e => { e.stopPropagation(); toggleLike(id, lb); });
  });
}

/* ═══════════════════════════════════════════════════════════
   INDEX PAGE
   ═══════════════════════════════════════════════════════════ */
function initIndex() {
  renderIndexBlogs();
  renderProjects();
  renderExperience();
  renderReviews();
  renderSkills('skills-grid');
  initSupportSection();
  initContactForm('cf-form', 'cf-msg');
  initNewsletter('nl-form');
}

function renderIndexBlogs() {
  const g = document.getElementById('blog-grid');
  if (!g) return;
  g.innerHTML = S.blogs.slice(0,6).map(blogCardHTML).join('');
  attachCardListeners(g);
  initScrollReveal();
}

function renderProjects() {
  const g = document.getElementById('projects-grid');
  if (!g) return;
  g.innerHTML = S.projects.map(p => `
    <div class="project-card reveal">
      <div class="project-head">
        <h3 class="project-name">${p.title}</h3>
        <span class="project-status s-${p.status.toLowerCase()}">${p.status}</span>
      </div>
      <p class="project-desc">${p.description}</p>
      <div class="project-tech">${p.tech.map(t=>`<span class="tech-pill">${t}</span>`).join('')}</div>
      <a href="${p.link}" class="project-link" target="_blank" rel="noopener">View project →</a>
      <span class="project-yr">${p.year}</span>
    </div>`).join('');
  initScrollReveal();
}

function renderExperience() {
  const el = document.getElementById('experience-timeline');
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

function renderReviews() {
  const g = document.getElementById('reviews-grid');
  if (!g) return;
  g.innerHTML = S.reviews.map(r => `
    <div class="card card-padded review-card reveal">
      <p class="review-text">${r.text}</p>
      <div class="review-author">
        <div class="review-av">${r.avatar}</div>
        <div><div class="review-name">${r.name}</div><div class="review-role">${r.role}</div></div>
      </div>
    </div>`).join('');
  initScrollReveal();
}

function renderSkills(containerId) {
  const g = document.getElementById(containerId);
  if (!g || !S.skills.length) return;
  const colorMap = { pink:'c-pink', purple:'c-purple', blue:'c-blue', teal:'c-teal' };
  g.innerHTML = S.skills.map(s => `
    <div class="skill-card ${colorMap[s.color]||'c-blue'} reveal">
      <span class="skill-icon">${s.icon}</span>
      <h3 class="skill-title">${s.category}</h3>
      <ul class="skill-list">
        ${s.items.map(i=>`<li>${i}</li>`).join('')}
      </ul>
    </div>`).join('');
  initScrollReveal();
}

/* ─── Support section ─────────────────────────────────────── */
function initSupportSection() {
  // UPI deep link
  const upiBtn = document.getElementById('upi-pay-btn');
  if (upiBtn) {
    upiBtn.addEventListener('click', () => {
      const upiLink = 'upi://pay?pa=rashyaps@upi&pn=RashYaps&cu=INR';
      const anchor  = document.createElement('a');
      anchor.href   = upiLink;
      anchor.click();
      setTimeout(() => {
        toast('If the app didn\'t open, copy the UPI ID manually.', '🇮🇳');
      }, 900);
    });
  }
  // UPI ID row copy
  document.querySelectorAll('.upi-row[data-copy]').forEach(el => {
    el.addEventListener('click', () => copyToClipboard(el.dataset.copy, 'UPI ID copied!'));
  });
  // Coffee button
  const coffeeBtn = document.getElementById('coffee-btn');
  if (coffeeBtn) coffeeBtn.addEventListener('click', () => window.open('https://buymeacoffee.com/rashyaps', '_blank', 'noopener'));
}

/* ─── Contact form ───────────────────────────────────────── */
function initContactForm(formId, msgId) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn  = form.querySelector('[type="submit"]');
    const msg  = document.getElementById(msgId);
    const orig = btn.textContent;
    btn.textContent = 'Sending…'; btn.disabled = true;
    setTimeout(() => {
      if (msg) { msg.className = 'form-notice ok'; msg.textContent = '✓ Message received. I\'ll get back to you soon.'; }
      toast('Message sent!', '✉️');
      form.reset(); btn.textContent = orig; btn.disabled = false;
      if (msg) setTimeout(() => msg.className = 'form-notice', 4500);
    }, 1300);
  });
}

/* ─── Newsletter ─────────────────────────────────────────── */
function initNewsletter(formId) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    const btn   = form.querySelector('button[type="submit"]');
    if (!input || !input.value.trim()) return;
    const orig = btn.textContent;
    btn.textContent = '✓ You\'re in'; btn.disabled = true;
    toast('Welcome to the quiet corner 🌙', '✦');
    input.value = '';
    setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 2800);
  });
}

/* ═══════════════════════════════════════════════════════════
   BLOG PAGE
   ═══════════════════════════════════════════════════════════ */
function initBlogPage() {
  renderBlogListing('all');
  document.querySelectorAll('.filter-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderBlogListing(btn.dataset.filter);
    });
  });
}

function renderBlogListing(filter) {
  const g = document.getElementById('blog-list-grid');
  if (!g) return;
  const list = filter === 'all' ? S.blogs : S.blogs.filter(b => b.category.toLowerCase() === filter.toLowerCase());
  if (!list.length) {
    g.innerHTML = `<div class="no-comments" style="grid-column:1/-1">No posts in this category yet.</div>`;
    return;
  }
  g.innerHTML = list.map(blogCardHTML).join('');
  attachCardListeners(g);
  initScrollReveal();
}

/* ═══════════════════════════════════════════════════════════
   POST PAGE
   ═══════════════════════════════════════════════════════════ */
function initPostPage() {
  const id   = parseInt(new URLSearchParams(location.search).get('id'));
  const blog = S.blogs.find(b => b.id === id);
  if (!blog) {
    const area = document.getElementById('post-area');
    if (area) area.innerHTML = `<div style="text-align:center;padding:80px 0;color:var(--text-muted)"><div style="font-size:40px;margin-bottom:16px">◌</div><p>Post not found. <a href="blog.html" style="color:var(--accent-blue)">Browse all →</a></p></div>`;
    return;
  }
  document.title = `${blog.title} — RashYaps`;
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
    <div class="post-header">
      <div class="post-meta-row">
        <span class="blog-cat">${blog.category}</span>
        <span class="blog-date-sm">${blog.date}</span>
        <span class="read-time">◷ ${blog.readTime}</span>
      </div>
      <h1 class="post-title">${blog.title}</h1>
      <p class="post-lede">${blog.preview}</p>
    </div>
    <div class="post-divider"></div>
    <div class="post-body">${blog.content}</div>

    <div class="post-like-bar">
      <button class="like-btn ${liked?'liked':''}" id="post-like-btn" data-id="${blog.id}"
        style="font-size:15px;gap:9px;padding:9px 18px;border:1px solid var(--border);border-radius:30px;">
        <span class="heart" style="font-size:18px">${liked?'❤️':'🤍'}</span>
        <span class="like-count">${count}</span>
        <span style="font-size:13px;color:var(--text-muted)">likes</span>
      </button>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${blog.tags.map(t=>`<span class="tag">#${t}</span>`).join('')}
      </div>
    </div>

    <div class="share-section">
      <div class="share-label">Share this post</div>
      <div class="share-row" id="share-row"></div>
    </div>`;

  // Like
  const lb = document.getElementById('post-like-btn');
  if (lb) lb.addEventListener('click', () => toggleLike(blog.id, lb));

  // Share buttons
  buildShareButtons(blog);
}

function buildShareButtons(blog) {
  const row  = document.getElementById('share-row');
  if (!row) return;
  const url  = encodeURIComponent(location.href);
  const txt  = encodeURIComponent(blog.title + ' by @RashYaps');

  const btns = [
    { cls:'tw', icon:'𝕏',  label:'Twitter / X', fn:()=> window.open(`https://twitter.com/intent/tweet?text=${txt}&url=${url}`,'_blank','noopener') },
    { cls:'fb', icon:'f',  label:'Facebook',    fn:()=> window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`,'_blank','noopener') },
    { cls:'wa', icon:'💬', label:'WhatsApp',    fn:()=> window.open(`https://wa.me/?text=${txt}%20${url}`,'_blank','noopener') },
    { cls:'dc', icon:'◈',  label:'Discord',     fn:()=> copyToClipboard(location.href,'Link copied — paste in Discord!') },
    { cls:'ig', icon:'◎',  label:'Instagram',   fn:()=> copyToClipboard(location.href,'Link copied — share on Instagram!') },
    { cls:'cp', icon:'⧉',  label:'Copy link',   fn:()=> copyToClipboard(location.href,'Link copied!') },
  ];
  row.innerHTML = '';
  btns.forEach(b => {
    const btn = document.createElement('button');
    btn.className = `share-pill ${b.cls}`;
    btn.innerHTML = `<span class="share-icon">${b.icon}</span>${b.label}`;
    btn.addEventListener('click', b.fn);
    row.appendChild(btn);
  });
}

/* ─── Comments ───────────────────────────────────────────── */
function renderComments(postId) {
  const list  = document.getElementById('comment-list');
  const badge = document.getElementById('comments-count-badge');
  if (!list) return;
  const arr = S.comments[postId] || [];
  if (badge) badge.textContent = `${arr.length} comment${arr.length !== 1 ? 's' : ''}`;
  if (!arr.length) { list.innerHTML = `<div class="no-comments">No comments yet.<br/>Be the first to leave a thought ✦</div>`; return; }
  list.innerHTML = arr.map((c,i) => `
    <div class="comment-item">
      <div class="comment-head">
        <div class="c-av">${escHTML(c.name).slice(0,2).toUpperCase()}</div>
        <span class="c-name">${escHTML(c.name)}</span>
        <div class="c-meta">
          <span class="c-date">${c.date}</span>
          ${i===0 ? '<span class="c-new">new</span>' : ''}
        </div>
      </div>
      <p class="c-text">${escHTML(c.message)}</p>
    </div>`).join('');
}

function initCommentForm(postId) {
  const form = document.getElementById('comment-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = form.querySelector('#c-name').value.trim();
    const msg  = form.querySelector('#c-message').value.trim();
    if (!name || !msg) { toast('Name and message are required.','⚠'); return; }
    const now = new Date();
    const comment = {
      name, message: msg,
      date: now.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}),
      timestamp: now.getTime()
    };
    if (!S.comments[postId]) S.comments[postId] = [];
    S.comments[postId].unshift(comment);
    saveComments();
    renderComments(postId);
    form.reset();
    toast('Comment posted ✦','💬');
    document.getElementById('comment-list')?.scrollIntoView({behavior:'smooth',block:'start'});
  });
}

/* ═══════════════════════════════════════════════════════════
   ABOUT PAGE
   ═══════════════════════════════════════════════════════════ */
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
      if (e.isIntersecting) {
        const id = e.target.id;
        items.forEach(it => it.classList.toggle('on', it.dataset.target === id));
      }
    });
  }, { threshold: 0.35 });
  chapters.forEach(ch => obs.observe(ch));
  items.forEach(it => it.addEventListener('click', () => {
    document.getElementById(it.dataset.target)?.scrollIntoView({behavior:'smooth',block:'start'});
  }));
}

/* ═══════════════════════════════════════════════════════════
   CONTACT PAGE
   ═══════════════════════════════════════════════════════════ */
function initContactPage() {
  initContactForm('cp-contact-form', 'cp-contact-msg');
  initNewsletter('cp-newsletter-form');
  initSupportSection();
}

/* ─── Helpers ────────────────────────────────────────────── */
function escHTML(str) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(String(str)));
  return d.innerHTML;
}

/* ─── Lazy images ────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  if ('loading' in HTMLImageElement.prototype) {
    document.querySelectorAll('img[data-src]').forEach(img => { img.src = img.dataset.src; });
  } else {
    const lo = new IntersectionObserver(es => {
      es.forEach(e => { if (e.isIntersecting) { e.target.src = e.target.dataset.src; lo.unobserve(e.target); } });
    });
    document.querySelectorAll('img[data-src]').forEach(img => lo.observe(img));
  }
});
