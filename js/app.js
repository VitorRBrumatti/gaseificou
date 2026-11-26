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

    // Crisp tabular count-up choreography for the 4 Architectural Modules
    if (document.getElementById('modulesGrid')) {
      const intFmt = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
      const cards = document.querySelectorAll('#modulesGrid .arch-card');

      cards.forEach((card, index) => {
        const counters = card.querySelectorAll('.stat-count');
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: 'top 88%',
            once: true,
          },
          delay: (index % 2) * 0.08,
        });

        counters.forEach((el) => {
          const target = Number(el.dataset.target);
          if (!Number.isFinite(target)) return;
          const obj = { val: 0 };
          tl.to(
            obj,
            {
              val: target,
              duration: 1.0,
              ease: 'power3.out',
              onUpdate: () => {
                el.textContent = intFmt.format(Math.round(obj.val));
              },
            },
            0
          );
        });
      });
    }
  }

  /* ------------------------------------------------------------------------
     3. MODULE 3 SWITCH, 3D JUMP TRIGGERS & HARDWARE CAD INSPECTOR
     ------------------------------------------------------------------------ */
  function initArchitecture() {
    // Urban vs Rural Mode Toggle inside Module 3 (zero layout shift)
    const btnUrban = document.getElementById('btnUrban');
    const btnRural = document.getElementById('btnRural');
    const m3HeroNum = document.getElementById('m3HeroNum');
    const m3HeroUnit = document.getElementById('m3HeroUnit');
    const m3HeroLabel = document.getElementById('m3HeroLabel');
    const m3Desc = document.getElementById('m3Desc');
    const m3Specs = document.getElementById('m3Specs');

    const m3Modes = {
      urban: {
        num: 612,
        isDecimal: false,
        unit: 'L/sem',
        label: 'biofertilizante líquido (~87,5 L/dia · 2,5 L/kg)',
        desc: 'Tanque pulmão vedado de 1.000 L com bomba e engate rápido camlock para retirada semanal sem custo por parceiros locais.',
        specs: '<span>Pulmão <strong>1.000 L vedado</strong></span><span>Retirada <strong>Semanal grátis</strong></span><span>Economia <strong>&gt; R$ 3.300 vs. filtro</strong></span>',
      },
      rural: {
        num: 2.5,
        isDecimal: true,
        unit: 'L/kg',
        label: 'aplicação diluída direto nos jardins e hortas',
        desc: 'O biofertilizante líquido irriga áreas verdes do próprio terreno. O lodo de fundo vai para compostagem só a cada 6 a 24 meses.',
        specs: '<span>Ciclo <strong>100% local</strong></span><span>Uso <strong>Diluição direta</strong></span><span>Retirada lodo <strong>6–24 meses</strong></span>',
      },
    };

    function setM3Mode(mode) {
      const cfg = m3Modes[mode];
      if (!cfg || !m3HeroNum) return;

      const isUrban = mode === 'urban';
      btnUrban?.classList.toggle('is-active', isUrban);
      btnRural?.classList.toggle('is-active', !isUrban);
      btnUrban?.setAttribute('aria-selected', String(isUrban));
      btnRural?.setAttribute('aria-selected', String(!isUrban));

      if (m3HeroUnit) m3HeroUnit.textContent = cfg.unit;
      if (m3HeroLabel) m3HeroLabel.textContent = cfg.label;
      if (m3Desc) m3Desc.textContent = cfg.desc;
      if (m3Specs) m3Specs.innerHTML = cfg.specs;

      if (typeof gsap !== 'undefined' && !prefersReducedMotion) {
        const obj = { v: 0 };
        gsap.to(obj, {
          v: cfg.num,
          duration: 0.55,
          ease: 'power3.out',
          onUpdate: () => {
            m3HeroNum.textContent = cfg.isDecimal
              ? obj.v.toFixed(1).replace('.', ',')
              : Math.round(obj.v).toLocaleString('pt-BR');
          },
        });
      } else {
        m3HeroNum.textContent = cfg.isDecimal
          ? cfg.num.toFixed(1).replace('.', ',')
          : cfg.num.toLocaleString('pt-BR');
      }
    }

    btnUrban?.addEventListener('click', () => setM3Mode('urban'));
    btnRural?.addEventListener('click', () => setM3Mode('rural'));

    // "Ver no 3D" buttons scroll smoothly to CAD viewer and focus subsystem
    document.querySelectorAll('[data-cad-jump]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetKey = btn.dataset.cadJump;
        const cadEl = document.querySelector('.hardware-cad');
        if (cadEl) {
          cadEl.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
        }
        window.__gaseificouSelectCadPart?.(targetKey);
      });
    });

    // Precision Hardware CAD Inspector (bidirectional sync with Three.js 3D viewer)
    const cadSpecs = {
      reator: {
        idx: 'SUBSISTEMA 01 / 03',
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
        idx: 'SUBSISTEMA 02 / 03',
        title: 'Skid de filtragem H₂S e segurança térmica',
        desc: 'Coluna dessulfurizadora contra corrosão ácida nos trocadores de cobre e dreno condensador. Inclui manômetro, corta-chamas, válvula solenoide de CH₄ e booster para boilers.',
        s1l: 'Eficiência térmica',
        s1v: '80% – 85%',
        s2l: 'Gatilho H₂S',
        s2v: '50 – 100 ppm',
        s3l: 'Referência COGS',
        s3v: 'R$ 3.200',
      },
      pulmao: {
        idx: 'SUBSISTEMA 03 / 03',
        title: 'Tanque pulmão 1.000 L + engate camlock',
        desc: 'Armazena cerca de 612 L por semana de biofertilizante em tanque vedado. A bomba e o engate camlock deixam a retirada semanal limpa para chácaras ou viveiros parceiros.',
        s1l: 'Armazenamento',
        s1v: '1.000 L vedado',
        s2l: 'Economia CAPEX',
        s2v: '> R$ 3.300 vs filtro',
        s3l: 'Referência COGS',
        s3v: 'R$ 2.200',
      },
    };

    const cadNavBtns = document.querySelectorAll('.cad-nav__btn');
    const hsIdx = document.getElementById('hsIdx');
    const hsTitle = document.getElementById('hsTitle');
    const hsDesc = document.getElementById('hsDesc');
    const hsSpec1Label = document.getElementById('hsSpec1Label');
    const hsSpec1Val = document.getElementById('hsSpec1Val');
    const hsSpec2Label = document.getElementById('hsSpec2Label');
    const hsSpec2Val = document.getElementById('hsSpec2Val');
    const hsSpec3Label = document.getElementById('hsSpec3Label');
    const hsSpec3Val = document.getElementById('hsSpec3Val');

    function selectCadPart(key, opts = {}) {
      const item = cadSpecs[key];
      if (!item) return;

      cadNavBtns.forEach((b) => {
        const active = b.dataset.hotspot === key;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-selected', String(active));
      });

      hsIdx.textContent = item.idx;
      hsTitle.textContent = item.title;
      hsDesc.textContent = item.desc;
      hsSpec1Label.textContent = item.s1l;
      hsSpec1Val.textContent = item.s1v;
      hsSpec2Label.textContent = item.s2l;
      hsSpec2Val.textContent = item.s2v;
      hsSpec3Label.textContent = item.s3l;
      hsSpec3Val.textContent = item.s3v;

      if (!opts.from3D) {
        window.__gaseificouCad3D?.focusSubsystem(key, true);
      }
    }

    window.__gaseificouSelectCadPart = selectCadPart;
    cadNavBtns.forEach((b) => b.addEventListener('click', () => selectCadPart(b.dataset.hotspot)));
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
     5. DIAGNOSTIC FORM
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
    initDiagnosticForm();
  });
})();
