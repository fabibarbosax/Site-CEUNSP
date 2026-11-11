/* Colégio CEUNSP · interações do site da Astra */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer: fine)').matches;
  const COLORS = ['#e1251b', '#ff6b5e', '#ffffff', '#ffd2cc', '#0e2350'];

  /* ---------- desenho de estrela ---------- */
  function starPath(ctx, x, y, r, rot = 0) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const rad = i % 2 ? r * 0.45 : r;
      const a = rot + (Math.PI / 5) * i - Math.PI / 2;
      ctx.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad);
    }
    ctx.closePath();
  }

  /* ---------- partículas (tela inteira) ---------- */
  const fx = $('#fx');
  const fctx = fx.getContext('2d');
  let parts = [];
  let fxRunning = false;
  const dpr = () => Math.min(window.devicePixelRatio || 1, 2);
  function sizeFx() { const d = dpr(); fx.width = innerWidth * d; fx.height = innerHeight * d; fctx.setTransform(d, 0, 0, d, 0, 0); }
  sizeFx(); addEventListener('resize', sizeFx);

  function burst(x, y, n = 24, spread = 7) {
    if (reduce) return;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = 2 + Math.random() * spread;
      parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 2, g: .18, r: 4 + Math.random() * 7, rot: Math.random() * 6, vr: (Math.random() - .5) * .3, life: 1, decay: .012 + Math.random() * .015, c: COLORS[i % COLORS.length] });
    }
    runFx();
  }
  function rain(n = 140) {
    if (reduce) return;
    for (let i = 0; i < n; i++) {
      parts.push({ x: Math.random() * innerWidth, y: -20 - Math.random() * innerHeight * .8, vx: (Math.random() - .5) * 1.5, vy: 2 + Math.random() * 3, g: .03, r: 5 + Math.random() * 9, rot: Math.random() * 6, vr: (Math.random() - .5) * .15, life: 1, decay: .0035, c: COLORS[i % 4] });
    }
    runFx();
  }
  function runFx() {
    if (fxRunning) return; fxRunning = true;
    const tick = () => {
      fctx.clearRect(0, 0, innerWidth, innerHeight);
      parts = parts.filter(p => p.life > 0 && p.y < innerHeight + 40);
      for (const p of parts) {
        p.vy += p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life -= p.decay;
        fctx.globalAlpha = Math.max(p.life, 0); fctx.fillStyle = p.c;
        starPath(fctx, p.x, p.y, p.r, p.rot); fctx.fill();
      }
      fctx.globalAlpha = 1;
      if (parts.length) requestAnimationFrame(tick); else { fxRunning = false; fctx.clearRect(0, 0, innerWidth, innerHeight); }
    };
    requestAnimationFrame(tick);
  }

  /* ---------- céu estrelado do hero ---------- */
  const sky = $('#sky'), hero = $('#hero');
  if (sky) {
    const ctx = sky.getContext('2d');
    let W, H, stars = [], shoot = null, mx = 0, my = 0, tmx = 0, tmy = 0, visible = true;
    const size = () => {
      const d = dpr(); W = hero.offsetWidth; H = hero.offsetHeight;
      sky.width = W * d; sky.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0);
      const n = Math.round(W * H / 6500);
      stars = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, z: .2 + Math.random() * .8, r: .6 + Math.random() * 1.6, t: Math.random() * 6, big: Math.random() < .06 }));
    };
    size(); addEventListener('resize', size);
    hero.addEventListener('pointermove', e => { const b = hero.getBoundingClientRect(); tmx = (e.clientX - b.left) / b.width - .5; tmy = (e.clientY - b.top) / b.height - .5; });
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(hero);
    let last = 0;
    const draw = (t) => {
      requestAnimationFrame(draw);
      if (!visible || t - last < 30) return; last = t;
      mx += (tmx - mx) * .06; my += (tmy - my) * .06;
      ctx.clearRect(0, 0, W, H);
      for (const s of stars) {
        const tw = reduce ? 1 : .55 + Math.sin(t / 700 + s.t) * .45;
        const x = s.x - mx * 60 * s.z, y = s.y - my * 40 * s.z;
        ctx.globalAlpha = tw * s.z;
        if (s.big) { ctx.fillStyle = '#ff6b5e'; starPath(ctx, x, y, s.r * 3.2, t / 3000 + s.t); ctx.fill(); }
        else { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, s.r, 0, 7); ctx.fill(); }
      }
      if (!reduce) {
        if (!shoot && Math.random() < .006) shoot = { x: Math.random() * W * .7, y: Math.random() * H * .4, l: 0 };
        if (shoot) {
          shoot.l += 1;
          const x = shoot.x + shoot.l * 9, y = shoot.y + shoot.l * 4;
          const g = ctx.createLinearGradient(x - 120, y - 53, x, y);
          g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,255,255,.9)');
          ctx.globalAlpha = 1 - shoot.l / 60; ctx.strokeStyle = g; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(x - 120, y - 53); ctx.lineTo(x, y); ctx.stroke();
          if (shoot.l > 60) shoot = null;
        }
      }
      ctx.globalAlpha = 1;
    };
    requestAnimationFrame(draw);
    hero.addEventListener('click', e => { if (!e.target.closest('a,button')) burst(e.clientX, e.clientY, 16, 5); });
  }

  /* ---------- Astra do hero ---------- */
  const astraBtn = $('#astraHero'), heroBubble = $('#heroBubble');
  const lines = [
    'Bora brilhar juntos? ✦',
    'Do latim, astra quer dizer estrelas. Sou eu!',
    'Saí do logo do CEUNSP só pra te conhecer.',
    'Qual matéria faz você brilhar? Conta pra gente!',
    'Respira, organiza e vamos por partes!',
    'Rolou dúvida? A gente explica rapidinho.',
    'Estrela boa brilha junto ✦',
    'Psst... digita “astra” no teclado.'
  ];
  let li = 0, clicks = 0;
  if (astraBtn) {
    astraBtn.addEventListener('click', () => {
      const b = astraBtn.getBoundingClientRect();
      burst(b.left + b.width / 2, b.top + b.height * .35, 30, 8);
      astraBtn.classList.remove('is-pop'); void astraBtn.offsetWidth; astraBtn.classList.add('is-pop');
      heroBubble.textContent = lines[li++ % lines.length];
      if (++clicks === 7) { heroBubble.textContent = 'Uau, você me achou mesmo! Chuva de estrelas! ✦✦✦'; rain(); clicks = 0; }
    });
    if (finePointer && !reduce) {
      const m = $('#heroMascot');
      m.addEventListener('pointermove', e => {
        const b = m.getBoundingClientRect();
        const x = (e.clientX - b.left) / b.width - .5, y = (e.clientY - b.top) / b.height - .5;
        astraBtn.style.transform = `rotateY(${x * 22}deg) rotateX(${-y * 18}deg) translateZ(20px)`;
      });
      m.addEventListener('pointerleave', () => { astraBtn.style.transform = ''; });
    }
  }

  /* ---------- cabeçalho, progresso, menu ---------- */
  const top = $('#topo'), prog = $('#progress');
  const onScroll = () => {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    top.classList.toggle('is-solid', y > 40);
    prog.style.width = (h > 0 ? y / h * 100 : 0) + '%';
    journey();
  };
  addEventListener('scroll', onScroll, { passive: true });

  const burger = $('#burger'), nav = $('#nav');
  burger.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') !== 'true';
    burger.setAttribute('aria-expanded', open); nav.classList.toggle('is-open', open);
    top.classList.add('is-solid');
  });
  $$('a', nav).forEach(a => a.addEventListener('click', () => { burger.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); }));

  /* ---------- aparições ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach((el, i) => { el.style.transitionDelay = (i % 4) * 80 + 'ms'; io.observe(el); });

  /* ---------- contadores ---------- */
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const el = e.target, end = +el.dataset.count, suf = el.dataset.suffix || '';
    if (reduce) { el.textContent = end + suf; return; }
    const t0 = performance.now(), dur = 1600;
    const step = t => { const p = Math.min((t - t0) / dur, 1), v = Math.round(end * (1 - Math.pow(1 - p, 3))); el.textContent = v + suf; if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), { threshold: .6 });
  $$('[data-count]').forEach(el => cio.observe(el));

  /* ---------- arrastar para rolar ---------- */
  function dragScroll(el) {
    let down = false, sx = 0, sl = 0, moved = false;
    el.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = el.scrollLeft; });
    addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 4) { moved = true; el.classList.add('is-drag'); } el.scrollLeft = sl - dx; });
    addEventListener('pointerup', () => { if (!down) return; down = false; el.classList.remove('is-drag'); });
    el.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
  }
  const rail = $('#rail'), shelf = $('#shelf');
  [rail, shelf].forEach(el => el && dragScroll(el));
  $$('.timeline__ctrl .round').forEach(b => b.addEventListener('click', () => rail.scrollBy({ left: +b.dataset.dir * 340, behavior: reduce ? 'auto' : 'smooth' })));

  /* ---------- abas de ensino ---------- */
  const tabs = $$('[role="tab"]');
  const select = (t, focus) => {
    tabs.forEach(x => { const on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; const p = $('#' + x.getAttribute('aria-controls')); p.hidden = !on; p.classList.toggle('is-on', on); });
    if (focus) t.focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', e => {
      const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (k) { e.preventDefault(); select(tabs[(i + k + tabs.length) % tabs.length], true); }
    });
  });

  /* ---------- cartões 3D ---------- */
  if (finePointer && !reduce) $$('.tilt').forEach(c => {
    c.addEventListener('pointermove', e => {
      const b = c.getBoundingClientRect(), x = (e.clientX - b.left) / b.width, y = (e.clientY - b.top) / b.height;
      c.style.transform = `perspective(700px) rotateY(${(x - .5) * 14}deg) rotateX(${(.5 - y) * 12}deg)`;
      c.style.setProperty('--mx', x * 100 + '%'); c.style.setProperty('--my', y * 100 + '%');
    });
    c.addEventListener('pointerleave', () => { c.style.transform = ''; });
  });

  /* ---------- versões da Astra ---------- */
  const verImg = $('#verImg');
  $$('.ver').forEach(b => b.addEventListener('click', () => {
    if (b.classList.contains('is-on')) return;
    $$('.ver').forEach(x => x.classList.toggle('is-on', x === b));
    verImg.classList.add('is-swap');
    setTimeout(() => { verImg.src = b.dataset.src; verImg.alt = b.dataset.alt; verImg.classList.remove('is-swap'); }, 220);
  }));

  /* ---------- quiz ---------- */
  const QUIZ = [
    { q: 'Começou a semana de provas. Você...', a: [['Monto um cronograma e sigo à risca', 'confiante'], ['Chamo a turma pra estudar junto', 'carinhosa'], ['Faço resumos coloridos e mapas mentais', 'descolada'], ['Pesquiso tudo, até o que não vai cair', 'curiosa']] },
    { q: 'No intervalo, você está...', a: [['Rindo com os amigos de qualquer coisa', 'feliz'], ['Organizando o próximo campeonato', 'animada'], ['Ajudando alguém com a matéria', 'carinhosa'], ['Fazendo mil perguntas pro professor', 'curiosa']] },
    { q: 'Seu superpoder no trabalho em grupo:', a: [['Liderar e dar o pontapé inicial', 'confiante'], ['Ter as ideias mais criativas', 'descolada'], ['Deixar todo mundo motivado', 'animada'], ['Manter o clima leve e divertido', 'feliz']] }
  ];
  const RES = {
    confiante: ['Astra Confiante', 'Você sabe aonde quer chegar e puxa todo mundo junto. Brilho de quem lidera!'],
    feliz: ['Astra Feliz', 'Seu bom humor ilumina a sala inteira. Estrela boa brilha junto!'],
    curiosa: ['Astra Curiosa', 'Pergunta, pesquisa, descobre. Pra você, todo dia é dia de aprender algo novo.'],
    descolada: ['Astra Descolada', 'Criatividade é com você: ideias novas e um estilo só seu.'],
    carinhosa: ['Astra Carinhosa', 'Parceira de verdade: você acolhe, ajuda e faz todo mundo se sentir em casa.'],
    animada: ['Astra Animada', 'Energia lá em cima! Você transforma qualquer desafio em comemoração.']
  };
  const qBody = $('#quizBody'), dots = $$('#quizDots i');
  let qi = 0, score = {};
  function renderQ() {
    dots.forEach((d, i) => d.classList.toggle('on', i <= qi));
    const item = QUIZ[qi];
    qBody.innerHTML = `<div class="q__anim"><p class="q__text">${item.q}</p><div class="q__opts">${item.a.map(([t, k]) => `<button type="button" data-k="${k}">${t}</button>`).join('')}</div></div>`;
    $$('button', qBody).forEach(b => b.addEventListener('click', () => {
      b.classList.add('is-picked'); score[b.dataset.k] = (score[b.dataset.k] || 0) + 1;
      $$('button', qBody).forEach(x => x.disabled = true);
      setTimeout(() => { qi++; qi < QUIZ.length ? renderQ() : result(); }, 380);
    }));
  }
  function result() {
    const k = Object.entries(score).sort((a, b) => b[1] - a[1])[0][0];
    const [t, d] = RES[k];
    qBody.innerHTML = `<div class="result"><img src="assets/img/exp-${k}.png" alt="${t}"><p class="eyebrow">Você é a</p><h4>${t}</h4><p>${d}</p><button type="button" class="btn btn--navy btn--sm" id="again">Jogar de novo</button></div>`;
    const img = $('img', qBody), b = qBody.getBoundingClientRect();
    burst(b.left + b.width / 2, b.top + 120, 36, 9);
    $('#again').addEventListener('click', () => { qi = 0; score = {}; renderQ(); });
    img.addEventListener('click', () => { const r = img.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2); });
  }
  if (qBody) renderQ();

  /* ---------- jornada ---------- */
  const jWrap = $('#journey'), jFill = $('#jFill'), jAstra = $('#jAstra'), jSteps = $$('.journey__steps li');
  function journey() {
    if (!jWrap) return;
    const b = jWrap.getBoundingClientRect();
    const p = Math.min(Math.max((innerHeight * .8 - b.top) / (b.height + innerHeight * .3), 0), 1);
    jFill.style.width = p * 100 + '%'; jAstra.style.left = p * 100 + '%';
    jAstra.style.transform = `rotate(${p * 720}deg)`;
    jSteps.forEach((s, i) => s.classList.toggle('is-lit', p >= i / (jSteps.length - 1) - .02 || p > .98));
  }

  /* ---------- chat ---------- */
  const FAQ = [
    ['Quais etapas de ensino vocês têm?', 'O CEUNSP acompanha o aluno da Educação Infantil ao Ensino Médio ✦ As turmas podem variar por unidade, então vale confirmar com a secretaria da sua cidade.'],
    ['Onde ficam as unidades?', 'São duas! 📍 <b>Itu</b>: Rua do Patrocínio, 716. 📍 <b>Salto</b>: Praça Antônio Vieira Tavares, 73, dentro do campus CEUNSP.'],
    ['Como agendo uma visita?', 'É rapidinho! Liga pra Itu no <a href="tel:+551140139831">(11) 4013-9831</a> ou pra Salto no <a href="tel:+551140288325">(11) 4028-8325</a>. Ou monta sua visita <a href="#visita">aqui embaixo</a> ✦'],
    ['O que ganha quem se matricula?', 'Toda nova matrícula leva pra casa o <b>Kit Astra</b>: mochila, caderno, estojo e adesivos. É o nosso jeito de dar boas-vindas!'],
    ['O colégio é de algum grupo?', 'Sim! Desde 2016 o CEUNSP faz parte da Cruzeiro do Sul Educacional. E a nossa história começou lá em 1972, em Itu.'],
    ['Quem é você, Astra?', 'Sou a estrela que saiu do logo do CEUNSP! Curiosa, parceira, criativa, bem-humorada e acolhedora. Não substituo professores nem a secretaria, mas adoro ajudar ✦']
  ];
  const log = $('#chatLog'), qs = $('#chatQs'), status = $('#chatStatus');
  const add = (html, who) => { const m = document.createElement('div'); m.className = 'msg msg--' + who; m.innerHTML = html; log.appendChild(m); log.scrollTop = log.scrollHeight; return m; };
  if (log) {
    add('Oi! Eu sou a Astra ✦ Escolhe uma pergunta aí embaixo que eu te conto tudo.', 'astra');
    FAQ.forEach(([q, a]) => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = q; qs.appendChild(b);
      b.addEventListener('click', () => {
        b.disabled = true; add(q, 'me');
        const t = add('<span class="typing"><i></i><i></i><i></i></span>', 'astra');
        status.textContent = 'digitando...';
        setTimeout(() => { t.innerHTML = a; status.textContent = 'online ✦'; log.scrollTop = log.scrollHeight; }, reduce ? 100 : 900 + a.length * 6);
      });
    });
  }

  /* ---------- planejador de visita ---------- */
  const PH = { Itu: ['(11) 4013-9831', '+551140139831', 'Rua do Patrocínio, 716'], Salto: ['(11) 4028-8325', '+551140288325', 'Praça Antônio Vieira Tavares, 73'] };
  const form = $('#planner'), out = $('#plannerOut');
  if (form) form.addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(form), u = f.get('unidade'), et = f.get('etapa'), pe = f.get('periodo');
    if (!u || !et || !pe) { out.innerHTML = '<p class="err">Escolhe as três opções pra eu montar sua visita ✦</p>'; return; }
    const [tel, href, end] = PH[u];
    const msg = `Olá! Gostaria de agendar uma visita na unidade ${u} para conhecer o ${et}, no período da ${pe}.`;
    out.innerHTML = `<div class="ok"><b>Sua visita em ${u} ✦</b><p>${end}. Ligue para <strong>${tel}</strong> e diga:<br>“${msg}”</p><div class="unit__ctas"><a class="btn btn--red btn--sm" href="tel:${href}">Ligar agora</a><button type="button" class="btn btn--line btn--sm" id="copyMsg">Copiar mensagem</button></div></div>`;
    $('#copyMsg').addEventListener('click', ev => {
      const done = () => { ev.target.textContent = 'Copiado! ✦'; };
      navigator.clipboard ? navigator.clipboard.writeText(msg).then(done, done) : done();
    });
    const r = form.getBoundingClientRect(); burst(r.left + r.width / 2, r.bottom - 120, 34, 8);
  });

  /* ---------- Astra guia ---------- */
  const guide = $('#guide'), gBubble = $('#guideBubble'), gBtn = $('#guideBtn');
  gBtn.addEventListener('click', () => { guide.classList.toggle('is-hidden'); const b = gBtn.getBoundingClientRect(); burst(b.left + b.width / 2, b.top, 12, 4); });
  const sio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const txt = e.target.dataset.astra;
    if (txt && gBubble.textContent !== txt) {
      gBubble.textContent = txt;
      guide.classList.remove('is-wiggle'); void guide.offsetWidth; guide.classList.add('is-wiggle');
    }
    const id = e.target.id;
    $$('.nav a').forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + id));
  }), { threshold: .35 });
  $$('section[data-astra]').forEach(s => sio.observe(s));
  new IntersectionObserver(([e]) => guide.classList.toggle('is-away', e.isIntersecting)).observe(hero);

  /* ---------- easter egg: digite "astra" ---------- */
  let buf = '';
  addEventListener('keydown', e => {
    if (e.target.closest('input, textarea')) return;
    buf = (buf + e.key.toLowerCase()).slice(-5);
    if (buf === 'astra') { rain(180); gBubble.textContent = 'Você me chamou? Chuva de estrelas pra você! ✦'; guide.classList.remove('is-hidden'); buf = ''; }
  });

  onScroll();
})();
