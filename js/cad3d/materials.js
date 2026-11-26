import * as THREE from 'three';

export const PALETTE = {
  bg: 0x070a0a,
  emerald: 0x00f59b,
  emeraldDeep: 0x10b981,
  amber: 0xf97316,
  amberWarm: 0xfbbf24,
  teal: 0x14b8a6,
  steelDark: 0x1e293b,
  steelMid: 0x475569,
  steelLight: 0x94a3b8,
  graphite: 0x0f1715,
};

export function createCadMaterials() {
  const xrayShells = {
    reator: new THREE.MeshPhysicalMaterial({
      color: 0x132620,
      emissive: 0x041a13,
      emissiveIntensity: 0.45,
      metalness: 0.15,
      roughness: 0.22,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    }),
    dome: new THREE.MeshPhysicalMaterial({
      color: 0x0c3024,
      emissive: PALETTE.emerald,
      emissiveIntensity: 0.16,
      metalness: 0.1,
      roughness: 0.18,
      transparent: true,
      opacity: 0.34,
      depthWrite: false,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    }),
    gas: new THREE.MeshPhysicalMaterial({
      color: 0x142420,
      emissive: 0x041711,
      emissiveIntensity: 0.35,
      metalness: 0.25,
      roughness: 0.24,
      transparent: true,
      opacity: 0.32,
      depthWrite: false,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    }),
    pulmao: new THREE.MeshPhysicalMaterial({
      color: 0x0d2629,
      emissive: 0x03181a,
      emissiveIntensity: 0.38,
      metalness: 0.18,
      roughness: 0.22,
      transparent: true,
      opacity: 0.32,
      depthWrite: false,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    }),
    iot: new THREE.MeshPhysicalMaterial({
      color: 0x16221e,
      emissive: 0x03140e,
      emissiveIntensity: 0.3,
      metalness: 0.35,
      roughness: 0.28,
      transparent: true,
      opacity: 0.46,
      depthWrite: true,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    }),
  };

  const solids = {
    skidSteel: new THREE.MeshStandardMaterial({
      color: 0x1a242b,
      metalness: 0.72,
      roughness: 0.36,
    }),
    steelMachined: new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.82,
      roughness: 0.26,
    }),
    steelBolt: new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.88,
      roughness: 0.2,
    }),
    amberMetal: new THREE.MeshStandardMaterial({
      color: PALETTE.amber,
      emissive: PALETTE.amber,
      emissiveIntensity: 0.18,
      metalness: 0.45,
      roughness: 0.32,
    }),
    tealMetal: new THREE.MeshStandardMaterial({
      color: PALETTE.teal,
      emissive: PALETTE.teal,
      emissiveIntensity: 0.16,
      metalness: 0.55,
      roughness: 0.28,
    }),
    emeraldAccent: new THREE.MeshStandardMaterial({
      color: PALETTE.emerald,
      emissive: PALETTE.emerald,
      emissiveIntensity: 0.38,
      metalness: 0.3,
      roughness: 0.24,
    }),
    cartridgeMedia: new THREE.MeshStandardMaterial({
      color: 0x115e45,
      emissive: PALETTE.emeraldDeep,
      emissiveIntensity: 0.28,
      metalness: 0.2,
      roughness: 0.45,
    }),
    biomassLiquid: new THREE.MeshPhysicalMaterial({
      color: PALETTE.teal,
      emissive: 0x0a4f4a,
      emissiveIntensity: 0.45,
      roughness: 0.15,
      metalness: 0.05,
      transparent: true,
      opacity: 0.56,
      depthWrite: false,
    }),
    bufferLiquid: new THREE.MeshPhysicalMaterial({
      color: 0x0ea5a0,
      emissive: 0x064442,
      emissiveIntensity: 0.42,
      roughness: 0.18,
      metalness: 0.05,
      transparent: true,
      opacity: 0.62,
      depthWrite: false,
    }),
    pipeShell: new THREE.MeshPhysicalMaterial({
      color: 0x26343d,
      metalness: 0.68,
      roughness: 0.28,
      transparent: true,
      opacity: 0.52,
      depthWrite: false,
    }),
    pipeAmber: new THREE.MeshStandardMaterial({
      color: 0x6b2f12,
      emissive: PALETTE.amber,
      emissiveIntensity: 0.22,
      metalness: 0.55,
      roughness: 0.32,
      transparent: true,
      opacity: 0.68,
    }),
    pipeEmerald: new THREE.MeshStandardMaterial({
      color: 0x0d4f38,
      emissive: PALETTE.emeraldDeep,
      emissiveIntensity: 0.24,
      metalness: 0.5,
      roughness: 0.3,
      transparent: true,
      opacity: 0.66,
    }),
    pipeTeal: new THREE.MeshStandardMaterial({
      color: 0x0c4948,
      emissive: PALETTE.teal,
      emissiveIntensity: 0.22,
      metalness: 0.5,
      roughness: 0.3,
      transparent: true,
      opacity: 0.66,
    }),
    conduit: new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.7,
      roughness: 0.35,
    }),
    gaugeFace: new THREE.MeshBasicMaterial({
      color: 0x0a1110,
    }),
  };

  const edges = {
    reator: new THREE.LineBasicMaterial({ color: PALETTE.emerald, transparent: true, opacity: 0.78 }),
    gas: new THREE.LineBasicMaterial({ color: PALETTE.emerald, transparent: true, opacity: 0.52 }),
    pulmao: new THREE.LineBasicMaterial({ color: PALETTE.teal, transparent: true, opacity: 0.58 }),
    iot: new THREE.LineBasicMaterial({ color: PALETTE.emerald, transparent: true, opacity: 0.62 }),
    amber: new THREE.LineBasicMaterial({ color: PALETTE.amber, transparent: true, opacity: 0.8 }),
    steel: new THREE.LineBasicMaterial({ color: 0x475569, transparent: true, opacity: 0.35 }),
  };

  const flowPulses = {
    amber: new THREE.MeshBasicMaterial({ color: PALETTE.amberWarm }),
    emerald: new THREE.MeshBasicMaterial({ color: PALETTE.emerald }),
    teal: new THREE.MeshBasicMaterial({ color: 0x2dd4bf }),
    bubble: new THREE.MeshBasicMaterial({ color: PALETTE.emerald, transparent: true, opacity: 0.85 }),
  };

  let currentMode = 'xray';
  let currentActive = 'reator';
  let hoveredId = null;

  function syncVisualState() {
    const isSolid = currentMode === 'solid';
    ['reator', 'gas', 'pulmao', 'iot'].forEach((id) => {
      const active = currentActive === id || currentActive === 'overview';
      const isHovered = hoveredId === id;
      const shell = xrayShells[id];
      const edge = edges[id];

      if (shell) {
        if (isSolid) {
          shell.opacity = id === 'iot' ? 0.96 : 0.9;
          shell.depthWrite = true;
          shell.roughness = 0.32;
          shell.metalness = 0.52;
        } else {
          shell.opacity = active ? (id === 'iot' ? 0.52 : 0.34) : 0.16;
          shell.depthWrite = id === 'iot';
          shell.roughness = 0.22;
          shell.metalness = 0.18;
        }
        shell.emissiveIntensity = active ? (isHovered ? 0.65 : 0.45) : (isHovered ? 0.42 : 0.14);
      }

      if (edge) {
        edge.opacity = active ? (isHovered ? 1.0 : 0.88) : (isHovered ? 0.72 : 0.24);
      }
    });

    const reatorActive = currentActive === 'reator' || currentActive === 'overview';
    xrayShells.dome.opacity = isSolid ? 0.86 : (reatorActive ? 0.38 : 0.16);
    xrayShells.dome.depthWrite = isSolid;
    xrayShells.dome.emissiveIntensity = reatorActive ? 0.22 : 0.06;
  }

  return {
    xrayShells,
    solids,
    edges,
    flowPulses,
    setMode(mode) {
      currentMode = mode;
      syncVisualState();
    },
    setActive(id) {
      currentActive = id;
      syncVisualState();
    },
    setHovered(id) {
      if (hoveredId === id) return;
      hoveredId = id;
      syncVisualState();
    },
    getMode() {
      return currentMode;
    },
  };
}

export function addCadEdges(mesh, lineMaterial, thresholdAngle = 18) {
  const edgeGeom = new THREE.EdgesGeometry(mesh.geometry, thresholdAngle);
  const lines = new THREE.LineSegments(edgeGeom, lineMaterial);
  lines.renderOrder = 2;
  mesh.add(lines);
  return lines;
}

export function createBoltRing(radius, count, y, boltMaterial, boltSize = 0.022) {
  const geom = new THREE.CylinderGeometry(boltSize, boltSize, boltSize * 1.4, 6);
  const inst = new THREE.InstancedMesh(geom, boltMaterial, count);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    dummy.position.set(Math.cos(a) * radius, y, Math.sin(a) * radius);
    dummy.rotation.set(0, a, 0);
    dummy.updateMatrix();
    inst.setMatrixAt(i, dummy.matrix);
  }
  inst.instanceMatrix.needsUpdate = true;
  return inst;
}
