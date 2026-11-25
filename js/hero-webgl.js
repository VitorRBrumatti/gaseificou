/* ==========================================================================
   GASEIFICOU! — Custom GLSL Volumetric Bio-Thermal Flow Shader (Zero Polygons)
   Domain-warped FBM fluid convection + subtle thermal isobar contours
   ========================================================================== */

(function () {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const VERTEX_SHADER = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `;

  const FRAGMENT_SHADER = `
    precision highp float;

    varying vec2 vUv;
    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec2 uMouse;
    uniform float uScroll;

    // Smooth 2D simplex noise
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

    float snoise(vec2 v) {
      const vec4 C = vec4(
        0.211324865405187,
        0.366025403784439,
        -0.577350269189626,
        0.024390243902439
      );
      vec2 i  = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
      m = m * m;
      m = m * m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.52;
      mat2 rot = mat2(0.80, -0.60, 0.60, 0.80);
      for (int i = 0; i < 5; i++) {
        v += a * snoise(p);
        p = rot * p * 1.92 + vec2(1.7, 3.1);
        a *= 0.5;
      }
      return v;
    }

    void main() {
      vec2 uv = vUv;
      float aspect = uResolution.x / max(uResolution.y, 1.0);
      vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

      // Anchor thermal plume slightly to the right on widescreen to frame typography
      float focusShift = smoothstep(0.95, 1.5, aspect) * 0.34;
      vec2 qPos = p - vec2(focusShift, -0.04 - uScroll * 0.12);

      // Gentle cursor-reactive thermal current bend
      vec2 mouseLocal = (uMouse - 0.5) * vec2(aspect, 1.0);
      float mouseDist = length(p - mouseLocal);
      float mouseInfluence = exp(-mouseDist * 2.4) * 0.14;
      vec2 flow = qPos + (p - mouseLocal) * mouseInfluence;

      // Rising biogas thermal convection (upward drift)
      float t = uTime * 0.14;
      vec2 drift1 = vec2(0.0, -t * 1.15);
      vec2 drift2 = vec2(t * 0.35, -t * 0.8);

      // Two-pass domain warping for silky fluid gas filaments
      vec2 warpA = vec2(
        fbm(flow * 1.45 + drift1),
        fbm(flow * 1.45 + vec2(4.2, -1.8) + drift2)
      );
      vec2 warpB = vec2(
        fbm(flow * 1.9 + 1.35 * warpA + vec2(0.0, -t * 1.4)),
        fbm(flow * 1.9 + 1.35 * warpA + vec2(2.6, 5.1) - drift1 * 0.7)
      );

      float field = fbm(flow * 1.35 + 1.1 * warpB);
      float density = smoothstep(-0.35, 0.72, field);

      // Volumetric plume envelope (stronger right-center, softly fades toward left text zone)
      float radial = length(qPos * vec2(0.85, 1.05));
      float plumeMask = smoothstep(1.18, 0.12, radial);
      float plume = density * plumeMask;

      // Vertical thermal chemistry gradient:
      // Lower warm biomass amber -> rising luminous emerald/teal pure biogas
      float elevation = smoothstep(-0.42, 0.42, qPos.y + warpA.y * 0.28);

      vec3 colObsidian = vec3(0.023, 0.039, 0.031);   // #060a08
      vec3 colDeepTeal = vec3(0.025, 0.135, 0.105);
      vec3 colEmerald  = vec3(0.063, 0.941, 0.627);   // #10f0a0
      vec3 colCyan     = vec3(0.000, 0.831, 0.784);   // #00d4c8
      vec3 colAmber    = vec3(1.000, 0.420, 0.169);   // #ff6b2b

      // Blend fluid gas body
      vec3 gasTone = mix(colAmber * 0.78, colEmerald, smoothstep(0.15, 0.65, elevation));
      gasTone = mix(gasTone, colCyan, smoothstep(0.62, 1.0, elevation) * 0.65);

      vec3 color = colObsidian;
      color = mix(color, colDeepTeal, plumeMask * 0.55);
      color += gasTone * pow(plume, 1.65) * 0.72;

      // Subtle hot core ridge (silk highlight inside convection current)
      float ridge = smoothstep(0.42, 0.88, field + warpB.x * 0.25) * plumeMask;
      color += mix(colEmerald, vec3(0.75, 1.0, 0.95), 0.35) * pow(ridge, 2.4) * 0.38;

      // Precision thermal isobar contour lines (engineering telemetry aesthetic, zero polygons)
      float contourWave = abs(fract((field + warpA.y * 0.25) * 6.5) - 0.5);
      float contourLine = 1.0 - smoothstep(0.0, 0.022, contourWave);
      float contourMask = smoothstep(1.02, 0.22, radial) * smoothstep(-0.2, 0.5, field);
      color += mix(colAmber, colEmerald, elevation) * contourLine * contourMask * 0.18;

      // Soft architectural readability scrim on the left side behind display typography
      float textScrim = smoothstep(0.55, 0.05, uv.x) * smoothstep(0.9, 1.35, aspect);
      color = mix(color, colObsidian, textScrim * 0.48);

      // Subtle micro-dither to eliminate 8-bit gradient banding
      float dither = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
      color += dither / 255.0;

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  function initHeroShader() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
      uTime: { value: 12.0 },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      uMouse: { value: new THREE.Vector2(0.68, 0.52) },
      uScroll: { value: 0.0 },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms,
      depthWrite: false,
      depthTest: false,
    });

    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(quad);

    const targetMouse = { x: 0.68, y: 0.52 };
    window.addEventListener('pointermove', (e) => {
      targetMouse.x = e.clientX / Math.max(window.innerWidth, 1);
      targetMouse.y = 1.0 - e.clientY / Math.max(window.innerHeight, 1);
    }, { passive: true });

    window.addEventListener('resize', () => {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
    });

    const clock = new THREE.Clock();

    function render() {
      requestAnimationFrame(render);

      const dt = Math.min(clock.getDelta(), 0.05);
      if (!prefersReducedMotion) {
        uniforms.uTime.value += dt;
      }

      uniforms.uMouse.value.x += (targetMouse.x - uniforms.uMouse.value.x) * 0.045;
      uniforms.uMouse.value.y += (targetMouse.y - uniforms.uMouse.value.y) * 0.045;
      uniforms.uScroll.value = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1.5);

      renderer.render(scene, camera);
    }

    render();
  }

  document.addEventListener('DOMContentLoaded', initHeroShader);
})();
