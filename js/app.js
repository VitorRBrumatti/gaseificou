/* ==========================================================================
   GASEIFICOU! — Interactive Choreography, CAD Inspector & Viability Calculator
   ========================================================================== */

(function () {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------------
     1. LENIS SMOOTH SCROLL + SCROLL PROGRESS + MOBILE NAV
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
    const navShell = document.getElementById('navShell');

    function syncScrollUI() {
      const y = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (y / docHeight) * 100 : 0;
      if (progressBar) progressBar.style.width = `${pct}%`;
      if (navShell) navShell.classList.toggle('is-scrolled', y > 24);
    }

    syncScrollUI();
    window.addEventListener('scroll', syncScrollUI, { passive: true });

    const navToggle = document.getElementById('navToggle');
    if (navToggle && navShell) {
      navToggle.addEventListener('click', () => {
        const open = navShell.classList.toggle('is-open');
        navToggle.setAttribute('aria-expanded', String(open));
      });
    }
  }

  /* ------------------------------------------------------------------------
     2. GSAP SCROLL-PASS HERO & REVEALS
     ------------------------------------------------------------------------ */
  function initMotionCraft() {
    if (!prefersReducedMotion) {
      document.querySelectorAll('.magnetic').forEach((btn) => {
        btn.addEventListener('pointermove', (e) => {
          const rect = btn.getBoundingClientRect();
          const dx = (e.clientX - rect.left - rect.width / 2) * 0.16;
          const dy = (e.clientY - rect.top - rect.height / 2) * 0.16;
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

    // Entrance on .line-wrap (separate element from scroll-scrubbed .hero-line-1/2 so opacity is ALWAYS 1 at y=0)
    gsap.fromTo(
      '#heroTitle .line-wrap',
      { y: 36, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.85,
        stagger: 0.12,
        ease: 'power4.out',
        delay: 0.05,
      }
    );

    gsap.from('.hero-reveal', {
      y: 20,
      opacity: 0,
      duration: 0.75,
      stagger: 0.09,
      ease: 'power3.out',
      delay: 0.22,
    });

    // Centered Hero title starts 100% visible at y=0 and splits wide + blurs + fades OUT intensely on scroll
    if (typeof ScrollTrigger !== 'undefined') {
      const heroTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#heroSection',
          start: 'top top',
          end: '72% top',
          scrub: 0.45,
        },
      });

      heroTl
        .fromTo(
          '.hero-line-1',
          { xPercent: 0, scale: 1, opacity: 1, filter: 'blur(0px)' },
          { xPercent: -68, scale: 1.1, opacity: 0, filter: 'blur(12px)', ease: 'power1.in', immediateRender: false },
          0
        )
        .fromTo(
          '.hero-line-2',
          { xPercent: 0, scale: 1, opacity: 1, filter: 'blur(0px)' },
          { xPercent: 68, scale: 1.1, opacity: 0, filter: 'blur(12px)', ease: 'power1.in', immediateRender: false },
          0
        )
        .fromTo(
          '#heroTitle',
          { y: 0 },
          { y: -95, ease: 'none', immediateRender: false },
          0
        )
        .fromTo(
          '.hero__cta-row',
          { y: 0, scale: 1, opacity: 1 },
          { y: -45, scale: 0.94, opacity: 0, ease: 'power1.in', immediateRender: false },
          0.06
        );
    }

    document.querySelectorAll('.reveal-up').forEach((el) => {
      gsap.from(el, {
        y: 30,
        opacity: 0,
        duration: 0.75,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true,
        },
      });
    });

    gsap.from('.bar-seg', {
      scaleX: 0,
      duration: 0.9,
      stagger: 0.08,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.eff-chart',
        start: 'top 86%',
        once: true,
      },
    });

    // High-impact "data arriving big" choreography for the 4 Glassmorphism Modules
    if (document.getElementById('modulesGrid')) {
      const intFmt = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
      const cards = document.querySelectorAll('#modulesGrid .module-glass');

      cards.forEach((card, index) => {
        const heroNum = card.querySelector('.module-hero-stat__num');
        const heroLabel = card.querySelector('.module-hero-stat__label');
        const datums = card.querySelectorAll('.module-datum');
        const counters = card.querySelectorAll('.stat-count');

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: 'top 86%',
            once: true,
          },
          delay: (index % 2) * 0.12,
        });

        tl.from(card, {
          y: 32,
          opacity: 0,
          duration: 0.7,
          ease: 'power3.out',
        });

        if (heroNum) {
          tl.fromTo(
            heroNum,
            { y: 52, scale: 1.32, opacity: 0, filter: 'blur(10px)' },
            {
              y: 0,
              scale: 1,
              opacity: 1,
              filter: 'blur(0px)',
              duration: 0.95,
              ease: 'expo.out',
            },
            '-=0.52'
          );
        }

        if (heroLabel) {
          tl.from(
            heroLabel,
            { y: 16, opacity: 0, duration: 0.55, ease: 'power2.out' },
            '-=0.65'
          );
        }

        if (datums.length) {
          tl.from(
            datums,
            { y: 20, opacity: 0, duration: 0.55, stagger: 0.08, ease: 'power3.out' },
            '-=0.55'
          );
        }

        counters.forEach((el) => {
          const target = Number(el.dataset.target);
          if (!Number.isFinite(target)) return;
          const obj = { val: 0 };
          tl.to(
            obj,
            {
              val: target,
              duration: 1.25,
              ease: 'power3.out',
              onUpdate: () => {
                el.textContent = intFmt.format(Math.round(obj.val));
              },
            },
            0.12
          );
        });
      });
    }
  }

  /* ------------------------------------------------------------------------
     3. REFACTORED PROCESS RAIL, URBAN/RURAL SWITCH & HARDWARE CAD INSPECTOR
     ------------------------------------------------------------------------ */
  function initArchitecture() {
    const railSpecs = {
      1: {
        text: 'Reator de 3.000 L feito para ~35 kg/dia de orgânicos triados. Fica 30 dias em digestão, armazena 4 a 5 m³ no gasômetro e recebe a carga pelo funil misturador.',
        stat: 'RETENÇÃO: 30 DIAS · 3.000 L',
      },
      2: {
        text: 'Filtro obrigatório de H₂S contra corrosão e dreno de umidade. A linha ainda leva válvulas, corta-chamas, manômetro e booster de baixa pressão para aquecedores de água.',
        stat: 'EFICIÊNCIA TÉRMICA: 70% – 85%',
      },
      3: {
        text: 'Cada 1 kg de alimento vira ~2,5 L de digestato líquido (~87,5 L/dia ou ~612 L/semana em 35 kg/dia). O tanque pulmão de 1.000 L com camlock resolve a retirada semanal gratuita.',
        stat: 'ECONOMIA > R$ 3.300 EM FILTROS',
      },
      4: {
        text: 'Sensores acompanham o reator e o tanque pulmão à distância. Qualquer desvio gera alerta preventivo, e o QR Code abre o painel ao vivo para quem visita o local.',
        stat: 'ASSINATURA: R$ 99 – 199 / MÊS',
      },
    };

    const railSteps = document.querySelectorAll('.rail-step');
    const moduleCards = document.querySelectorAll('[data-module-card]');
    const detailText = document.getElementById('railDetailText');
    const detailStat = document.getElementById('railDetailStat');

    railSteps.forEach((step) => {
      step.addEventListener('click', () => {
        const id = step.dataset.module;
        const data = railSpecs[id];
        if (!data) return;

        railSteps.forEach((s) => {
          const active = s.dataset.module === id;
          s.classList.toggle('is-active', active);
          s.setAttribute('aria-selected', String(active));
        });
        moduleCards.forEach((c) => {
          c.classList.toggle('is-highlighted', c.dataset.moduleCard === id);
        });

        if (detailText) detailText.textContent = data.text;
        if (detailStat) detailStat.textContent = data.stat;
      });
    });

    // Urban vs Rural Mode Toggle inside Module 3 (with smooth stat transition)
    const btnUrban = document.getElementById('btnUrban');
    const btnRural = document.getElementById('btnRural');
    const panelUrban = document.getElementById('panelUrban');
    const panelRural = document.getElementById('panelRural');
    const m3HeroNum = document.getElementById('m3HeroNum');
    const m3HeroUnit = document.getElementById('m3HeroUnit');
    const m3HeroLabel = document.getElementById('m3HeroLabel');

    function animateM3Hero(targetNum, unit, label, isDecimal) {
      if (!m3HeroNum) return;
      if (m3HeroUnit) m3HeroUnit.textContent = unit;
      if (m3HeroLabel) m3HeroLabel.textContent = label;
      const heroWrap = m3HeroNum.closest('.module-hero-stat__num');
      if (typeof gsap !== 'undefined' && !prefersReducedMotion) {
        if (heroWrap) {
          gsap.fromTo(
            heroWrap,
            { y: 24, scale: 1.22, opacity: 0.2, filter: 'blur(6px)' },
            { y: 0, scale: 1, opacity: 1, filter: 'blur(0px)', duration: 0.65, ease: 'expo.out' }
          );
        }
        const obj = { v: 0 };
        gsap.to(obj, {
          v: targetNum,
          duration: 0.7,
          ease: 'power3.out',
          onUpdate: () => {
            m3HeroNum.textContent = isDecimal
              ? obj.v.toFixed(1).replace('.', ',')
              : Math.round(obj.v).toLocaleString('pt-BR');
          },
        });
      } else {
        m3HeroNum.textContent = isDecimal
          ? targetNum.toFixed(1).replace('.', ',')
          : targetNum.toLocaleString('pt-BR');
      }
    }

    if (btnUrban && btnRural && panelUrban && panelRural) {
      btnUrban.addEventListener('click', () => {
        btnUrban.classList.add('is-active');
        btnRural.classList.remove('is-active');
        btnUrban.setAttribute('aria-selected', 'true');
        btnRural.setAttribute('aria-selected', 'false');
        panelUrban.hidden = false;
        panelRural.hidden = true;
        animateM3Hero(612, 'L/sem', 'Biofertilizante líquido (~87,5 L/dia · 2,5 L/kg)', false);
      });
      btnRural.addEventListener('click', () => {
        btnRural.classList.add('is-active');
        btnUrban.classList.remove('is-active');
        btnRural.setAttribute('aria-selected', 'true');
        btnUrban.setAttribute('aria-selected', 'false');
        panelRural.hidden = false;
        panelUrban.hidden = true;
        animateM3Hero(2.5, 'L/kg', 'Aplicação diluída direto nos jardins e hortas do terreno', true);
      });
    }

    // Precision Hardware CAD Inspector (synced across top tabs, SVG pins, and SVG assemblies)
    const cadSpecs = {
      reator: {
        idx: 'SUBSISTEMA 01 / 04',
        title: 'Reator anaeróbico 3.000 L + gasômetro',
        desc: 'Reator fechado para áreas urbanas sem cheiro. Recebe ~35 kg/dia de orgânicos diluídos no funil misturador e mantém 30 dias de retenção com gasômetro de 4 a 5 m³.',
        s1l: 'Volume reator',
        s1v: '3.000 L (30 dias)',
        s2l: 'Gasômetro',
        s2v: '4 – 5 m³',
        s3l: 'Referência COGS',
        s3v: 'R$ 7.000',
      },
      gas: {
        idx: 'SUBSISTEMA 02 / 04',
        title: 'Skid de filtragem H₂S e segurança térmica',
        desc: 'Filtro dessulfurizador obrigatório contra corrosão e dreno de umidade. Completa o conjunto com válvulas, corta-chamas, manômetro e booster para aquecedores e boilers.',
        s1l: 'Eficiência térmica',
        s1v: '70% – 85%',
        s2l: 'Proteção',
        s2v: 'H₂S + corta-chamas',
        s3l: 'Referência COGS',
        s3v: 'R$ 3.200',
      },
      pulmao: {
        idx: 'SUBSISTEMA 03 / 04',
        title: 'Tanque pulmão 1.000 L + engate camlock',
        desc: 'Armazena cerca de 612 L por semana de biofertilizante em tanque vedado. A bomba e o engate camlock deixam a retirada semanal limpa para chácaras ou viveiros parceiros.',
        s1l: 'Armazenamento',
        s1v: '1.000 L vedado',
        s2l: 'Economia CAPEX',
        s2v: '> R$ 3.300 vs filtro',
        s3l: 'Referência COGS',
        s3v: 'R$ 2.200',
      },
      iot: {
        idx: 'SUBSISTEMA 04 / 04',
        title: 'Central IoT e painel QR ESG',
        desc: 'Monitora o reator e o nível do pulmão sem conferência manual. Dispara alertas antes de a biologia desregular e atualiza o painel público via QR Code.',
        s1l: 'Sensores',
        s1v: 'Pressão · Temp · Nível',
        s2l: 'Assinatura SaaS',
        s2v: 'R$ 99 – 199 / mês',
        s3l: 'Referência COGS',
        s3v: 'R$ 600',
      },
    };

    const cadNavBtns = document.querySelectorAll('.cad-nav__btn');
    const cadPins = document.querySelectorAll('.cad-pin');
    const isoParts = document.querySelectorAll('.iso-part');
    const hsIdx = document.getElementById('hsIdx');
    const hsTitle = document.getElementById('hsTitle');
    const hsDesc = document.getElementById('hsDesc');
    const hsSpec1Label = document.getElementById('hsSpec1Label');
    const hsSpec1Val = document.getElementById('hsSpec1Val');
    const hsSpec2Label = document.getElementById('hsSpec2Label');
    const hsSpec2Val = document.getElementById('hsSpec2Val');
    const hsSpec3Label = document.getElementById('hsSpec3Label');
    const hsSpec3Val = document.getElementById('hsSpec3Val');

    function selectCadPart(key) {
      const item = cadSpecs[key];
      if (!item) return;

      cadNavBtns.forEach((b) => {
        const active = b.dataset.hotspot === key;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-selected', String(active));
      });
      cadPins.forEach((p) => p.classList.toggle('is-active', p.dataset.hotspot === key));
      isoParts.forEach((part) => part.classList.toggle('is-focused', part.dataset.part === key));

      hsIdx.textContent = item.idx;
      hsTitle.textContent = item.title;
      hsDesc.textContent = item.desc;
      hsSpec1Label.textContent = item.s1l;
      hsSpec1Val.textContent = item.s1v;
      hsSpec2Label.textContent = item.s2l;
      hsSpec2Val.textContent = item.s2v;
      hsSpec3Label.textContent = item.s3l;
      hsSpec3Val.textContent = item.s3v;
    }

    cadNavBtns.forEach((b) => b.addEventListener('click', () => selectCadPart(b.dataset.hotspot)));
    cadPins.forEach((p) => p.addEventListener('click', () => selectCadPart(p.dataset.hotspot)));
    isoParts.forEach((part) => part.addEventListener('click', () => selectCadPart(part.dataset.part)));
  }

  /* ------------------------------------------------------------------------
     4. ESTABLISHMENT-AGNOSTIC VIABILITY CALCULATOR (Exact Calibrated Math)
     ------------------------------------------------------------------------ */
  function initViabilityCalculator() {
    const range = document.getElementById('simRange');
    const kgInput = document.getElementById('simKgInput');
    const wasteRange = document.getElementById('simWasteRange');
    const wasteVal = document.getElementById('simWasteVal');
    const outMonthlyGlp = document.getElementById('outMonthlyGlp');
    const outNetSummary = document.getElementById('outNetSummary');
    const outPayback = document.getElementById('outPayback');
    const outBiofertWeek = document.getElementById('outBiofertWeek');
    const outBiofertDay = document.getElementById('outBiofertDay');
    const outDiverted = document.getElementById('outDiverted');
    const outRecommendation = document.getElementById('outRecommendation');
    const outFiveYearNet = document.getElementById('outFiveYearNet');
    const barRecover = document.getElementById('barRecover');
    const barProfit = document.getElementById('barProfit');
    const legendRecover = document.getElementById('legendRecover');
    const legendProfit = document.getElementById('legendProfit');
    const presetBtns = document.querySelectorAll('.preset-btn');

    if (!range || !kgInput) return;

    const brl = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    });
    const numFmt = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });
    const intFmt = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });

    function update() {
      const kg = Math.max(10, Math.min(300, Number(kgInput.value) || 10));
      const wasteSavings = Number(wasteRange?.value || 0);

      // Exact calibration:
      // 10 kg = R$ 143 | 35 kg = R$ 502 | 50 kg = R$ 717 | 100 kg = R$ 1.433 | 200 kg = R$ 2.866
      const monthlyGlp = Math.round(kg * 14.331);
      const opex = kg <= 100 ? 200 : 300;
      const netMonthly = monthlyGlp + wasteSavings - opex;

      // Digestato: 2.5 L/kg/day -> 35 kg = 87.5 L/day and ~612 L/week
      const dailyBiofert = kg * 2.5;
      const weeklyBiofert = Math.floor(dailyBiofert * 7);
      const monthlyDiverted = kg * 30;

      // CAPEX reference: R$ 22.029 up to 100 kg/day (shared peripheral architecture)
      // 35 kg (waste=0) -> 22029 / (302 * 12) = 6,1 anos
      // 50 kg (waste=0) -> 22029 / (517 * 12) = 3,6 anos
      // 100 kg (waste=0) -> 22029 / (1233 * 12) = 1,5 anos
      const capex = kg <= 100 ? 22029 : 22029 + (kg - 100) * 180;
      const paybackYears = netMonthly > 0 ? capex / (netMonthly * 12) : null;
      const paybackStr = paybackYears !== null
        ? `${paybackYears.toFixed(1).replace('.', ',')} anos`
        : 'Saneamento / ESG';

      // 5-year net cumulative balance after recovering CAPEX
      const fiveYearNet = netMonthly * 60 - capex;

      // Update UI
      if (wasteVal) wasteVal.textContent = `${brl.format(wasteSavings)}/mês`;
      outMonthlyGlp.textContent = brl.format(monthlyGlp);

      if (netMonthly > 0) {
        const extra = wasteSavings > 0 ? ` + ${brl.format(wasteSavings)} coleta` : '';
        outNetSummary.textContent = `Saldo líquido: ~${brl.format(netMonthly)}/mês (GLP${extra} − ~${brl.format(opex)} OPEX)`;
      } else {
        outNetSummary.textContent = `Economia bruta de ${brl.format(monthlyGlp)}/mês · indicado para saneamento ou redução de coleta`;
      }

      outPayback.textContent = paybackStr;
      outBiofertWeek.textContent = `${intFmt.format(weeklyBiofert)} L`;
      outBiofertDay.textContent = `${numFmt.format(dailyBiofert)} L`;
      outDiverted.textContent = `${intFmt.format(monthlyDiverted)} kg`;

      // 5-year horizon visual bar
      if (paybackYears !== null && paybackYears < 5) {
        const recoverPct = Math.min(100, (paybackYears / 5) * 100);
        const profitPct = 100 - recoverPct;
        const profitYears = (5 - paybackYears).toFixed(1).replace('.', ',');
        barRecover.style.width = `${recoverPct}%`;
        barProfit.style.width = `${profitPct}%`;
        legendRecover.textContent = `Amortização: ${paybackStr}`;
        legendProfit.textContent = `Saldo positivo livre: ${profitYears} anos`;
        outFiveYearNet.textContent = `Lucro líquido em 5 anos: +${brl.format(fiveYearNet)}`;
      } else {
        barRecover.style.width = '100%';
        barProfit.style.width = '0%';
        legendRecover.textContent = paybackYears !== null ? `Amortização estimada: ${paybackStr}` : 'Sem payback direto só em GLP';
        legendProfit.textContent = 'Adicione economia de coleta privada para acelerar';
        outFiveYearNet.textContent = `Saldo acumulado 5 anos: ${brl.format(fiveYearNet)}`;
      }

      if (kg <= 35) {
        outRecommendation.innerHTML =
          `<strong>Kit Urbano 35 kg/dia (R$ 22.029):</strong> Reator de 3.000 L e tanque pulmão de 1.000 L. Porta de entrada para estabelecimentos de pequeno porte ou unidades urbanas que já pagam coleta privada.`;
      } else if (kg <= 100) {
        outRecommendation.innerHTML =
          `<strong>Faixa de tração (50 a 100 kg/dia):</strong> Usa quase a mesma estrutura periférica do kit de 35 kg/dia e reduz o payback do estabelecimento para <strong>${paybackStr}</strong>.`;
      } else {
        outRecommendation.innerHTML =
          `<strong>Escala grande porte ou mini-hub (200+ kg/dia):</strong> Alto volume em uma única operação ou unidade compartilhada entre estabelecimentos vizinhos, com economia de <strong>${brl.format(monthlyGlp)}/mês</strong> em GLP.`;
      }

      presetBtns.forEach((btn) => {
        btn.classList.toggle('is-active', Number(btn.dataset.kg) === kg);
      });
    }

    range.addEventListener('input', () => {
      kgInput.value = range.value;
      update();
    });

    kgInput.addEventListener('input', () => {
      const clamped = Math.max(10, Math.min(300, Number(kgInput.value) || 10));
      range.value = clamped;
      update();
    });

    wasteRange?.addEventListener('input', update);

    presetBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const kg = Number(btn.dataset.kg);
        range.value = kg;
        kgInput.value = kg;
        update();
        if (typeof gsap !== 'undefined' && !prefersReducedMotion && outMonthlyGlp) {
          gsap.fromTo(
            outMonthlyGlp,
            { scale: 1.12, y: 12, opacity: 0.4 },
            { scale: 1, y: 0, opacity: 1, duration: 0.45, ease: 'expo.out' }
          );
        }
      });
    });

    update();
  }

  /* ------------------------------------------------------------------------
     5. LIVE IOT TELEMETRY CONSOLE
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
    let guestTotal = 1050;
    const series = [3.9, 4.1, 4.3, 4.2, 4.5, 4.7, 4.6, 4.8, 4.7, 4.9, 4.6, 4.7, 4.8, 4.6, 4.5, 4.7, 4.9, 4.8];

    function drawChart() {
      const w = chartCanvas.width;
      const h = chartCanvas.height;
      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(244, 242, 236, 0.08)';
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
      ctx.fillStyle = alertActive ? 'rgba(255, 107, 43, 0.14)' : 'rgba(16, 240, 160, 0.12)';
      ctx.fill();

      ctx.beginPath();
      points.forEach((p, idx) => (idx === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.strokeStyle = alertActive ? '#ff6b2b' : '#10f0a0';
      ctx.lineWidth = 2;
      ctx.stroke();

      const last = points[points.length - 1];
      ctx.beginPath();
      ctx.arc(last.x, last.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = alertActive ? '#ff6b2b' : '#10f0a0';
      ctx.fill();
    }

    drawChart();

    setInterval(() => {
      if (alertActive) {
        valPressure.textContent = `${74 + Math.floor(Math.random() * 14)} ppm`;
        valTemp.textContent = `6.1 · ${(29.4 + (Math.random() - 0.5) * 0.3).toFixed(1)} °C`;
        valLevel.textContent = 'FECHADA';
        series.shift();
        series.push(3.5 + Math.random() * 0.35);
      } else {
        valPressure.textContent = `${16 + Math.floor(Math.random() * 5)} ppm`;
        valTemp.textContent = `7.1 · ${(35.6 + (Math.random() - 0.5) * 0.3).toFixed(1)} °C`;
        valLevel.textContent = '0 ppm';
        series.shift();
        series.push(4.45 + Math.random() * 0.45);
      }

      guestTotal += 2;
      if (guestKg) guestKg.textContent = `${guestTotal.toLocaleString('pt-BR')} kg`;
      if (guestBio) guestBio.textContent = `${Math.round(guestTotal * 2.5).toLocaleString('pt-BR')} L`;
      drawChart();
    }, 2200);

    const tilePressure = document.getElementById('tilePressure');
    const stPressure = document.getElementById('stPressure');
    const valFlowRate = document.getElementById('valFlowRate');

    if (btnSimAlert) {
      btnSimAlert.addEventListener('click', () => {
        alertActive = !alertActive;
        tilePressure?.classList.toggle('is-alert', alertActive);
        tileTemp.classList.toggle('is-alert', alertActive);
        tileLevel.classList.toggle('is-alert', alertActive);
        alertBanner.classList.toggle('is-warning', alertActive);

        if (alertActive) {
          btnSimAlert.textContent = 'Restaurar operação normal';
          if (stPressure) stPressure.textContent = 'Acima de 50 ppm · Trocar refil';
          if (valFlowRate) {
            valFlowRate.textContent = '3,6 m³/dia · Trocar refil H₂S';
            valFlowRate.style.color = 'var(--flame-amber)';
          }
          stTemp.textContent = 'Alerta de acidificação (pH 6.1)';
          stLevel.textContent = 'Solenoide fechada · Bloqueio ativo';
          alertMsg.textContent =
            'Alerta preditivo acionado: refil de H₂S acima de 50 ppm e queda de pH detectada. Válvula solenoide bloqueou a linha por segurança.';
          alertTag.textContent = 'PREVENÇÃO';
        } else {
          btnSimAlert.textContent = 'Testar alerta preventivo';
          if (stPressure) stPressure.textContent = 'Abaixo de 50 ppm';
          if (valFlowRate) {
            valFlowRate.textContent = '4,6 m³/dia · Filtro H₂S OK';
            valFlowRate.style.color = 'var(--bio-emerald)';
          }
          stTemp.textContent = 'Biologia estável';
          stLevel.textContent = 'Linha estanque';
          alertMsg.textContent =
            'Biologia estável. Todos os sensores dentro da faixa de operação.';
          alertTag.textContent = 'NOMINAL';
        }
        drawChart();
      });
    }
  }

  /* ------------------------------------------------------------------------
     6. DIAGNOSTIC FORM
     ------------------------------------------------------------------------ */
  function initDiagnosticForm() {
    const form = document.getElementById('diagForm');
    const successBox = document.getElementById('formSuccess');
    const summaryText = document.getElementById('formSummaryText');
    const btnReset = document.getElementById('btnResetForm');

    if (form && successBox) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const estabelecimento = document.getElementById('fEstabelecimento').value.trim();
        const kg = Number(document.getElementById('fVolume').value);
        const ambiente = document.getElementById('fAmbiente').value;
        const cidade = document.getElementById('fCidade').value.trim();

        const estMonthly = Math.round(kg * 14.331).toLocaleString('pt-BR');
        const estBio = Math.floor(kg * 2.5 * 7).toLocaleString('pt-BR');

        summaryText.innerHTML =
          `Para <strong>${estabelecimento}</strong> (${cidade}), a estimativa base é de <strong>R$ ${estMonthly}/mês</strong> de economia bruta em GLP e cerca de <strong>${estBio} L/semana</strong> de biofertilizante no formato <em>${ambiente}</em>.`;

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
    initArchitecture();
    initViabilityCalculator();
    initIoTConsole();
    initDiagnosticForm();
  });
})();
