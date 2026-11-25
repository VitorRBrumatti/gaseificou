/* ==========================================================================
   GASEIFICOU! — Three.js 3D Bio-Thermal Hero Vortex & 60 FPS Burner Visual
   ========================================================================== */

(function () {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------------
     1. THREE.JS HERO: Organic Matter (Amber) -> Anaerobic Helix -> Biogas (Emerald/Cyan)
     ------------------------------------------------------------------------ */
  function initHeroWebGL() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0.6, 8.2);

    // Group shifted slightly to the right on desktop to balance the left-aligned typography
    const coreGroup = new THREE.Group();
    const getOffsetX = () => (window.innerWidth > 960 ? 2.15 : 0);
    coreGroup.position.set(getOffsetX(), 0.2, 0);
    scene.add(coreGroup);

    // Custom Glow Particle Texture
    const spriteCanvas = document.createElement('canvas');
    spriteCanvas.width = 64;
    spriteCanvas.height = 64;
    const sCtx = spriteCanvas.getContext('2d');
    const grad = sCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.28, 'rgba(255,255,255,0.85)');
    grad.addColorStop(0.65, 'rgba(255,255,255,0.2)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 64, 64);
    const particleTex = new THREE.CanvasTexture(spriteCanvas);

    // Particle System: 1,800 particles spiraling upward from warm organic amber -> emerald/cyan biogas
    const COUNT = 1800;
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const seeds = new Float32Array(COUNT * 3); // [angleOffset, radiusBase, speed]

    const cAmber = new THREE.Color('#ff6b2b');
    const cGold = new THREE.Color('#ffb84d');
    const cEmerald = new THREE.Color('#10f0a0');
    const cCyan = new THREE.Color('#00d4c8');
    const tempColor = new THREE.Color();

    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      const t = Math.random(); // 0 (bottom) -> 1 (top)
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.65 + Math.pow(Math.random(), 0.7) * 2.15 * (1 - t * 0.42);
      const y = (t - 0.5) * 6.8;

      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = y;
      positions[i3 + 2] = Math.sin(angle) * radius;

      seeds[i3] = angle;
      seeds[i3 + 1] = radius;
      seeds[i3 + 2] = 0.25 + Math.random() * 0.55;

      // Color gradient by elevation (organic input below -> clean thermal gas above)
      if (t < 0.35) {
        tempColor.lerpColors(cAmber, cGold, t / 0.35);
      } else if (t < 0.72) {
        tempColor.lerpColors(cGold, cEmerald, (t - 0.35) / 0.37);
      } else {
        tempColor.lerpColors(cEmerald, cCyan, (t - 0.72) / 0.28);
      }

      colors[i3] = tempColor.r;
      colors[i3 + 1] = tempColor.g;
      colors[i3 + 2] = tempColor.b;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const pMat = new THREE.PointsMaterial({
      size: 0.145,
      map: particleTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const particleField = new THREE.Points(pGeo, pMat);
    coreGroup.add(particleField);

    // Sculptural Architectural Reactor Wireframe Rings (Neo-Industrial Aesthetic)
    const ringGroup = new THREE.Group();
    const ringMatEmerald = new THREE.MeshBasicMaterial({
      color: 0x10f0a0,
      transparent: true,
      opacity: 0.16,
      wireframe: true,
    });
    const ringMatSubtle = new THREE.MeshBasicMaterial({
      color: 0xf4f2ec,
      transparent: true,
      opacity: 0.08,
      wireframe: true,
    });

    const outerReactor = new THREE.Mesh(
      new THREE.CylinderGeometry(1.95, 2.2, 4.4, 28, 6, true),
      ringMatSubtle
    );
    ringGroup.add(outerReactor);

    const innerCore = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.15, 2),
      ringMatEmerald
    );
    ringGroup.add(innerCore);

    // Orbital telemetry rings
    const torusGeo = new THREE.TorusGeometry(2.55, 0.012, 12, 96);
    const torusMat = new THREE.MeshBasicMaterial({
      color: 0x10f0a0,
      transparent: true,
      opacity: 0.28,
    });
    const ring1 = new THREE.Mesh(torusGeo, torusMat);
    ring1.rotation.x = Math.PI * 0.42;
    ring1.rotation.y = 0.25;
    ringGroup.add(ring1);

    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(2.85, 0.008, 12, 96),
      new THREE.MeshBasicMaterial({ color: 0xff6b2b, transparent: true, opacity: 0.22 })
    );
    ring2.rotation.x = Math.PI * 0.56;
    ring2.rotation.y = -0.35;
    ringGroup.add(ring2);

    coreGroup.add(ringGroup);

    // Mouse Parallax & Scroll Reactivity
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    window.addEventListener('pointermove', (e) => {
      pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      coreGroup.position.x = getOffsetX();
    });

    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();
      const dt = prefersReducedMotion ? 0 : 0.014;

      pointer.x += (pointer.tx - pointer.x) * 0.05;
      pointer.y += (pointer.ty - pointer.y) * 0.05;

      const posArr = pGeo.attributes.position.array;
      const colArr = pGeo.attributes.color.array;

      if (!prefersReducedMotion) {
        for (let i = 0; i < COUNT; i++) {
          const i3 = i * 3;
          let y = posArr[i3 + 1] + seeds[i3 + 2] * dt * 1.45;
          if (y > 3.4) y = -3.4;

          const normY = (y + 3.4) / 6.8; // 0..1
          const swirlAngle = seeds[i3] + elapsed * (0.42 + (1 - normY) * 0.35) + normY * 2.4;
          const r = seeds[i3 + 1] * (1.05 - normY * 0.38) + Math.sin(elapsed * 1.6 + seeds[i3]) * 0.08;

          posArr[i3] = Math.cos(swirlAngle) * r;
          posArr[i3 + 1] = y;
          posArr[i3 + 2] = Math.sin(swirlAngle) * r;

          // Update particle color smoothly as it transforms from organic -> pure gas
          if (normY < 0.35) {
            tempColor.lerpColors(cAmber, cGold, normY / 0.35);
          } else if (normY < 0.72) {
            tempColor.lerpColors(cGold, cEmerald, (normY - 0.35) / 0.37);
          } else {
            tempColor.lerpColors(cEmerald, cCyan, (normY - 0.72) / 0.28);
          }
          colArr[i3] = tempColor.r;
          colArr[i3 + 1] = tempColor.g;
          colArr[i3 + 2] = tempColor.b;
        }
        pGeo.attributes.position.needsUpdate = true;
        pGeo.attributes.color.needsUpdate = true;

        outerReactor.rotation.y = elapsed * 0.08;
        innerCore.rotation.y = -elapsed * 0.16;
        innerCore.rotation.x = elapsed * 0.09;
        ring1.rotation.z = elapsed * 0.22;
        ring2.rotation.z = -elapsed * 0.15;
      }

      // Smooth pointer tilt & subtle scroll sink
      const scrollRatio = Math.min(window.scrollY / window.innerHeight, 1.2);
      coreGroup.rotation.y = pointer.x * 0.28;
      coreGroup.rotation.x = pointer.y * 0.16 + scrollRatio * 0.25;
      coreGroup.position.y = 0.2 - scrollRatio * 0.85;

      renderer.render(scene, camera);
    }

    animate();
  }

  /* ------------------------------------------------------------------------
     2. REAL-TIME 60 FPS THERMAL BIOGAS BURNER RING CANVAS
     ------------------------------------------------------------------------ */
  function initBurnerCanvas() {
    const canvas = document.getElementById('burnerCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let w = 0;
    let h = 0;
    function resize() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width || 560;
      h = rect.height || 380;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    let time = 0;
    const JET_COUNT = 32;

    function draw() {
      time += prefersReducedMotion ? 0 : 0.055;
      ctx.clearRect(0, 0, w, h);

      // Deep dark brushed kitchen steel backdrop
      const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.5, 20, w * 0.5, h * 0.5, Math.max(w, h) * 0.72);
      bgGrad.addColorStop(0, '#0d221c');
      bgGrad.addColorStop(0.55, '#070e0b');
      bgGrad.addColorStop(1, '#040706');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      const cx = w * 0.5;
      const cy = h * 0.52;
      const rx = Math.min(w * 0.31, 155);
      const ry = rx * 0.56;

      // Ambient thermal halo glow
      const halo = ctx.createRadialGradient(cx, cy, rx * 0.2, cx, cy, rx * 1.55);
      halo.addColorStop(0, 'rgba(0, 212, 200, 0.22)');
      halo.addColorStop(0.5, 'rgba(16, 240, 160, 0.08)');
      halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx * 1.55, ry * 1.7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Heavy cast-iron grate crossbars
      ctx.strokeStyle = 'rgba(244, 242, 236, 0.1)';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2 + Math.PI / 4;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * rx * 0.55, cy + Math.sin(a) * ry * 0.55);
        ctx.lineTo(cx + Math.cos(a) * rx * 1.48, cy + Math.sin(a) * ry * 1.48);
        ctx.stroke();
      }

      // Machined stainless burner crown
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(cx, cy + 5, rx * 0.78, ry * 0.78, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#0c1310';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(244, 242, 236, 0.18)';
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(cx, cy, rx * 0.66, ry * 0.66, 0, 0, Math.PI * 2);
      const metalGrad = ctx.createLinearGradient(cx - rx, cy - ry, cx + rx, cy + ry);
      metalGrad.addColorStop(0, '#2a3630');
      metalGrad.addColorStop(0.5, '#121916');
      metalGrad.addColorStop(1, '#314139');
      ctx.fillStyle = metalGrad;
      ctx.fill();
      ctx.restore();

      // 32 Pure Biogas Thermal Flame Jets
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < JET_COUNT; i++) {
        const angle = (i / JET_COUNT) * Math.PI * 2;
        const bx = cx + Math.cos(angle) * rx * 0.76;
        const by = cy + Math.sin(angle) * ry * 0.76;

        const flicker = Math.sin(time * 2.4 + i * 1.7) * 0.16 + Math.cos(time * 4.1 + i * 0.9) * 0.08;
        const flameLen = (26 + flicker * 14) * (0.85 + Math.sin(angle) * 0.12);
        const fx = bx + Math.cos(angle) * flameLen;
        const fy = by + Math.sin(angle) * flameLen * 0.65 - (10 + flicker * 6);

        const fGrad = ctx.createLinearGradient(bx, by, fx, fy);
        fGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        fGrad.addColorStop(0.28, 'rgba(0, 212, 200, 0.92)');
        fGrad.addColorStop(0.7, 'rgba(16, 240, 160, 0.55)');
        fGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');

        ctx.beginPath();
        ctx.moveTo(bx, by);
        const perpX = -Math.sin(angle) * 6;
        const perpY = Math.cos(angle) * 3.5;
        ctx.quadraticCurveTo(bx + perpX + Math.cos(angle) * 10, by + perpY - 6, fx, fy);
        ctx.quadraticCurveTo(bx - perpX + Math.cos(angle) * 10, by - perpY - 6, bx, by);
        ctx.fillStyle = fGrad;
        ctx.fill();
      }
      ctx.restore();

      // Subtle HUD readout matching engineering specs
      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(16, 240, 160, 0.8)';
      ctx.fillText('BIOGÁS FILTRADO · FILTRO H₂S ATIVO', 20, 30);
      ctx.fillStyle = 'rgba(244, 242, 236, 0.55)';
      ctx.fillText('EFICIÊNCIA TÉRMICA: 70%–85%', 20, 48);

      requestAnimationFrame(draw);
    }

    draw();
  }

  document.addEventListener('DOMContentLoaded', () => {
    initHeroWebGL();
    initBurnerCanvas();
  });
})();
