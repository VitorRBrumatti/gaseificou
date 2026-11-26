import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PALETTE, createCadMaterials } from './materials.js';
import { CAMERA_PRESETS, CALLOUT_ANCHORS } from './cameraPresets.js';
import { buildSkidAndPipes } from './builders/skidAndPipes.js';
import {
  buildReactorSubsystem,
  buildGasScrubberSubsystem,
  buildBufferTankSubsystem,
  buildIoTSubsystem,
} from './builders/subsystems.js';
import { createFlowAnimations } from './flowAnimations.js';

function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')));
  } catch {
    return false;
  }
}

export function initHardwareCad3D({
  container,
  pinsContainer,
  onSelectSubsystem,
  toolbar,
  dragHint,
}) {
  if (!container) return null;

  if (!isWebGLAvailable()) {
    container.innerHTML =
      '<div class="cad3d-fallback"><strong>Visualizador 3D indisponível neste navegador</strong><span>WebGL desativado. Utilize as abas superiores (01–04) para inspecionar as especificações técnicas do Kit Urbano 35 kg/dia.</span></div>';
    return null;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Renderer Setup ---
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.className = 'cad3d-canvas';
  renderer.domElement.setAttribute('aria-label', 'Visualizador 3D interativo do Kit Urbano 35 kg/dia Gaseificou');
  container.appendChild(renderer.domElement);

  // --- Scene & Camera ---
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(PALETTE.bg);
  scene.fog = new THREE.FogExp2(PALETTE.bg, 0.042);

  const initW = container.clientWidth || 780;
  const initH = container.clientHeight || 480;
  const camera = new THREE.PerspectiveCamera(36, initW / initH, 0.1, 60);
  camera.position.copy(CAMERA_PRESETS.overview.position);
  renderer.setSize(initW, initH, false);

  // --- Studio Technical Lighting ---
  const hemiLight = new THREE.HemisphereLight(0xd8f3ec, 0x0b1512, 0.9);
  scene.add(hemiLight);

  const keyLight = new THREE.DirectionalLight(0xf8fafc, 1.9);
  keyLight.position.set(5.5, 8.5, 6.0);
  scene.add(keyLight);

  const rimEmerald = new THREE.DirectionalLight(PALETTE.emerald, 1.35);
  rimEmerald.position.set(-6.0, 4.5, -5.5);
  scene.add(rimEmerald);

  const fillCyan = new THREE.PointLight(PALETTE.teal, 1.6, 14);
  fillCyan.position.set(3.4, 2.2, 3.2);
  scene.add(fillCyan);

  // --- OrbitControls (Scroll-safe: page scroll is never hijacked) ---
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.enablePan = false;
  controls.enableZoom = false; // Zoom via + / - buttons or Ctrl + Wheel
  controls.minDistance = 2.4;
  controls.maxDistance = 11.5;
  controls.maxPolarAngle = Math.PI * 0.485;
  controls.minPolarAngle = 0.2;
  controls.target.copy(CAMERA_PRESETS.overview.target);

  // Allow Ctrl + Wheel zoom intentionally without hijacking normal page scroll
  const onWheel = (e) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.12 : 0.88;
    zoomCamera(factor);
  };
  renderer.domElement.addEventListener('wheel', onWheel, { passive: false });

  function zoomCamera(scaleFactor) {
    const offset = camera.position.clone().sub(controls.target);
    const nextLen = THREE.MathUtils.clamp(offset.length() * scaleFactor, controls.minDistance, controls.maxDistance);
    offset.setLength(nextLen);
    camera.position.copy(controls.target).add(offset);
    targetCamPos.copy(camera.position);
    isTransitioning = false;
  }

  // --- Build Modular Procedural 3D Hardware Assembly ---
  const mats = createCadMaterials();
  const rootAssembly = new THREE.Group();
  scene.add(rootAssembly);

  const { group: skidGroup, curves } = buildSkidAndPipes(mats);
  const reactorMeta = buildReactorSubsystem(mats);
  const gasMeta = buildGasScrubberSubsystem(mats);
  const bufferMeta = buildBufferTankSubsystem(mats);
  const iotMeta = buildIoTSubsystem(mats);
  const flows = createFlowAnimations(curves, reactorMeta, gasMeta, iotMeta, mats);

  rootAssembly.add(
    skidGroup,
    reactorMeta.group,
    gasMeta.group,
    bufferMeta.group,
    iotMeta.group,
    flows.group
  );

  if (prefersReducedMotion) {
    flows.setEnabled(false);
  }

  // Collect clickable meshes for fast raycasting
  const pickTargets = [];
  [reactorMeta.group, gasMeta.group, bufferMeta.group, iotMeta.group].forEach((grp) => {
    grp.traverse((child) => {
      if (child.isMesh && child.userData.subsystemId) {
        pickTargets.push(child);
      }
    });
  });

  // --- Camera Choreography State ---
  let activeId = 'reator';
  let isTransitioning = false;
  let userInteracted = false;
  let isPointerDragging = false;
  const targetCamPos = CAMERA_PRESETS.overview.position.clone();
  const targetLookAt = CAMERA_PRESETS.overview.target.clone();

  function dismissHint() {
    if (userInteracted) return;
    userInteracted = true;
    if (dragHint) dragHint.classList.add('is-hidden');
  }

  controls.addEventListener('start', () => {
    isTransitioning = false;
    isPointerDragging = true;
    dismissHint();
  });
  controls.addEventListener('end', () => {
    isPointerDragging = false;
  });

  function focusSubsystem(id, animateCam = true) {
    const preset = CAMERA_PRESETS[id] || CAMERA_PRESETS.overview;
    if (id !== 'overview') {
      activeId = id;
    }
    mats.setActive(id);
    syncPinActiveState(id === 'overview' ? activeId : id);

    if (animateCam) {
      const mobilePullback = camera.aspect < 1.05 && id === 'overview' ? 1.38 : 1.0;
      const offset = preset.position.clone().sub(preset.target).multiplyScalar(mobilePullback);
      targetLookAt.copy(preset.target);
      targetCamPos.copy(preset.target).add(offset);
      isTransitioning = true;
    }
  }

  // --- 3D -> 2D Projected HUD Pins & Callouts ---
  const pinElements = {};
  if (pinsContainer) {
    pinsContainer.querySelectorAll('[data-anchor]').forEach((el) => {
      pinElements[el.dataset.anchor] = el;
      const subId = el.dataset.hotspot;
      if (subId) {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          dismissHint();
          focusSubsystem(subId, true);
          onSelectSubsystem?.(subId);
        });
      }
    });
  }

  function syncPinActiveState(id) {
    Object.values(pinElements).forEach((el) => {
      if (el.dataset.hotspot) {
        el.classList.toggle('is-active', el.dataset.hotspot === id);
      }
    });
  }

  const projVec = new THREE.Vector3();
  function updateProjectedPins() {
    const w = renderer.domElement.clientWidth;
    const h = renderer.domElement.clientHeight;
    if (!w || !h) return;

    for (const [key, anchor] of Object.entries(CALLOUT_ANCHORS)) {
      const el = pinElements[key];
      if (!el) continue;

      projVec.copy(anchor).project(camera);
      const visible = projVec.z < 1 && projVec.z > -1;
      if (!visible) {
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
        continue;
      }

      const x = (projVec.x * 0.5 + 0.5) * w;
      const y = (-projVec.y * 0.5 + 0.5) * h;

      // Keep inside viewport margins cleanly
      const marginX = el.classList.contains('cad3d-tag') ? 68 : 22;
      const marginY = 22;
      const cx = THREE.MathUtils.clamp(x, marginX, w - marginX);
      const cy = THREE.MathUtils.clamp(y, marginY, h - marginY);

      el.style.opacity = '1';
      el.style.pointerEvents = el.dataset.hotspot ? 'auto' : 'none';
      el.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0) translate(-50%, -50%)`;
    }
  }

  // --- Raycasting (Hover & Click Picking on 3D Geometry) ---
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let downPos = { x: 0, y: 0 };

  function updatePointer(e) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }

  const onPointerMove = (e) => {
    if (isPointerDragging) return;
    updatePointer(e);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(pickTargets, false);
    const hitId = hits.length > 0 ? hits[0].object.userData.subsystemId : null;
    mats.setHovered(hitId);
    renderer.domElement.style.cursor = hitId ? 'pointer' : 'grab';
  };

  const onPointerDown = (e) => {
    downPos = { x: e.clientX, y: e.clientY };
    renderer.domElement.style.cursor = 'grabbing';
  };

  const onPointerUp = (e) => {
    renderer.domElement.style.cursor = 'grab';
    const dist = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
    if (dist > 6) return; // Was an orbit drag, not a click

    updatePointer(e);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(pickTargets, false);
    if (hits.length > 0) {
      const hitId = hits[0].object.userData.subsystemId;
      dismissHint();
      focusSubsystem(hitId, true);
      onSelectSubsystem?.(hitId);
    }
  };

  renderer.domElement.addEventListener('pointermove', onPointerMove);
  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  renderer.domElement.addEventListener('pointerup', onPointerUp);

  // --- Mini CAD Toolbar Actions ---
  if (toolbar) {
    toolbar.btnOverview?.addEventListener('click', () => {
      dismissHint();
      focusSubsystem('overview', true);
    });

    toolbar.btnXray?.addEventListener('click', () => {
      const next = mats.getMode() === 'xray' ? 'solid' : 'xray';
      mats.setMode(next);
      toolbar.btnXray.textContent = next === 'xray' ? 'Raio-X' : 'Sólido';
      toolbar.btnXray.setAttribute('aria-pressed', String(next === 'xray'));
    });

    toolbar.btnFlow?.addEventListener('click', () => {
      const next = !flows.isEnabled();
      flows.setEnabled(next);
      toolbar.btnFlow.classList.toggle('is-active', next);
      toolbar.btnFlow.setAttribute('aria-pressed', String(next));
    });

    toolbar.btnZoomIn?.addEventListener('click', () => {
      dismissHint();
      zoomCamera(0.84);
    });

    toolbar.btnZoomOut?.addEventListener('click', () => {
      dismissHint();
      zoomCamera(1.18);
    });
  }

  // --- Responsive ResizeObserver ---
  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const w = Math.max(1, Math.floor(entry.contentRect.width));
      const h = Math.max(1, Math.floor(entry.contentRect.height));
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    }
  });
  resizeObserver.observe(container);

  // --- IntersectionObserver to Pause rAF When Off-Screen ---
  let isVisible = true;
  let rafId = null;
  let lastTime = performance.now();

  const intersectionObserver = new IntersectionObserver(
    (entries) => {
      isVisible = entries[0]?.isIntersecting ?? true;
      if (isVisible && rafId === null) {
        lastTime = performance.now();
        rafId = requestAnimationFrame(tick);
      }
    },
    { threshold: 0.05 }
  );
  intersectionObserver.observe(container);

  // Initial overview highlighting reator gently without jumping away from overview frame
  mats.setActive('overview');
  syncPinActiveState('reator');

  // --- Main Render Loop ---
  function tick(now) {
    if (!isVisible) {
      rafId = null;
      return;
    }

    const dt = Math.max(0, Math.min((now - lastTime) / 1000, 0.05));
    lastTime = now;

    // Gentle idle orbital drift until first user interaction
    if (!userInteracted && !isTransitioning && !prefersReducedMotion) {
      const angle = dt * 0.12;
      const offset = camera.position.clone().sub(controls.target);
      offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
      camera.position.copy(controls.target).add(offset);
    }

    // Smooth damped camera transition to preset
    if (isTransitioning) {
      const lambda = 5.5;
      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamPos.x, lambda, dt);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamPos.y, lambda, dt);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamPos.z, lambda, dt);

      controls.target.x = THREE.MathUtils.damp(controls.target.x, targetLookAt.x, lambda, dt);
      controls.target.y = THREE.MathUtils.damp(controls.target.y, targetLookAt.y, lambda, dt);
      controls.target.z = THREE.MathUtils.damp(controls.target.z, targetLookAt.z, lambda, dt);

      if (
        camera.position.distanceTo(targetCamPos) < 0.015 &&
        controls.target.distanceTo(targetLookAt) < 0.015
      ) {
        camera.position.copy(targetCamPos);
        controls.target.copy(targetLookAt);
        isTransitioning = false;
      }
    }

    flows.update(dt);
    controls.update();
    renderer.render(scene, camera);
    updateProjectedPins();

    rafId = requestAnimationFrame(tick);
  }

  rafId = requestAnimationFrame(tick);

  // --- Full WebGL Resource Cleanup ---
  function dispose() {
    if (rafId !== null) cancelAnimationFrame(rafId);
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    renderer.domElement.removeEventListener('wheel', onWheel);
    renderer.domElement.removeEventListener('pointermove', onPointerMove);
    renderer.domElement.removeEventListener('pointerdown', onPointerDown);
    renderer.domElement.removeEventListener('pointerup', onPointerUp);
    controls.dispose();

    scene.traverse((node) => {
      if (node.isMesh || node.isLineSegments || node.isLine || node.isPoints) {
        node.geometry?.dispose();
        const materials = Array.isArray(node.material) ? node.material : [node.material];
        materials.forEach((m) => {
          if (!m) return;
          Object.values(m).forEach((val) => {
            if (val && typeof val === 'object' && 'isTexture' in val) val.dispose();
          });
          m.dispose();
        });
      }
    });

    renderer.dispose();
    renderer.domElement.remove();
  }

  window.addEventListener('beforeunload', dispose, { once: true });

  return {
    focusSubsystem,
    dispose,
  };
}
