/**
 * NARA AVATAR SYSTEM v6 — BARBERSHOP PRO
 * ─────────────────────────────────────────────────────────────
 * 
 * MEJORAS:
 * • Aparece SOLO con primera interacción del usuario
 * • Audio solo se activa UNA VEZ en la sesión
 * • Botón ? destacado en centro inferior
 * • Botón ↺ (repetir) a la izquierda
 * • Botón ✕ (cerrar) a la DERECHA  ← CAMBIADO
 * • "Seguir con avatar" pone estado en espera ← CAMBIADO
 * • Sin delay en primera aparición             ← CAMBIADO
 * • Avatar desplazado a la izquierda           ← CAMBIADO
 * ─────────────────────────────────────────────────────────────
 */

(function () {
  'use strict';

  /* ══════════════════════════════════════════════
     CONFIGURACIÓN
  ══════════════════════════════════════════════ */
  const C = {
    // Assets
    speak : 'ava/nara-speak.webp',
    espera: 'ava/nara-espera.webp',
    stat  : 'ava/nara-estatico.png',
    intro : 'ava/intro.mp3',
    ayuda : 'ava/ayuda.mp3',
    wa    : 'https://wa.me/18098786115',
    
    // Timing
    delay : 0,         // ✅ FIX: sin delay — aparece inmediatamente
    cool  : 1400,      // Cooldown doble clic
    SIZE  : 80,        // Tamaño del avatar

    // Colores del portfolio
    colors: {
      gold: '#bf7c1a',
      goldLight: '#d4952a',
      goldDark: '#9a6010',
      bgPrimary: '#0d0c0a',
      bgSecondary: '#0a0908',
      textWhite: '#f0ece4',
      textGray: '#8a8580'
    }
  };

  /* ══════════════════════════════════════════════
     ESTADO
  ══════════════════════════════════════════════ */
  const S = {
    mode        : 'hidden',
    audio       : null,
    lastDbl     : 0,
    lastTap     : 0,
    drag        : false,
    moved       : false,
    ox: 0, oy: 0, wx: 0, wy: 0,
    userInteracted: false,    // Nueva bandera para primera interacción
    permanentHidden: false    // Cuando el usuario elige ocultar permanentemente
  };

  let wrap, circle, img, btnFaq, btnClose, btnBack, btnFollow, faqEl, modalEl, mOk, mFollow;

  /* ══════════════════════════════════════════════
     SESSION STORAGE
  ══════════════════════════════════════════════ */
  function ssGet(k) { try { return sessionStorage.getItem(k); } catch(e) { return null; } }
  function ssSet(k) { try { sessionStorage.setItem(k, '1'); } catch(e) {} }

  /* ══════════════════════════════════════════════
     ARRANQUE — ESPERA PRIMERA INTERACCIÓN
  ══════════════════════════════════════════════ */
  function boot() {
    if (document.getElementById('ava-wrap')) return;
    
    injectCSS();
    buildDOM();
    bindEvents();
    
    // Verificar si ya se mostró antes en esta sesión
    if (ssGet('ava_shown')) {
      S.userInteracted = true;
    }
  }

  // Detectar primera interacción del usuario
  function handleFirstInteraction(e) {
    if (S.userInteracted) return;
    
    // Ignorar interacciones con el propio avatar si ya está visible
    if (wrap.classList.contains('ava-on') && e.target.closest('#ava-wrap')) return;
    
    S.userInteracted = true;
    
    // Remover los listeners de primera interacción
    document.removeEventListener('click', handleFirstInteraction, true);
    document.removeEventListener('touchstart', handleFirstInteraction, true);
    document.removeEventListener('keydown', handleFirstInteraction, true);
    document.removeEventListener('scroll', handleFirstInteraction, true);
    document.removeEventListener('mousemove', handleFirstInteraction, true);
    
    // ✅ FIX: sin setTimeout — aparece de inmediato
    if (S.permanentHidden) return;
    
    popIn();
    
    if (!ssGet('ava_intro_done')) {
      setState('intro');
    } else {
      setState('waiting');
    }
    
    ssSet('ava_shown');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      document.addEventListener('click', handleFirstInteraction, true);
      document.addEventListener('touchstart', handleFirstInteraction, true);
      document.addEventListener('keydown', handleFirstInteraction, true);
      document.addEventListener('scroll', handleFirstInteraction, true);
      document.addEventListener('mousemove', handleFirstInteraction, true);
      boot();
    });
  } else {
    document.addEventListener('click', handleFirstInteraction, true);
    document.addEventListener('touchstart', handleFirstInteraction, true);
    document.addEventListener('keydown', handleFirstInteraction, true);
    document.addEventListener('scroll', handleFirstInteraction, true);
    document.addEventListener('mousemove', handleFirstInteraction, true);
    boot();
  }

  /* ══════════════════════════════════════════════
     BUILD DOM
  ══════════════════════════════════════════════ */
  function buildDOM() {
    wrap = mk('div', { id: 'ava-wrap' });
    wrap.className = 'pos-default';

    circle = mk('div', { id: 'ava-c' });
    img = mk('img', { id: 'ava-img', src: C.espera, alt: 'Nara · Asistente', draggable: 'false' });
    circle.appendChild(img);

    // ✅ FIX: ✕ a la DERECHA, ↺ a la izquierda, ? centrado abajo
    btnFaq   = mkBtn('ava-b-faq',   '?',  'Preguntas frecuentes');
    btnBack  = mkBtn('ava-b-back',  '↺',  'Volver al menú');
    btnClose = mkBtn('ava-b-close', '✕',  'Ocultar asistente');

    wrap.appendChild(circle);
    wrap.appendChild(btnFaq);
    wrap.appendChild(btnBack);
    wrap.appendChild(btnClose);

    /* FAQ */
    faqEl = mk('div', { id: 'ava-faq' });
    faqEl.innerHTML = buildFAQHTML();

    /* MODAL */
    modalEl = mk('div', { id: 'ava-modal' });
    modalEl.innerHTML = `
      <div id="ava-mbox">
        <h3>👋 ¡Hasta pronto!</h3>
        <p>Puedes volver a llamarme con un <strong>doble clic</strong> (o doble tap en móvil) en cualquier parte de la pantalla.</p>
        <p style="margin-top:12px; color:#bf7c1a; font-size:0.85rem;">Siempre estoy aquí si necesitas ayuda.</p>
        <div style="display:flex; gap:10px; margin-top:22px;">
          <button id="ava-mok">Entendido</button>
          <button id="ava-mfollow">Seguir con avatar</button>
        </div>
      </div>
    `;

    document.body.appendChild(wrap);
    document.body.appendChild(faqEl);
    document.body.appendChild(modalEl);

    mOk = document.getElementById('ava-mok');
    mFollow = document.getElementById('ava-mfollow');
  }

  /* ══════════════════════════════════════════════
     ESTADOS
  ══════════════════════════════════════════════ */
  function setState(mode) {
    S.mode = mode;
    hideBtns();
    closeFAQ();

    switch (mode) {
      case 'hidden':
        killAudio();
        wrap.classList.remove('ava-on');
        break;

      case 'intro':
        wrap.classList.add('ava-on');
        img.src = C.speak;
        tryPlay(C.intro, () => {
          ssSet('ava_intro_done');
          setState('waiting');
        });
        break;

      case 'waiting':
        killAudio();
        wrap.classList.add('ava-on');
        setPos('default');
        img.src = C.espera;
        break;

      case 'help':
        wrap.classList.add('ava-on');
        showBtns();
        if (!ssGet('ava_ayuda_done')) {
          img.src = C.speak;
          tryPlay(C.ayuda, () => {
            ssSet('ava_ayuda_done');
            img.src = C.stat;
          });
        } else {
          img.src = C.stat;
        }
        break;

      case 'faq':
        wrap.classList.add('ava-on');
        setPos('center');
        img.src = C.stat;
        openFAQ();
        break;
    }
  }

  /* ══════════════════════════════════════════════
     AUDIO
  ══════════════════════════════════════════════ */
  function tryPlay(src, cb) {
    killAudio();
    const a = new Audio(src);
    S.audio = a;
    function done() { S.audio = null; if (cb) cb(); }
    a.addEventListener('ended', done, { once: true });
    a.addEventListener('error', done, { once: true });
    const p = a.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => {
        const resume = () => { if (S.audio === a) a.play().catch(done); };
        const opts = { capture: true, once: true };
        document.addEventListener('click', resume, opts);
        document.addEventListener('keydown', resume, opts);
        document.addEventListener('touchstart', resume, opts);
      });
    }
  }

  function killAudio() {
    if (S.audio) { try { S.audio.pause(); } catch(e) {} S.audio = null; }
  }

  function popIn() {
    wrap.classList.add('ava-on');
    circle.classList.remove('ava-pop');
    void circle.offsetWidth;
    circle.classList.add('ava-pop');
  }

  function setPos(m) {
    wrap.style.left = wrap.style.top = wrap.style.right = wrap.style.transform = '';
    wrap.className = 'ava-on pos-' + m;
  }

  function showBtns() { 
    [btnFaq, btnBack, btnClose].forEach(b => b.classList.add('show')); 
  }
  
  function hideBtns() { 
    [btnFaq, btnBack, btnClose].forEach(b => b.classList.remove('show')); 
  }
  
  function openFAQ()  { faqEl.classList.add('open'); }
  function closeFAQ() { faqEl.classList.remove('open'); }

  /* ══════════════════════════════════════════════
     EVENTOS
  ══════════════════════════════════════════════ */
  function bindEvents() {
    // Drag & click
    circle.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      S.drag = true; S.moved = false;
      const r = wrap.getBoundingClientRect();
      S.ox = e.clientX; S.oy = e.clientY;
      S.wx = r.left;    S.wy = r.top;
      circle.setPointerCapture(e.pointerId);
      e.preventDefault();
    });

    circle.addEventListener('pointermove', function (e) {
      if (!S.drag) return;
      const dx = e.clientX - S.ox, dy = e.clientY - S.oy;
      if (!S.moved && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) S.moved = true;
      if (S.moved) {
        const vw = window.innerWidth, vh = window.innerHeight;
        wrap.className = 'ava-on';
        wrap.style.left = Math.max(0, Math.min(S.wx + dx, vw - 90)) + 'px';
        wrap.style.top = Math.max(0, Math.min(S.wy + dy, vh - 110)) + 'px';
        wrap.style.right = 'auto';
        wrap.style.transform = 'none';
      }
    });

    circle.addEventListener('pointerup', function () {
      const wasDrag = S.moved;
      S.drag = false; S.moved = false;
      if (!wasDrag) onCircleClick();
    });

    function onCircleClick() {
      if (S.mode === 'waiting') { setState('help'); return; }
      if (S.mode === 'help')    { setState('waiting'); return; }
      if (S.mode === 'faq')     { setState('waiting'); return; }
    }

    // Botones
    btnFaq.addEventListener('click',  e => { e.stopPropagation(); setState('faq'); });
    btnBack.addEventListener('click', e => { e.stopPropagation(); setState('waiting'); });
    btnClose.addEventListener('click', e => {
      e.stopPropagation();
      hideBtns();
      killAudio();
      modalEl.classList.add('open');
    });

    // Modal
    mOk.addEventListener('click', () => {
      modalEl.classList.remove('open');
      setState('hidden');
      S.permanentHidden = true;
    });
    
    // ✅ FIX: "Seguir con avatar" → vuelve al estado de espera (no estático)
    mFollow.addEventListener('click', () => {
      modalEl.classList.remove('open');
      setState('waiting');
    });
    
    modalEl.addEventListener('click', e => {
      if (e.target === modalEl) { 
        modalEl.classList.remove('open'); 
      }
    });

    // FAQ
    faqEl.addEventListener('click', function (e) {
      if (e.target.closest('#ava-fq-back'))  { setState('waiting'); return; }
      if (e.target.closest('#ava-fq-close')) { setState('help'); return; }
    });

    // Click fuera del avatar
    document.addEventListener('click', function (e) {
      if (S.mode !== 'help' && S.mode !== 'faq') return;
      if (modalEl.classList.contains('open')) return;
      const inside = e.target.closest('#ava-wrap') || e.target.closest('#ava-faq');
      if (!inside) setState('waiting');
    }, true);

    // Doble clic desktop
    document.addEventListener('dblclick', function (e) {
      if (S.mode !== 'hidden' && !S.permanentHidden) return;
      if (e.target.closest('#ava-wrap, #ava-faq, #ava-modal')) return;
      if (S.permanentHidden) S.permanentHidden = false;
      respawnAt(e.clientX, e.clientY);
    });

    // Doble tap móvil
    document.addEventListener('touchend', function (e) {
      if (S.mode !== 'hidden' && !S.permanentHidden) return;
      if (e.target.closest('#ava-wrap') || e.target.closest('#ava-faq') || e.target.closest('#ava-modal')) return;

      const now = Date.now();
      if (now - S.lastTap < 350) {
        const t = e.changedTouches[0];
        if (S.permanentHidden) S.permanentHidden = false;
        respawnAt(t.clientX, t.clientY);
        S.lastTap = 0;
        e.preventDefault();
      } else {
        S.lastTap = now;
      }
    }, { passive: false });
  }

  function respawnAt(cx, cy) {
    const now = Date.now();
    if (now - S.lastDbl < C.cool) return;
    S.lastDbl = now;

    const vw = window.innerWidth, vh = window.innerHeight;
    const sz = C.SIZE;
    const x = Math.max(0, Math.min(cx - sz / 2, vw - sz - 10));
    const y = Math.max(70, Math.min(cy - sz / 2, vh - sz - 20));

    wrap.className = 'ava-on';
    wrap.style.left = x + 'px';
    wrap.style.top = y + 'px';
    wrap.style.right = 'auto';
    wrap.style.transform = 'none';

    popIn();
    setState('waiting');
  }

  /* ══════════════════════════════════════════════
     FAQ
  ══════════════════════════════════════════════ */
  function buildFAQHTML() {
    const items = [
      {
        q: '💈 ¿Qué incluye un sitio web para mi barbería?',
        a: 'Un sitio web profesional incluye: diseño personalizado con la estética de tu barbería, galería de trabajos (fotos/videos), sistema de reservas online, integración con WhatsApp, sección de servicios con precios, equipo de barberos, ubicación con mapa, y optimización SEO para aparecer en Google.'
      },
      {
        q: '💰 ¿Cuánto cuesta un sitio web como este?',
        a: 'El precio base es <strong>$450 USD</strong> para un sitio web profesional completo. Si deseas funciones adicionales como tienda online, sistema de membresías o múltiples idiomas, el presupuesto se ajusta según necesidades específicas.'
      },
      {
        q: '📱 ¿Incluye diseño responsive para móviles?',
        a: '¡Por supuesto! Todos nuestros diseños son 100% responsive, lo que significa que se ven perfectos en móviles, tablets y computadoras. Tus clientes podrán navegar y reservar desde cualquier dispositivo.'
      },
      {
        q: '⏱️ ¿Cuánto tarda la entrega?',
        a: 'El tiempo de desarrollo es de <strong>7 a 14 días hábiles</strong>, dependiendo de la complejidad del proyecto. Incluye 30 días de soporte post-entrega para ajustes y revisiones sin costo adicional.'
      },
      {
        q: '💬 ¿Cómo empiezo con mi proyecto?',
        a: '¡Es muy sencillo! Escríbeme por WhatsApp, cuéntame sobre tu barbería y te responderé con una propuesta personalizada sin compromiso. Incluye: presupuesto detallado, timeline de entrega y ejemplos de diseños similares.',
        wa: true
      }
    ];

    const WA = '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';

    const head = `
      <div class="afq-head">
        <div class="afq-label-row">
          <div class="afq-line"></div>
          <span class="afq-label">💈 SERVICIOS PARA BARBERÍAS</span>
          <div class="afq-line"></div>
        </div>
        <h2 class="afq-title">¿HABLAMOS DE TU <span class="afq-accent">PROYECTO?</span></h2>
      </div>
      <div class="afq-ctrls">
        <button class="afq-ctrl" id="ava-fq-back">← Volver</button>
        <button class="afq-ctrl" id="ava-fq-close">✕ Cerrar</button>
      </div>
    `;

    const body = items.map(item => {
      const waBtn = item.wa ? `<a class="afq-wa-btn" href="${C.wa}" target="_blank" rel="noopener">${WA} Consultar por WhatsApp</a>` : '';
      return `
        <div class="afq-item">
          <div class="afq-bdr afq-bdr-top"></div>
          <div class="afq-bdr afq-bdr-bot"></div>
          <div class="afq-bdr afq-bdr-lft"></div>
          <div class="afq-bdr afq-bdr-rgt"></div>
          <details class="afq-details">
            <summary class="afq-summary">
              <span class="afq-q-text">${item.q}</span>
              <span class="afq-arrow"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 9l-7 7-7-7"/></svg></span>
            </summary>
            <div class="afq-answer">
              <p>${item.a}</p>
              ${waBtn}
            </div>
          </details>
        </div>
      `;
    }).join('');

    return head + '<div class="afq-list">' + body + '</div>';
  }

  /* ══════════════════════════════════════════════
     UTILIDADES
  ══════════════════════════════════════════════ */
  function mk(tag, attrs) {
    const e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(k => e.setAttribute(k, attrs[k]));
    return e;
  }

  function mkBtn(id, html, title) {
    const b = mk('button', { class: 'ava-btn', id: id, title: title });
    b.innerHTML = html;
    return b;
  }

  /* ══════════════════════════════════════════════
     CSS
  ══════════════════════════════════════════════ */
  function injectCSS() {
    if (document.getElementById('ava-css')) return;
    const s = document.createElement('style');
    s.id = 'ava-css';
    s.textContent = buildCSS();
    document.head.appendChild(s);
  }

  function buildCSS() {
    const gold = '#bf7c1a';
    const bgPrimary = '#0d0c0a';
    const bgSecondary = '#0a0908';
    const borderColor = 'rgba(191,124,26,0.3)';
    const textGray = '#8a8580';
    const sz = C.SIZE;

    return `
      #ava-wrap{display:none;position:fixed;z-index:9100;width:${sz}px;font-family:'Raleway',sans-serif;}
      #ava-wrap.ava-on{display:block;}

      /* ✅ FIX: right aumentado a 48px para que el botón derecho no quede cortado */
      #ava-wrap.pos-default{top:74px;right:48px;left:auto;transform:none;}
      #ava-wrap.pos-center{top:74px;left:50%;right:auto;transform:translateX(-50%);}

      #ava-c{width:${sz}px;height:${sz}px;border-radius:50%;cursor:pointer;user-select:none;position:relative;overflow:visible;}
      #ava-img{width:${sz}px;height:${sz}px;object-fit:cover;border-radius:50%;display:block;pointer-events:none;border:2px solid ${borderColor};box-shadow:0 0 0 1px rgba(191,124,26,0.15),0 6px 28px rgba(0,0,0,0.65);transition:box-shadow .3s;}
      #ava-c:hover #ava-img{box-shadow:0 0 0 1px ${gold},0 0 18px rgba(191,124,26,0.2),0 10px 36px rgba(0,0,0,0.8);}

      @keyframes ava-pop{0%{opacity:0;transform:scale(.1) translateY(20px);}65%{opacity:1;transform:scale(1.07) translateY(-4px);}100%{opacity:1;transform:scale(1) translateY(0);}}
      #ava-c.ava-pop{animation:ava-pop .6s cubic-bezier(.34,1.56,.64,1) both;}

      .ava-btn{position:absolute;width:34px;height:34px;border-radius:50%;background:${bgSecondary};border:1.5px solid ${borderColor};color:${textGray};font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;opacity:0;transform:scale(.2);pointer-events:none;transition:opacity .22s,transform .3s cubic-bezier(.34,1.56,.64,1),background .15s,color .15s,border-color .15s;box-shadow:0 4px 18px rgba(0,0,0,.55);font-family:inherit;outline:none;}
      .ava-btn.show{opacity:1;transform:scale(1);pointer-events:all;}
      .ava-btn:hover{background:${gold};color:${bgPrimary};border-color:${gold};}

      /* ✅ FIX posiciones de botones:
         ? (FAQ)   → centro inferior
         ↺ (back)  → izquierda
         ✕ (close) → DERECHA                         */
      #ava-b-faq  {left:23px; top:100px; transition-delay:.06s; background:${gold}; color:${bgPrimary}; border-color:${gold};}
      #ava-b-back {left:-27px; top:88px; transition-delay:.02s;}
      #ava-b-close{left:73px;  top:88px; transition-delay:0s;}

      #ava-faq{display:none;position:fixed;top:172px;left:50%;transform:translateX(-50%);width:min(640px,92vw);background:${bgPrimary};border:1px solid ${borderColor};padding:28px 24px;z-index:9090;box-shadow:0 24px 64px rgba(0,0,0,0.78);max-height:68vh;overflow-y:auto;font-family:inherit;}
      #ava-faq.open{display:block;}
      #ava-faq::-webkit-scrollbar{width:3px;}
      #ava-faq::-webkit-scrollbar-thumb{background:${gold};border-radius:2px;}

      .afq-head{text-align:center;margin-bottom:20px;}
      .afq-label-row{display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:8px;}
      .afq-line{width:36px;height:1px;background:linear-gradient(90deg,transparent,${gold},transparent);}
      .afq-label{font-size:.6rem;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:${gold};opacity:.8;}
      .afq-title{font-size:1.2rem;font-weight:800;color:#fff;letter-spacing:.04em;text-transform:uppercase;line-height:1.2;margin:0;}
      .afq-accent{color:${gold};}

      .afq-ctrls{display:flex;justify-content:flex-end;gap:6px;margin-bottom:18px;}
      .afq-ctrl{padding:4px 12px;border:1px solid ${borderColor};background:transparent;color:${textGray};font-size:.68rem;cursor:pointer;letter-spacing:.06em;transition:border-color .2s,color .2s;font-family:inherit;}
      .afq-ctrl:hover{border-color:${gold};color:${gold};}

      .afq-list{display:flex;flex-direction:column;gap:8px;}
      .afq-item{position:relative;background:${bgSecondary};border:1px solid rgba(191,124,26,0.1);}

      .afq-bdr{position:absolute;background:${gold};transition:all .28s ease;pointer-events:none;}
      .afq-bdr-top{top:0;left:0;width:0;height:1px;}
      .afq-bdr-bot{bottom:0;right:0;width:0;height:1px;}
      .afq-bdr-lft{top:0;left:0;width:1px;height:0;transition-delay:.14s;}
      .afq-bdr-rgt{bottom:0;right:0;width:1px;height:0;transition-delay:.14s;}
      .afq-item:hover .afq-bdr-top{width:100%;}
      .afq-item:hover .afq-bdr-bot{width:100%;}
      .afq-item:hover .afq-bdr-lft{height:100%;}
      .afq-item:hover .afq-bdr-rgt{height:100%;}

      .afq-details{width:100%;}
      .afq-summary{padding:14px 18px;cursor:pointer;list-style:none;display:flex;align-items:center;justify-content:space-between;gap:12px;outline:none;}
      .afq-summary::-webkit-details-marker{display:none;}
      .afq-q-text{font-size:.8rem;font-weight:600;color:rgba(255,255,255,0.85);letter-spacing:.02em;line-height:1.5;}
      .afq-arrow{width:26px;height:26px;border-radius:50%;flex-shrink:0;border:1px solid ${borderColor};display:flex;align-items:center;justify-content:center;color:${gold};transition:border-color .2s,transform .35s;}
      .afq-details[open] .afq-arrow{transform:rotate(180deg);}
      .afq-item:hover .afq-arrow{border-color:${gold};}
      .afq-answer{padding:0 18px 18px;border-top:1px solid ${borderColor};padding-top:12px;}
      .afq-answer p{font-size:.78rem;color:${textGray};line-height:1.85;}
      .afq-answer strong{color:#fff;}

      .afq-wa-btn{display:inline-flex;align-items:center;gap:7px;margin-top:14px;padding:8px 16px;background:rgba(37,211,102,0.04);border:1px solid rgba(37,211,102,0.2);color:#4ade80;font-size:.73rem;font-weight:600;text-decoration:none;transition:background .18s,border-color .18s;font-family:inherit;}
      .afq-wa-btn:hover{background:rgba(37,211,102,0.1);border-color:rgba(37,211,102,0.4);}

      #ava-modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:10000;align-items:center;justify-content:center;backdrop-filter:blur(6px);}
      #ava-modal.open{display:flex;}
      #ava-mbox{background:${bgPrimary};border:1px solid ${borderColor};padding:34px 28px;max-width:360px;width:88vw;text-align:center;box-shadow:0 28px 68px rgba(0,0,0,0.86);font-family:inherit;position:relative;}
      #ava-mbox::before{content:"";position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,${gold},transparent);}
      #ava-mbox h3{font-size:1rem;font-weight:800;color:#fff;margin:0 0 13px;text-transform:uppercase;letter-spacing:.08em;}
      #ava-mbox p{font-size:.78rem;color:${textGray};line-height:1.9;margin:0;}
      #ava-mbox strong{color:#fff;}
      #ava-mok, #ava-mfollow{margin-top:0;padding:8px 16px;background:transparent;border:1px solid ${borderColor};color:${textGray};font-size:.73rem;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;transition:border-color .2s,color .2s;font-family:inherit;flex:1;}
      #ava-mfollow{border-color:${gold};color:${gold};}
      #ava-mok:hover, #ava-mfollow:hover{border-color:${gold};color:${gold};}
    `;
  }
})();