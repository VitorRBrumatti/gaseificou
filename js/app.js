/* ==========================================================================
   GASEIFICOU! — Interactive Choreography, Calibrated ROI & IoT Telemetry
   ========================================================================== */

(function () {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------------
     1. LENIS SMOOTH SCROLL + SCROLL PROGRESS BEAM + MOBILE NAV
     ------------------------------------------------------------------------ */
  function initScrollAndNav() {
    if (typeof Lenis !== 'undefined' && !prefersReducedMotion) {
      const lenis = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });

      if (typeof ScrollTrigger !== 'undefined') {
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => lenis.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);
      } else {
        function raf(time) {
          lenis.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
      }

      document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
          const targetId = anchor.getAttribute('href');
          if (!targetId || targetId === '#') return;
          const el = document.querySelector(targetId);
          if (el) {
            e.preventDefault();
            lenis.scrollTo(el, { offset: -84 });
            document.getElementById('navShell')?.classList.remove('is-open');
          }
        });
      });
    }

    const progressBar = document.getElementById('scrollProgress');
    window.addEventListener('scroll', () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
      if (progressBar) progressBar.style.width = `${pct}%`;
    }, { passive: true });

    const navToggle = document.getElementById('navToggle');
    const navShell = document.getElementById('navShell');
    if (navToggle && navShell) {
      navToggle.addEventListener('click', () => {
        const open = navShell.classList.toggle('is-open');
        navToggle.setAttribute('aria-expanded', String(open));
      });
    }
  }

  /* ------------------------------------------------------------------------
     2. GSAP KINETIC REVEALS, MAGNETIC BUTTONS & SPOTLIGHT HOVER CARDS
     ------------------------------------------------------------------------ */
  function initMotionCraft() {
    document.querySelectorAll('.spotlight-card').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
        card.style.setProperty('--my', `${e.clientY - rect.top}px`);
      });
    });

    if (!prefersReducedMotion) {
      document.querySelectorAll('.magnetic').forEach((btn) => {
        btn.addEventListener('pointermove', (e) => {
          const rect = btn.getBoundingClientRect();
          const dx = (e.clientX - rect.left - rect.width / 2) * 0.18;
          const dy = (e.clientY - rect.top - rect.height / 2) * 0.18;
          btn.style.transform = `translate(${dx}px, ${dy}px)`;
        });
        btn.addEventListener('pointerleave', () => {
          btn.style.transform = '';
        });
      });
    }

    if (typeof gsap === 'undefined' || prefersReducedMotion) return;
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    const heroLines = document.querySelectorAll('#heroTitle .line-inner');
    gsap.from(heroLines, {
      yPercent: 90,
      opacity: 0,
      duration: 0.95,
      stagger: 0.12,
      ease: 'power4.out',
      delay: 0.08,
    });

    gsap.from('.hero-reveal', {
      y: 22,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out',
      delay: 0.28,
    });

    // Scroll-scrubbed kinetic pass on the centered Hero title
    if (typeof ScrollTrigger !== 'undefined') {
      const heroTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#heroSection',
          start: 'top top',
          end: 'bottom top',
          scrub: 0.7,
        },
      });

      heroTl
        .to('.hero-line-1', { xPercent: -26, opacity: 0.15, ease: 'none' }, 0)
        .to('.hero-line-2', { xPercent: 26, opacity: 0.15, ease: 'none' }, 0)
        .to('#heroTitle', { y: -45, ease: 'none' }, 0);
    }

    document.querySelectorAll('.reveal-up').forEach((el) => {
      gsap.from(el, {
        y: 38,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 86%',
          once: true,
        },
      });
    });

    gsap.from('.eff-fill', {
      scaleX: 0,
      duration: 1.15,
      stagger: 0.18,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.efficiency-bars',
        start: 'top 85%',
        once: true,
      },
    });
  }

  /* ------------------------------------------------------------------------
     3. INTERACTIVE 4-MODULE SCHEMATIC & URBAN/RURAL MODE SWITCH
     ------------------------------------------------------------------------ */
  function initArchitectureModules() {
    const moduleSpecs = {
      1: {
        tag: 'MÓDULO 01 · CORE ANAERÓBICO',
        text: 'Reator de 3.000 L dimensionado para ~35 kg/dia de comida, com tempo de retenção de 30 dias, gasômetro de 4 a 5 m³ e funil de carga com mistura.',
        metric: 'Retenção: 30 dias · 3.000 L',
      },
      2: {
        tag: 'MÓDULO 02 · GÁS E SEGURANÇA TÉRMICA',
        text: 'Filtragem obrigatória de H₂S, dreno de umidade contra corrosão, válvulas, corta-chamas, manômetro, booster de baixa pressão e conexão direta aos aquecedores de água e caldeiras.',
        metric: 'Eficiência térmica: 70%–85%',
      },
      3: {
        tag: 'MÓDULO 03 · ESCOAMENTO URBANO',
        text: 'Gera ~2,5 L de digestato por kg (~87,5 L/dia ou ~612 L/semana em 35 kg/dia). Tanque pulmão vedado de 1.000 L, bomba, engate camlock e retirada semanal gratuita por parceiros locais.',
        metric: 'Economiza > R$ 3.300 em filtros',
      },
      4: {
        tag: 'MÓDULO 04 · TELEMETRIA IOT E QR ESG',
        text: 'Sensores de pressão do gás, temperatura interna e nível do tanque pulmão conectados ao painel remoto, além de QR Code na recepção e no restaurante.',
        metric: 'Assinatura: R$ 99–199/mês',
      },
    };

    const tabs = document.querySelectorAll('.bp-tab');
    const nodes = document.querySelectorAll('.bp-node');
    const cards = document.querySelectorAll('[data-module-card]');
    const detailTag = document.getElementById('bpDetailTag');
    const detailText = document.getElementById('bpDetailText');
    const detailMetric = document.getElementById('bpDetailMetric');

    function activateModule(id) {
      const data = moduleSpecs[id];
      if (!data) return;

      tabs.forEach((t) => {
        const active = t.dataset.module === String(id);
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', String(active));
      });
      nodes.forEach((n) => n.classList.toggle('is-active', n.dataset.module === String(id)));
      cards.forEach((c) => c.classList.toggle('is-highlighted', c.dataset.moduleCard === String(id)));

      if (detailTag) detailTag.textContent = data.tag;
      if (detailText) detailText.textContent = data.text;
      if (detailMetric) detailMetric.textContent = data.metric;
    }

    tabs.forEach((t) => t.addEventListener('click', () => activateModule(t.dataset.module)));
    nodes.forEach((n) => n.addEventListener('click', () => activateModule(n.dataset.module)));

    const btnUrban = document.getElementById('btnUrban');
    const btnRural = document.getElementById('btnRural');
    const panelUrban = document.getElementById('panelUrban');
    const panelRural = document.getElementById('panelRural');

    if (btnUrban && btnRural && panelUrban && panelRural) {
      btnUrban.addEventListener('click', () => {
        btnUrban.classList.add('is-active');
        btnRural.classList.remove('is-active');
        btnUrban.setAttribute('aria-selected', 'true');
        btnRural.setAttribute('aria-selected', 'false');
        panelUrban.hidden = false;
        panelRural.hidden = true;
      });
      btnRural.addEventListener('click', () => {
        btnRural.classList.add('is-active');
        btnUrban.classList.remove('is-active');
        btnRural.setAttribute('aria-selected', 'true');
        btnUrban.setAttribute('aria-selected', 'false');
        panelRural.hidden = false;
        panelUrban.hidden = true;
      });
    }

    const hotspotData = {
      reator: {
        title: '01 · Reator anaeróbico 3.000 L + gasômetro',
        desc: 'Reator fechado para áreas urbanas sem cheiro. Recebe ~35 kg/dia de restos orgânicos diluídos pelo funil misturador, com 30 dias de retenção e gasômetro de 4 a 5 m³.',
        s1l: 'Volume reator',
        s1v: '3.000 L (30d)',
        s2l: 'Gasômetro',
        s2v: '4 – 5 m³',
      },
      gas: {
        title: '02 · Skid de filtragem H₂S e segurança térmica',
        desc: 'Filtro dessulfurizador obrigatório contra corrosão, dreno de umidade, válvulas, corta-chamas, manômetro e booster de baixa pressão para alimentação de aquecedores de água, boilers e caldeiras.',
        s1l: 'Eficiência térmica',
        s1v: '70% – 85%',
        s2l: 'Proteção',
        s2v: 'H₂S + corta-chamas',
      },
      pulmao: {
        title: '03 · Tanque pulmão 1.000 L + engate camlock',
        desc: 'Armazena cerca de 612 L/semana de biofertilizante líquido em tanque vedado. Tem bomba de transferência e engate rápido camlock para retirada semanal gratuita por chácaras, viveiros ou paisagistas.',
        s1l: 'Armazenamento',
        s1v: '1.000 L vedado',
        s2l: 'Economia CAPEX',
        s2v: '> R$ 3.300 vs filtro',
      },
      iot: {
        title: '04 · Central IoT e painel QR ESG',
        desc: 'Lê pressão do gás, temperatura interna e nível do tanque pulmão. Dispara alertas preventivos antes de a biologia desregular e atualiza o painel do QR Code da recepção.',
        s1l: 'Sensores',
        s1v: 'Pressão · Temp · Nível',
        s2l: 'Assinatura SaaS',
        s2v: 'R$ 99–199 / mês',
      },
    };

    const hotspots = document.querySelectorAll('.hotspot');
    const hsTitle = document.getElementById('hsTitle');
    const hsDesc = document.getElementById('hsDesc');
    const hsSpec1Label = document.getElementById('hsSpec1Label');
    const hsSpec1Val = document.getElementById('hsSpec1Val');
    const hsSpec2Label = document.getElementById('hsSpec2Label');
    const hsSpec2Val = document.getElementById('hsSpec2Val');

    hotspots.forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.hotspot;
        const item = hotspotData[key];
        if (!item) return;

        hotspots.forEach((h) => h.classList.toggle('is-active', h === btn));
        hsTitle.textContent = item.title;
        hsDesc.textContent = item.desc;
        hsSpec1Label.textContent = item.s1l;
        hsSpec1Val.textContent = item.s1v;
        hsSpec2Label.textContent = item.s2l;
        hsSpec2Val.textContent = item.s2v;

        document.querySelectorAll('.iso-part').forEach((part) => {
          part.classList.toggle('is-focused', part.dataset.part === key);
        });
      });
    });
  }

  /* ------------------------------------------------------------------------
     4. INTERACTIVE ROI & PAYBACK CALCULATOR (Exact Calibrated Math)
     ------------------------------------------------------------------------ */
  function initRoiSimulator() {
    const range = document.getElementById('simRange');
    const kgDisplay = document.getElementById('simKgVal');
    const outMonthlyGlp = document.getElementById('outMonthlyGlp');
    const outNetSummary = document.getElementById('outNetSummary');
    const outPayback = document.getElementById('outPayback');
    const outBiofertWeek = document.getElementById('outBiofertWeek');
    const outBiofertDay = document.getElementById('outBiofertDay');
    const outDiverted = document.getElementById('outDiverted');
    const outRecommendation = document.getElementById('outRecommendation');
    const presetBtns = document.querySelectorAll('.preset-btn');

    if (!range) return;

    const brl = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    });
    const numFmt = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });
    const intFmt = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });

    function calculate(kg) {
      // Exact calibration matching all 5 reference figures:
      // 10 kg = R$ 143 | 35 kg = R$ 502 | 50 kg = R$ 717 | 100 kg = R$ 1.433 | 200 kg = R$ 2.866
      const monthlyGross = Math.round(kg * 14.331);
      const opex = kg <= 100 ? 200 : 300;
      const netMonthly = monthlyGross - opex;

      // Biofertilizer: 2.5 L/kg/day -> 35 kg = 87.5 L/day and ~612 L/week
      const dailyBiofert = kg * 2.5;
      const weeklyBiofert = Math.floor(dailyBiofert * 7);
      const monthlyDiverted = kg * 30;

      // Same base peripheral CAPEX (R$ 22.029) up to 100 kg/day:
      // 35 kg -> 22029 / (302 * 12) = 6,1 anos
      // 50 kg -> 22029 / (517 * 12) = 3,6 anos
      // 100 kg -> 22029 / (1233 * 12) = 1,5 ano
      const capex = kg <= 100 ? 22029 : 22029 + (kg - 100) * 180;
      const paybackStr = netMonthly <= 0
        ? 'Projeto ESG / saneamento'
        : `${(capex / (netMonthly * 12)).toFixed(1).replace('.', ',')} anos`;

      const pct = ((kg - Number(range.min)) / (Number(range.max) - Number(range.min))) * 100;
      range.style.setProperty('--pct', `${pct}%`);

      kgDisplay.textContent = kg;
      outMonthlyGlp.textContent = brl.format(monthlyGross);
      outNetSummary.textContent = netMonthly > 0
        ? `Saldo líquido: ~${brl.format(netMonthly)}/mês (descontando ~${brl.format(opex)} de OPEX)`
        : `Economia bruta de ${brl.format(monthlyGross)}/mês · foco em saneamento e redução de coleta paga`;
      outPayback.textContent = paybackStr;
      outBiofertWeek.textContent = `${intFmt.format(weeklyBiofert)} L`;
      outBiofertDay.textContent = `${numFmt.format(dailyBiofert)} L`;
      outDiverted.textContent = `${intFmt.format(monthlyDiverted)} kg`;

      if (kg <= 35) {
        outRecommendation.innerHTML =
          `<strong>Kit Urbano 35 kg/dia (R$ 22.029):</strong> Reator de 3.000 L e tanque pulmão de 1.000 L. Porta de entrada para pousadas ecológicas ou hotéis urbanos que já pagam coleta privada.`;
      } else if (kg <= 100) {
        outRecommendation.innerHTML =
          `<strong>Faixa de tração (50 a 100 kg/dia):</strong> Usa quase a mesma estrutura periférica do kit de 35 kg/dia e reduz o payback para <strong>${paybackStr}</strong>.`;
      } else {
        outRecommendation.innerHTML =
          `<strong>Escala resort ou mini-hub (200+ kg/dia):</strong> Alto volume em um único hotel ou unidade atendendo pousadas vizinhas, com economia acima de <strong>${brl.format(monthlyGross)}/mês</strong>.`;
      }

      presetBtns.forEach((btn) => {
        btn.classList.toggle('is-active', Number(btn.dataset.kg) === kg);
      });
    }

    range.addEventListener('input', () => calculate(Number(range.value)));
    presetBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const kg = Number(btn.dataset.kg);
        range.value = kg;
        calculate(kg);
      });
    });

    calculate(Number(range.value));
  }

  /* ------------------------------------------------------------------------
     5. LIVE IOT TELEMETRY SIMULATION & ANIMATED WAVEFORM
     ------------------------------------------------------------------------ */
  function initIoTConsole() {
    const valPressure = document.getElementById('valPressure');
    const valTemp = document.getElementById('valTemp');
    const valLevel = document.getElementById('valLevel');
    const stTemp = document.getElementById('stTemp');
    const stLevel = document.getElementById('stLevel');
    const tileTemp = document.getElementById('tileTemp');
    const tileLevel = document.getElementById('tileLevel');
    const alertBanner = document.getElementById('iotAlertBanner');
    const alertMsg = document.getElementById('iotAlertMsg');
    const alertTag = document.getElementById('iotAlertTag');
    const btnSimAlert = document.getElementById('btnSimulateAlert');
    const chartCanvas = document.getElementById('telemetryChart');
    const guestKg = document.getElementById('guestKgCounter');
    const guestBio = document.getElementById('guestBioCounter');

    if (!chartCanvas) return;
    const ctx = chartCanvas.getContext('2d');

    let alertActive = false;
    let guestTotal = 1050; // 35 kg/day * 30 days = 1.050 kg/month
    const series = [3.9, 4.1, 4.3, 4.2, 4.5, 4.7, 4.6, 4.8, 4.7, 4.9, 4.6, 4.7, 4.8, 4.6, 4.5, 4.7, 4.9, 4.8];

    function drawChart() {
      const w = chartCanvas.width;
      const h = chartCanvas.height;
      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(244, 242, 236, 0.07)';
      ctx.lineWidth = 1;
      for (let i = 1; i <= 3; i++) {
        const y = (h / 4) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      const minV = 2.8;
      const maxV = 5.4;
      const stepX = w / (series.length - 1);

      const points = series.map((v, idx) => ({
        x: idx * stepX,
        y: h - ((v - minV) / (maxV - minV)) * (h - 22) - 10,
      }));

      ctx.beginPath();
      ctx.moveTo(points[0].x, h);
      points.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.lineTo(points[points.length - 1].x, h);
      ctx.closePath();
      ctx.fillStyle = alertActive ? 'rgba(255, 107, 43, 0.16)' : 'rgba(16, 240, 160, 0.14)';
      ctx.fill();

      ctx.beginPath();
      points.forEach((p, idx) => (idx === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.strokeStyle = alertActive ? '#ff6b2b' : '#10f0a0';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      const last = points[points.length - 1];
      ctx.beginPath();
      ctx.arc(last.x, last.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = alertActive ? '#ff6b2b' : '#10f0a0';
      ctx.fill();
    }

    drawChart();

    setInterval(() => {
      if (alertActive) {
        valPressure.textContent = `${(14.8 + (Math.random() - 0.5) * 0.4).toFixed(1)} mbar`;
        valTemp.textContent = `${(29.4 + (Math.random() - 0.5) * 0.3).toFixed(1)} °C`;
        valLevel.textContent = '89%';
        series.shift();
        series.push(3.5 + Math.random() * 0.35);
      } else {
        valPressure.textContent = `${(18.4 + (Math.random() - 0.5) * 0.5).toFixed(1)} mbar`;
        valTemp.textContent = `${(35.6 + (Math.random() - 0.5) * 0.3).toFixed(1)} °C`;
        valLevel.textContent = `${62 + Math.floor(Math.random() * 2)}%`;
        series.shift();
        series.push(4.45 + Math.random() * 0.45);
      }

      guestTotal += 2;
      if (guestKg) guestKg.textContent = `${guestTotal.toLocaleString('pt-BR')} kg`;
      if (guestBio) guestBio.textContent = `${Math.round(guestTotal * 2.5).toLocaleString('pt-BR')} L`;
      drawChart();
    }, 2200);

    if (btnSimAlert) {
      btnSimAlert.addEventListener('click', () => {
        alertActive = !alertActive;
        tileTemp.classList.toggle('is-alert', alertActive);
        tileLevel.classList.toggle('is-alert', alertActive);
        alertBanner.classList.toggle('is-warning', alertActive);

        if (alertActive) {
          btnSimAlert.textContent = 'Restaurar operação normal';
          stTemp.textContent = '▲ Queda térmica detectada';
          stLevel.textContent = '▲ Pulmão em 89% · Coleta acionada';
          alertMsg.textContent =
            'Alerta preventivo disparado: suporte remoto acionou ajuste de carga e antecipou a coleta camlock antes de qualquer parada.';
          alertTag.textContent = 'PREVENÇÃO ATIVA';
        } else {
          btnSimAlert.textContent = 'Testar alerta preventivo';
          stTemp.textContent = '● Zona mesofílica';
          stLevel.textContent = '● Coleta: Qui 08h';
          alertMsg.textContent =
            'Biologia estável. Pressão, temperatura interna e nível do tanque pulmão dentro da faixa.';
          alertTag.textContent = 'STATUS: NOMINAL';
        }
        drawChart();
      });
    }
  }

  /* ------------------------------------------------------------------------
     6. FINANCIAL X-RAY ACCORDION & DIAGNOSTIC FORM
     ------------------------------------------------------------------------ */
  function initXrayAndForm() {
    const xrayBox = document.getElementById('xrayBox');
    const xrayTrigger = document.getElementById('xrayTrigger');
    if (xrayBox && xrayTrigger) {
      xrayTrigger.addEventListener('click', () => {
        const isOpen = xrayBox.classList.toggle('is-open');
        xrayTrigger.setAttribute('aria-expanded', String(isOpen));
      });
    }

    const form = document.getElementById('diagForm');
    const successBox = document.getElementById('formSuccess');
    const summaryText = document.getElementById('formSummaryText');
    const btnReset = document.getElementById('btnResetForm');

    if (form && successBox) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const hotel = document.getElementById('fHotel').value.trim();
        const kg = Number(document.getElementById('fVolume').value);
        const ambiente = document.getElementById('fAmbiente').value;
        const cidade = document.getElementById('fCidade').value.trim();

        const estMonthly = Math.round(kg * 14.331).toLocaleString('pt-BR');
        const estBio = Math.floor(kg * 2.5 * 7).toLocaleString('pt-BR');

        summaryText.innerHTML =
          `Para <strong>${hotel}</strong> (${cidade}), a estimativa base é de <strong>R$ ${estMonthly}/mês</strong> de economia bruta em GLP e cerca de <strong>${estBio} L/semana</strong> de biofertilizante no formato <em>${ambiente}</em>.`;

        Array.from(form.children).forEach((child) => {
          if (child !== successBox) child.style.display = 'none';
        });
        successBox.hidden = false;
      });

      btnReset?.addEventListener('click', () => {
        form.reset();
        Array.from(form.children).forEach((child) => {
          if (child !== successBox) child.style.display = '';
        });
        successBox.hidden = true;
      });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    initScrollAndNav();
    initMotionCraft();
    initArchitectureModules();
    initRoiSimulator();
    initIoTConsole();
    initXrayAndForm();
  });
})();
