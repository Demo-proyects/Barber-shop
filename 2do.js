/* ─── SHARED UTILITIES ──────────────────────────────────────── */
const UI = {
  $: id => document.getElementById(id),
  $$: sel => [...document.querySelectorAll(sel)],
  on: (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts),
  cls: (el, ...c) => el && el.classList.add(...c),
  rem: (el, ...c) => el && el.classList.remove(...c),
  tog: (el, c, force) => el && el.classList.toggle(c, force),
  show: el => el && el.classList.remove('hidden'),
  hide: el => el && el.classList.add('hidden'),
  html: (el, str) => el && (el.innerHTML = str)
};

/* Smooth scroll helper */
function smoothTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

/* ─── NAV ───────────────────────────────────────────────────── */
function openNav() {
  UI.cls(UI.$('ax-nav'), 'open');
  UI.cls(UI.$('ax-nav-backdrop'), 'open');
  UI.cls(UI.$('ax-burger'), 'open');
  document.body.style.overflow = 'hidden';
}
function closeNav() {
  UI.rem(UI.$('ax-nav'), 'open');
  UI.rem(UI.$('ax-nav-backdrop'), 'open');
  UI.rem(UI.$('ax-burger'), 'open');
  document.body.style.overflow = '';
}
UI.on(UI.$('ax-nav-backdrop'), 'click', closeNav);

/* Scrolled header */
window.addEventListener('scroll', () => {
  UI.tog(UI.$('ax-header'), 'scrolled', window.scrollY > 40);
}, { passive: true });

/* ─── HERO SLIDESHOW ────────────────────────────────────────── */
(function () {
  const SLIDES = 4;
  const DURATION = 5000;
  let cur = 0, timer, progAnim;

  const dots = UI.$$('.hero-dot');
  const fill = UI.$('hero-progress-fill');

  function goTo(i) {
    UI.rem(document.getElementById('hs-' + cur), 'active');
    UI.rem(dots[cur], 'active');
    cur = i;
    UI.cls(document.getElementById('hs-' + cur), 'active');
    UI.cls(dots[cur], 'active');
    animProgress();
  }

  function animProgress() {
    fill.style.transition = 'none';
    fill.style.width = '0%';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      fill.style.transition = `width ${DURATION}ms linear`;
      fill.style.width = '100%';
    }));
  }

  function next() { goTo((cur + 1) % SLIDES); }

  function start() {
    clearInterval(timer);
    timer = setInterval(next, DURATION);
    animProgress();
  }

  dots.forEach((d, i) => UI.on(d, 'click', () => { clearInterval(timer); goTo(i); start(); }));
  start();
})();

/* hero entrance removed */

/* scroll reveal removed */

/* ─── GALLERY ───────────────────────────────────────────────── */
(function () {
  const DATA = [
    { cat:'haircut', span:'tall', src:'img/pelo-1.jpg',     alt:'Classic Haircut' },
    { cat:'styling', span:'',     src:'img/styling-1.jpg',  alt:'Premium Styling' },
    { cat:'shaving', span:'',     src:'img/shaving-1.jpg',  alt:'Hot Shave'       },
    { cat:'trimming',span:'',     src:'img/trimming-1.jpg', alt:'Beard Trim'      },
    { cat:'haircut', span:'',     src:'img/pelo-2.jpg',     alt:'Fade Haircut'    },
    { cat:'shaving', span:'wide', src:'img/shaving-2.jpg',  alt:'Straight Razor'  },
    { cat:'styling', span:'',     src:'img/styling-2.jpg',  alt:'Hair Styling'    },
    { cat:'trimming',span:'',     src:'img/trimming-2.jpg', alt:'Shape Up'        },
    { cat:'haircut', span:'wide', src:'img/pelo-3.jpg',     alt:'Textured Cut'    },
    { cat:'trimming',span:'tall', src:'img/trimming-3.jpg', alt:'Beard Detail'    },
    { cat:'shaving', span:'',     src:'img/shaving-3.jpg',  alt:'Blade Shave'     },
    { cat:'haircut', span:'',     src:'img/pelo-4.jpg',     alt:'Crop Cut'        },
    { cat:'styling', span:'tall', src:'img/styling-3.jpg',  alt:'Pompadour'       },
    { cat:'shaving', span:'',     src:'img/shaving-4.jpg',  alt:'Wet Shave'       },
    { cat:'haircut', span:'',     src:'img/pelo-5.jpg',     alt:'Clean Cut'       },
    { cat:'trimming',span:'wide', src:'img/trimming-4.jpg', alt:'Full Groom'      },
    { cat:'styling', span:'',     src:'img/styling-4.jpg',  alt:'Textured Style'  },
    { cat:'haircut', span:'',     src:'img/pelo-6.jpg',     alt:'Mid Fade'        },
    { cat:'shaving', span:'tall', src:'img/shaving-5.jpg',  alt:'Classic Shave'   },
    { cat:'trimming',span:'',     src:'img/trimming-5.jpg', alt:'Line Up'         },
    { cat:'haircut', span:'',     src:'img/pelo-7.jpg',     alt:'Taper Fade'      },
    { cat:'styling', span:'wide', src:'img/styling-5.jpg',  alt:'Volume Styling'  },
    { cat:'trimming',span:'',     src:'img/trimming-6.jpg', alt:'Precision Trim'  },
    { cat:'haircut', span:'',     src:'img/pelo-8.jpg',     alt:'Skin Fade'       },
  ];

  const PER = 9;
  let vis = PER, filter = 'all', lbIdx = 0, lbData = [];

  const grid    = UI.$('gal-grid');
  const loadBtn = UI.$('gal-load-more');
  const lb      = UI.$('gal-lb');
  const lbImg   = UI.$('gal-lb-img');

  function filtered() {
    return filter === 'all' ? [...DATA] : DATA.filter(d => d.cat === filter);
  }

  function render() {
    grid.innerHTML = '';
    lbData = filtered();
    lbData.slice(0, vis).forEach((d, i) => {
      const div = document.createElement('div');
      div.className = 'gal-item';
      if (filter === 'all') {
        if (d.span === 'tall') div.style.gridRow = 'span 2';
        if (d.span === 'wide') div.style.gridColumn = 'span 2';
      }
      div.innerHTML = `<img src="${d.src}" alt="${d.alt}" loading="lazy"/>
        <div class="gal-item-overlay"><span class="gal-item-cat">${d.cat}</span></div>`;
      UI.on(div, 'click', () => openLb(i));
      grid.appendChild(div);
      div.classList.add('animate-in');
      requestAnimationFrame(() => setTimeout(() => { div.classList.add('visible'); }, i * 45));
    });
    const done = vis >= lbData.length;
    loadBtn.textContent = done ? 'All loaded' : 'Load More';
    loadBtn.disabled = done;
  }

  /* Filters */
  UI.$$('.gal-filter-btn').forEach(btn => {
    UI.on(btn, 'click', function () {
      UI.$$('.gal-filter-btn').forEach(b => UI.rem(b, 'active'));
      UI.cls(this, 'active');
      filter = this.dataset.filter;
      vis = PER;
      render();
    });
  });

  UI.on(loadBtn, 'click', () => { vis += PER; render(); });

  /* Lightbox */
  function openLb(i) {
    lbIdx = i;
    UI.cls(lb, 'open');
    document.body.style.overflow = 'hidden';
    showSlide(i);
  }
  function closeLb() {
    UI.rem(lb, 'open');
    document.body.style.overflow = '';
    lbImg.src = '';
    UI.rem(lbImg, 'loaded');
  }
  function showSlide(i) {
    const d = lbData[i];
    if (!d) return;
    UI.rem(lbImg, 'loaded');
    lbImg.src = d.src;
    lbImg.alt = d.alt;
    lbImg.onload = () => UI.cls(lbImg, 'loaded');
    UI.$('gal-lb-cat').textContent = d.cat.charAt(0).toUpperCase() + d.cat.slice(1);
    UI.$('gal-lb-counter').textContent = `${i + 1} / ${lbData.length}`;
  }
  function nav(dir) {
    lbIdx = (lbIdx + dir + lbData.length) % lbData.length;
    showSlide(lbIdx);
  }

  UI.on(UI.$('gal-lb-prev'),  'click', () => nav(-1));
  UI.on(UI.$('gal-lb-next'),  'click', () => nav(1));
  UI.on(UI.$('gal-lb-close'), 'click', closeLb);
  UI.on(UI.$('gal-lb-bg'),    'click', closeLb);
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'ArrowLeft')  nav(-1);
    if (e.key === 'ArrowRight') nav(1);
    if (e.key === 'Escape')     closeLb();
  });

  render();
})();

/* ─── TEAM ──────────────────────────────────────────────────── */
(function () {
  const BARBERS = [
    { name:'Andrew W.',  img:'img/barbero-1.jpg', desc:'Over 10 years mastering classic tapers and straight-razor shaves. Specializes in vintage cuts with a modern edge.', yrs:10, clients:'2.9k', rating:'4.9' },
    { name:'Jake P.',    img:'img/barbero-2.jpg', desc:'Precision fade artist with 7 years of experience. Known for beard sculpting and skin-fade mastery.',                 yrs:7,  clients:'1.8k', rating:'4.8' },
    { name:'Enrique S.', img:'img/barbero-3.jpg', desc:'A legend in the chair with 12 years of cuts. Signature textured crops and old-school hot-towel finishes.',          yrs:12, clients:'3.4k', rating:'5.0' },
    { name:'Barbara L.', img:'img/barbero-4.jpg', desc:'9 years specializing in curly & textured hair. Precision styling with unmatched attention to detail.',               yrs:9,  clients:'2.6k', rating:'4.9' },
  ];

  const strip = UI.$('team-strip');
  BARBERS.forEach(b => {
    strip.insertAdjacentHTML('beforeend', `
      <div class="barber-card">
        <div class="barber-card-img">
          <img src="${b.img}" alt="${b.name}"
               onerror="this.src='https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&q=70'"/>
          <div class="barber-img-name">
            <div class="font-bbn text-[1.3rem] tracking-[.06em] text-tw leading-none">${b.name}</div>
            <div class="font-inter text-[.55rem] font-700 tracking-[.2em] uppercase text-[rgba(193,52,13,.7)] mt-1">Master Barber</div>
          </div>
        </div>
        <div class="barber-body">
          <div class="barber-yrs">${b.yrs} YRS EXPERIENCE</div>
          <div class="barber-desc">${b.desc}</div>
          <div class="barber-stats">
            <div class="barber-stat">
              <div class="barber-stat-v cr-text">${b.clients}</div>
              <div class="barber-stat-l">Clients</div>
            </div>
            <div class="barber-stat">
              <div class="barber-stat-v cr-text">${b.rating}</div>
              <div class="barber-stat-l">Rating</div>
            </div>
            <div class="barber-stat">
              <div class="barber-stat-v cop-text">${b.yrs}</div>
              <div class="barber-stat-l">Years</div>
            </div>
          </div>
        </div>
      </div>
    `);
  });
})();

/* ─── VIDEO PLAYER ──────────────────────────────────────────── */
(function () {
  const SRCS = [
    'https://bouzen.org/wp-content/uploads/2026/02/baber-1.mp4',
    'https://bouzen.org/wp-content/uploads/2026/02/barber-3.mp4',
    'https://bouzen.org/wp-content/uploads/2026/02/barber-2.mp4',
  ];
  const THUMBS = ['img/video-1.png','img/video-2.png','img/video-3.png'];

  const video   = UI.$('vp-video');
  const overlay = UI.$('vp-overlay');
  const fill    = UI.$('vp-fill');
  const track   = UI.$('vp-track');
  const counter = UI.$('vp-counter');
  const thumbs  = UI.$('vp-thumbs');
  const muteBtn = UI.$('vp-mute-btn');

  let cur = 0;

  /* Build thumbs */
  SRCS.forEach((src, i) => {
    const div = document.createElement('div');
    div.className = `vp-thumb${i === 0 ? ' active' : ''}`;
    div.innerHTML = `<img src="${THUMBS[i]}" alt="Video ${i+1}" onerror="this.src='https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&q=60'"/>
      <div class="absolute inset-0 flex items-center justify-center z-[2]">
        <div class="w-7 h-7 rounded-full bg-[rgba(7,9,15,.6)] border border-[rgba(193,52,13,.4)] flex items-center justify-center">
          <div style="width:0;height:0;border-top:5px solid transparent;border-bottom:5px solid transparent;border-left:9px solid rgba(236,234,230,.7);margin-left:2px;"></div>
        </div>
      </div>`;
    UI.on(div, 'click', () => load(i, true));
    thumbs.appendChild(div);
  });

  function setThumb(i) {
    UI.$$('.vp-thumb').forEach((t, ti) => UI.tog(t, 'active', ti === i));
    counter.textContent = `${i + 1} / ${SRCS.length}`;
  }

  function load(i, play = false) {
    cur = i;
    video.src = SRCS[i];
    video.load();
    setThumb(i);
    fill.style.width = '0%';
    if (play) {
      video.play().then(() => UI.hide(overlay)).catch(() => {});
    } else {
      UI.show(overlay);
    }
  }

  UI.on(overlay, 'click', () => {
    video.play().then(() => { UI.hide(overlay); }).catch(() => {});
  });
  video.addEventListener('pause', () => UI.show(overlay));
  video.addEventListener('ended', () => {
    UI.show(overlay);
    // Auto-advance
    if (cur < SRCS.length - 1) setTimeout(() => load(cur + 1, true), 800);
  });
  video.addEventListener('timeupdate', () => {
    if (video.duration) fill.style.width = (video.currentTime / video.duration * 100) + '%';
  });
  UI.on(track, 'click', e => {
    const r = track.getBoundingClientRect();
    video.currentTime = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * video.duration;
  });
  UI.on(muteBtn, 'click', e => {
    e.stopPropagation();
    video.muted = !video.muted;
    UI.tog(UI.$('vp-icon-sound'), 'hidden', video.muted);
    UI.tog(UI.$('vp-icon-muted'), 'hidden', !video.muted);
  });

  /* Load on section visible */
  const obs = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    obs.disconnect();
    load(0, false);
  }, { threshold: 0.1 });
  obs.observe(document.getElementById('videos'));
})();

/* ─── REVIEWS ───────────────────────────────────────────────── */
(function () {
  const RVS = [
    { src:'Google',   w:340, init:'JR', name:'James R.',   svc:'Precision Haircut',    half:false, text:'Best fade I\'ve ever had. Marcus took his time understanding exactly what I wanted and delivered beyond expectations. The hot towel finish was a nice touch. This place sets the standard.' },
    { src:'Yelp',     w:320, init:'DM', name:'David M.',   svc:'Beard Sculpting',      half:false, text:'Walked in looking rough, walked out looking like a different man. The beard sculpting was insanely precise. Will not go anywhere else.' },
    { src:'Google',   w:360, init:'AL', name:'Anthony L.', svc:'Hot Towel Shave',      half:false, text:'The hot towel shave experience here is unlike anything else in the city. It felt like a ritual — the pre-oil, the steam, the straight razor. I left with the smoothest skin of my life.' },
    { src:'Facebook', w:330, init:'KP', name:'Kevin P.',   svc:'Online Barber Course', half:true,  text:'Took the online barber course and it changed everything. Went from zero to booking clients in 3 months. The modules are detailed, the Q&A sessions are gold.' },
    { src:'Google',   w:340, init:'TW', name:'Tyler W.',   svc:'Precision Haircut',    half:false, text:'Clean shop, professional staff, zero waiting. My skin fade was absolutely on point — the blend from the sides was seamless. This is my shop now.' },
    { src:'Yelp',     w:320, init:'MG', name:'Marco G.',   svc:'Hair Styling',         half:false, text:'Got the pompadour styling and the result was incredible. They used premium product that held all day without feeling heavy. Compliments all weekend.' },
    { src:'Google',   w:350, init:'RS', name:'Robert S.',  svc:'Beard Sculpting',      half:false, text:'I drove 40 minutes just to come here and I\'d do it again every time. The attention to detail on my line-up was surgical. Every edge was perfect.' },
  ];

  const stars = half => Array.from({length:5}, (_,i) => `<div class="rv2-star${i===4&&half?' half':''}"></div>`).join('');

  UI.$('rv-wrapper').innerHTML = RVS.map(r => `
    <div class="swiper-slide" style="width:${r.w}px;">
      <div class="rv2-card">
        <span class="rv2-src">${r.src}</span>
        <div class="rv2-stars">${stars(r.half)}</div>
        <p class="rv2-text">${r.text}</p>
        <div class="rv2-author-row">
          <div class="rv2-avatar">${r.init}</div>
          <div>
            <div class="rv2-name">${r.name}</div>
            <div class="rv2-svc">${r.svc}</div>
          </div>
        </div>
      </div>
    </div>`
  ).join('');

  new Swiper('#rv-swiper', {
    slidesPerView:'auto', spaceBetween:12, grabCursor:true,
    loop:true, speed:700,
    autoplay:{ delay:4200, disableOnInteraction:false, pauseOnMouseEnter:true },
    scrollbar:{ el:'.rv2-scrollbar', draggable:true },
    navigation:{ prevEl:'#rv-prev', nextEl:'#rv-next' },
    breakpoints:{ 0:{ spaceBetween:10 }, 768:{ spaceBetween:14 } }
  });
})();

/* ─── FAQ ───────────────────────────────────────────────────── */
(function () {
  const WA = 'https://wa.me/18098786115';
  const ITEMS = [
    { q:'📈 Will this bring me more clients?', a:'Most weeks a chair sits empty because when someone nearby searches for a barbershop on Google, a competitor appears first. A website with <strong class="text-cr">active advertising</strong> changes that — your shop shows up exactly when someone in your city is already searching. That\'s measurable traffic from day one.' },
    { q:'💰 What does it cost?', a:'<strong class="text-cr">Nothing until you see results.</strong> The first <strong class="text-cr">14 days</strong> you receive your personalized website completely free — ready to advertise. All you need is between <strong class="text-cr">$20–$30</strong> for a first Google Ads campaign. If clients arrive and you decide to continue, the site starts at <strong class="text-cr">$250 USD in weekly installments.</strong> If you\'re not convinced, no charge.' },
    { q:'🤔 Do I need tech knowledge?', a:'Not at all. The site arrives <strong class="text-cr">ready and running.</strong> For Google Ads we sit together — in less than <strong class="text-cr">20 minutes</strong> you have your first campaign live, targeting people in your city. No prior experience needed, just your phone.' },
    { q:'⏱️ How long does setup take?', a:'Between <strong class="text-cr">24 and 48 hours</strong> from when you give me your barbershop info. While you keep cutting, I build the site. And I don\'t leave you alone — for the first <strong class="text-cr">two weeks</strong> I\'m with you to make sure the first clients arrive.' },
    { q:'💬 How do I start?', a:'One message on WhatsApp with your barbershop name and city. In under <strong class="text-cr">24 hours</strong> your site is live.', wa:true },
  ];

  const acc = UI.$('faq2-acc');
  ITEMS.forEach((item, i) => {
    const n = String(i+1).padStart(2,'0');
    const waBtn = item.wa ? `<a href="${WA}" target="_blank" rel="noopener" class="faq-wa-btn"><svg width="12" height="12"><use href="#s-wa"/></svg>Message on WhatsApp</a>` : '';
    acc.insertAdjacentHTML('beforeend', `
      <div class="faq2-item ax-reveal">
        <button class="faq2-btn" aria-expanded="false">
          <span class="faq2-n">${n}</span>
          <span class="faq2-q">${item.q}</span>
          <span class="faq2-arr"><svg width="12" height="12"><use href="#s-faq-arr"/></svg></span>
        </button>
        <div class="faq2-panel">
          <div class="faq2-body"><p>${item.a}</p>${waBtn}</div>
        </div>
      </div>`
    );
  });

  const items = acc.querySelectorAll('.faq2-item');
  items.forEach(item => {
    item.querySelector('.faq2-btn').addEventListener('click', () => {
      const open = item.classList.contains('open');
      items.forEach(el => { UI.rem(el,'open'); el.querySelector('.faq2-btn').setAttribute('aria-expanded','false'); });
      if (!open) { UI.cls(item,'open'); item.querySelector('.faq2-btn').setAttribute('aria-expanded','true'); }
    });
  });
  // Open first by default
  if (items[0]) { UI.cls(items[0],'open'); items[0].querySelector('.faq2-btn').setAttribute('aria-expanded','true'); }
})();

/* ─── CONTACT / TIME PICKER ─────────────────────────────────── */
(function () {
  const SCHEDULE = {
    Monday:    { available:true,  slots:['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00'] },
    Tuesday:   { available:true,  slots:['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00'] },
    Wednesday: { available:true,  slots:['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00'] },
    Thursday:  { available:true,  slots:['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00'] },
    Friday:    { available:true,  slots:['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','20:00'] },
    Saturday:  { available:true,  slots:['10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'] },
  };

  const dayEl   = UI.$('ax-day');
  const timeEl  = UI.$('ax-time');
  const modal   = UI.$('ct2-modal');
  const toastEl = UI.$('ct2-toast');
  let toastTimer;

  function showToast(msg) {
    clearTimeout(toastTimer);
    toastEl.textContent = msg;
    UI.cls(toastEl, 'vis');
    toastTimer = setTimeout(() => UI.rem(toastEl, 'vis'), 2500);
  }

  function openModal(day) {
    const sch = SCHEDULE[day];
    UI.$('ct2-modal-day').textContent = day;
    const grid = UI.$('ct2-time-grid');
    if (!sch?.available) {
      grid.innerHTML = '<div class="col-span-3 text-center py-8 font-inter text-[.8rem] text-[rgba(107,114,128,.7)] italic">No slots available this day</div>';
    } else {
      grid.innerHTML = sch.slots.map(t => {
        const h = parseInt(t); const ampm = h >= 12 ? 'PM' : 'AM'; const h12 = h > 12 ? h-12 : h;
        return `<button class="ct2-slot" data-time="${t}">${h12}:00 ${ampm}</button>`;
      }).join('');
      grid.querySelectorAll('.ct2-slot').forEach(btn => {
        UI.on(btn, 'click', () => { timeEl.value = btn.dataset.time; closeModal(); });
      });
    }
    UI.cls(modal, 'vis');
  }
  function closeModal() { UI.rem(modal, 'vis'); }

  UI.on(UI.$('ct2-modal-bg'),    'click', closeModal);
  UI.on(UI.$('ct2-modal-close'), 'click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  UI.on(timeEl, 'click', () => {
    const day = dayEl.value;
    if (!day) { showToast('Please select a day first'); return; }
    if (!SCHEDULE[day]?.available) { showToast('No slots available for this day'); return; }
    openModal(day);
  });

  // Clear time if day changes to incompatible
  UI.on(dayEl, 'change', () => {
    const day = dayEl.value;
    const curTime = timeEl.value;
    if (curTime && day && !SCHEDULE[day]?.slots?.includes(curTime)) timeEl.value = '';
  });
})();

function axFormSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const data = new FormData(form);
  if (!data.get('name') || !data.get('email')) return;
  UI.hide(form);
  const suc = UI.$('ax-success');
  UI.show(suc);
  suc.classList.remove('hidden');
}

/* ─── STAT COUNTERS (IntersectionObserver) ──────────────────── */
(function() {
  const statVals = document.querySelectorAll('.stat-val');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      obs.unobserve(entry.target);
      const sv = entry.target;
      const hasK = sv.textContent.includes('k');
      const num = parseFloat(sv.textContent.replace(/[^0-9.]/g,''));
      if (isNaN(num)) return;
      const start = performance.now();
      const dur = 1600;
      function tick(now) {
        const t = Math.min((now - start) / dur, 1);
        const ease = t < .5 ? 2*t*t : -1+(4-2*t)*t;
        const cur = ease * num;
        sv.textContent = hasK ? cur.toFixed(1) + 'k' : Math.round(cur).toString();
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.5 });
  statVals.forEach(sv => obs.observe(sv));
})();