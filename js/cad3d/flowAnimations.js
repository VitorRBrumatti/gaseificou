import * as THREE from 'three';

export function createFlowAnimations(curves, reactorMeta, gasMeta, mats) {
  const group = new THREE.Group();
  group.name = 'FlowAnimations';

  // Helper: Instanced pulses moving smoothly along a CatmullRomCurve3
  function makePipePulses(curve, count, radius, material, speed) {
    const geom = new THREE.SphereGeometry(radius, 8, 8);
    const mesh = new THREE.InstancedMesh(geom, material, count);
    mesh.renderOrder = 3;
    group.add(mesh);
    return { curve, mesh, count, speed, offsets: Array.from({ length: count }, (_, i) => i / count) };
  }

  const streams = [
    makePipePulses(curves.feed, 7, 0.032, mats.flowPulses.amber, 0.34),
    makePipePulses(curves.rawGas, 11, 0.028, mats.flowPulses.emerald, 0.38),
    makePipePulses(curves.thermalOut, 10, 0.028, mats.flowPulses.emerald, 0.42),
    makePipePulses(curves.digestato, 9, 0.03, mats.flowPulses.teal, 0.3),
  ];

  // Instanced rising methane bubbles inside the 3.000 L reactor liquid
  const BUBBLE_COUNT = 44;
  const bubbleGeom = new THREE.SphereGeometry(0.026, 8, 8);
  const bubbleMesh = new THREE.InstancedMesh(bubbleGeom, mats.flowPulses.bubble, BUBBLE_COUNT);
  bubbleMesh.renderOrder = 3;
  group.add(bubbleMesh);

  const bubbleData = Array.from({ length: BUBBLE_COUNT }, () => {
    const angle = Math.random() * Math.PI * 2;
    const rad = Math.sqrt(Math.random()) * (reactorMeta.reactorRadius * 0.85);
    return {
      x: reactorMeta.reactorCenter.x + Math.cos(angle) * rad,
      z: reactorMeta.reactorCenter.z + Math.sin(angle) * rad,
      phase: Math.random(),
      speed: 0.22 + Math.random() * 0.24,
      scale: 0.55 + Math.random() * 0.9,
    };
  });

  const dummy = new THREE.Object3D();
  const pt = new THREE.Vector3();
  let enabled = true;
  let elapsed = 0;

  function update(dt) {
    if (!enabled) return;
    elapsed += dt;

    // 1. Update pipe flow pulses
    for (let s = 0; s < streams.length; s++) {
      const st = streams[s];
      for (let i = 0; i < st.count; i++) {
        const t = (((st.offsets[i] + elapsed * st.speed) % 1) + 1) % 1;
        st.curve.getPointAt(t, pt);
        const pulseScale = 0.75 + Math.sin(t * Math.PI) * 0.45;
        dummy.position.copy(pt);
        dummy.scale.setScalar(pulseScale);
        dummy.updateMatrix();
        st.mesh.setMatrixAt(i, dummy.matrix);
      }
      st.mesh.instanceMatrix.needsUpdate = true;
    }

    // 2. Rising biogas bubbles inside reactor
    for (let i = 0; i < BUBBLE_COUNT; i++) {
      const b = bubbleData[i];
      const t = (((b.phase + elapsed * b.speed) % 1) + 1) % 1;
      const y = reactorMeta.reactorCenter.y + 0.08 + t * (reactorMeta.liquidHeight - 0.08);
      const wobble = Math.sin(elapsed * 2.5 + i) * 0.025;
      const fadeScale = b.scale * Math.sin(t * Math.PI);
      dummy.position.set(b.x + wobble, y, b.z + wobble);
      dummy.scale.setScalar(Math.max(0.01, fadeScale));
      dummy.updateMatrix();
      bubbleMesh.setMatrixAt(i, dummy.matrix);
    }
    bubbleMesh.instanceMatrix.needsUpdate = true;

    // 3. Subtle gasometer dome breathing & liquid shimmer
    if (reactorMeta.domeGroup) {
      const breath = 1 + Math.sin(elapsed * 1.8) * 0.014;
      reactorMeta.domeGroup.scale.set(1, breath, 1);
    }
    if (reactorMeta.meniscus) {
      reactorMeta.meniscus.position.y = reactorMeta.liquidHeight + 0.05 + Math.sin(elapsed * 2.2) * 0.012;
    }

    // 4. Manometer micro-oscillation
    if (gasMeta.needle) {
      gasMeta.needle.rotation.z = -0.65 + Math.sin(elapsed * 3.1) * 0.08;
    }
  }

  function setEnabled(state) {
    enabled = Boolean(state);
    group.visible = enabled;
  }

  return { group, update, setEnabled, isEnabled: () => enabled };
}
