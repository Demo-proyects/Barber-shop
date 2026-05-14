(function () {
  const WA = 'https://wa.me/18098786115';

  const FAQ = [
  {
    q: '📈 ¿Para qué necesito un sitio si ya tengo clientes?',
    a: 'Tener clientes hoy no significa poder generar más cuando tú quieras. Si un mes baja el flujo, ¿cómo lo aumentas? Con Google Ads puedes <span class="line-gold" style="font-weight:600">encender la demanda cuando quieras</span>. Tu sitio es tu barbería en internet — y Google Ads es el botón que atrae a los que quieren un corte hoy. No es una medida de emergencia, <span class="word-gold">es tener control total sobre cuándo y cuántos clientes atraer.</span>'
  },
  {
    q: '💰 ¿Cuánto me cuesta probarlo?',
    a: '<span class="line-gold" style="font-weight:600">El sitio no tiene ningún costo durante los primeros 14 días.</span> La única inversión es <span class="word-gold">80 € para una prueba de 7 días</span>, destinados a lanzar tu campaña en Google Ads. <span class="line-gold" style="font-weight:600">El 100% de esa inversión va directamente a Google</span> para promocionar tu barbería en tu zona. Si después de la prueba decides continuar, el sitio parte desde <span class="line-gold" style="font-weight:600">400 € en cuotas</span>. Si no te convence, simplemente lo dejamos ahí. Sin contrato ni compromiso.'
  },
  {
    q: '📸 ¿Y si ya tengo Instagram?',
    a: 'Instagram es visibilidad social. <span class="word-gold">Google es intención de compra.</span> En Instagram compites por atención; en Google apareces cuando el cliente ya tiene la billetera en la mano y busca "barbería cerca de mí" para ir hoy mismo. Uno construye comunidad; el otro <span class="line-gold" style="font-weight:600">llena la agenda.</span>'
  },
  {
  q: '📊 ¿Esto realmente funciona?',
  a: 'La diferencia no es tener una web; es poder <span class="word-gold">decidir</span> cuándo tu barbería aparece frente a personas que ya <span class="line-gold" style="font-weight:600">buscan un corte en tu zona</span>. Con Google Ads defines el área, los horarios y el presupuesto. Si una semana tienes huecos libres, aumentas tu presencia en tu zona. Si ya tienes la agenda llena, reduces la publicidad. <span class="word-gold">Eso es control real sobre el flujo de clientes.</span>'
  },
  {
    q: '⏱️ ¿Tengo que saber de tecnología?',
    a: 'Nada. El sitio se entrega <span class="word-gold">listo en 24–48 horas</span>. Configuramos la primera campaña juntos en menos de 20 minutos desde tu teléfono. Tu único trabajo es tener las tijeras listas; <span class="line-gold" style="font-weight:600">del flujo de gente me encargo yo.</span>'
  },
  {
    q: '💬 ¿Cómo empiezo?',
    a: 'Un mensaje es todo lo que necesitas. Escríbele a Guervency que te pedirá informacion sobre tu barberia — en menos de <span class="line-gold" style="font-weight:600">24 horas</span> tienes tu demo lista. Tú decides después.',
    wa: false
  }
];

  const STATS = [
    { val: '14',   lbl: 'Días gratis'    },
    { val: '48h',  lbl: 'Entrega max'    },
    { val: '$0',   lbl: 'Riesgo inicial' },
    { val: '$250', lbl: 'Precio base'    }
  ];

  // Render accordion
  const acc = document.getElementById('fq-accordion');
  FAQ.forEach((item, i) => {
    const n = String(i + 1).padStart(2, '0');
    const waBtn = item.wa
      ? `<a href="${WA}" target="_blank" rel="noopener" class="fq-wa-link">
           <svg width="13" height="13"><use href="#fq-wa"/></svg>Escribir al WhatsApp
         </a>` : '';
    acc.insertAdjacentHTML('beforeend',
      `<div class="fq-item">
         <div class="fq-bar"></div>
         <button class="fq-q" aria-expanded="false">
           <span class="fq-num">${n}</span>
           <span class="fq-q-text">${item.q}</span>
           <span class="fq-arrow"><svg width="14" height="14"><use href="#fq-arrow"/></svg></span>
         </button>
         <div class="fq-panel">
           <div class="fq-panel-inner"><p>${item.a}</p>${waBtn}</div>
         </div>
       </div>`
    );
  });

  // Render stats
  document.getElementById('fq-stats').innerHTML = STATS.map(s =>
    `<div class="fq-stat">
       <span class="fq-stat-val">${s.val}</span>
       <span class="fq-stat-lbl">${s.lbl}</span>
     </div>`
  ).join('');

  // Accordion logic
  const items = acc.querySelectorAll('.fq-item');
  items.forEach(item => {
    item.querySelector('.fq-q').addEventListener('click', () => {
      const open = item.classList.contains('is-open');
      items.forEach(el => {
        el.classList.remove('is-open');
        el.querySelector('.fq-q').setAttribute('aria-expanded', 'false');
      });
      if (!open) {
        item.classList.add('is-open');
        item.querySelector('.fq-q').setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Abre primero por defecto
  items[0]?.classList.add('is-open');
  items[0]?.querySelector('.fq-q').setAttribute('aria-expanded', 'true');
})();