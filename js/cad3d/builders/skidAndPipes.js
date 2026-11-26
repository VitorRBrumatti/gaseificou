import * as THREE from 'three';
import { addCadEdges } from '../materials.js';

export function buildSkidAndPipes(mats) {
  const group = new THREE.Group();
  group.name = 'SkidAndPiping';

  // --- Blueprint Ground Grid (DATUM 0.00m) ---
  const grid = new THREE.GridHelper(16, 32, 0x10b981, 0x182622);
  grid.position.y = 0.002;
  if (Array.isArray(grid.material)) {
    grid.material[0].opacity = 0.24;
    grid.material[0].transparent = true;
    grid.material[1].opacity = 0.16;
    grid.material[1].transparent = true;
  } else {
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
  }
  group.add(grid);

  // --- Compact Metallic Skid Base (7.4m x 2.2m scaled proportionally) ---
  const skidW = 7.2;
  const skidD = 2.35;
  const skidH = 0.14;

  const deck = new THREE.Mesh(new THREE.BoxGeometry(skidW, skidH, skidD), mats.solids.skidSteel);
  deck.position.set(-0.22, skidH / 2 + 0.04, 0);
  deck.receiveShadow = true;
  addCadEdges(deck, mats.edges.steel, 20);
  group.add(deck);

  // Longitudinal I-Beam rails along front & back edges
  const railGeom = new THREE.BoxGeometry(skidW + 0.08, 0.06, 0.1);
  [-skidD / 2 + 0.06, skidD / 2 - 0.06].forEach((z) => {
    const rail = new THREE.Mesh(railGeom, mats.solids.steelMachined);
    rail.position.set(-0.22, 0.03, z);
    group.add(rail);
  });

  // Structural cross-beams & leveling pads (InstancedMesh)
  const padGeom = new THREE.CylinderGeometry(0.08, 0.1, 0.04, 8);
  const padPositions = [
    [-3.6, -1.0], [-1.3, -1.0], [1.0, -1.0], [3.1, -1.0],
    [-3.6, 1.0], [-1.3, 1.0], [1.0, 1.0], [3.1, 1.0],
  ];
  const pads = new THREE.InstancedMesh(padGeom, mats.solids.steelBolt, padPositions.length);
  const dummy = new THREE.Object3D();
  padPositions.forEach(([x, z], idx) => {
    dummy.position.set(x, 0.02, z);
    dummy.updateMatrix();
    pads.setMatrixAt(idx, dummy.matrix);
  });
  pads.instanceMatrix.needsUpdate = true;
  group.add(pads);

  // --- Helper: Flange Collar along pipe joints ---
  const flangeGeom = new THREE.CylinderGeometry(0.075, 0.075, 0.035, 14);
  function addFlange(pos, rotAxis = 'y', angle = 0) {
    const f = new THREE.Mesh(flangeGeom, mats.solids.steelMachined);
    f.position.copy(pos);
    if (rotAxis === 'z') f.rotation.z = angle;
    if (rotAxis === 'x') f.rotation.x = angle;
    group.add(f);
  }

  // --- Physically Routed Curves (CatmullRomCurve3 + TubeGeometry) ---

  // 1. Organic Feed Pipe: Hopper bottom (-3.15, 1.05, 0) -> Reactor base inlet (-2.42, 0.56, 0)
  const feedCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-3.15, 1.12, 0),
    new THREE.Vector3(-3.15, 0.62, 0),
    new THREE.Vector3(-2.95, 0.54, 0),
    new THREE.Vector3(-2.42, 0.54, 0),
  ]);
  const feedPipe = new THREE.Mesh(
    new THREE.TubeGeometry(feedCurve, 28, 0.055, 10, false),
    mats.solids.pipeAmber
  );
  group.add(feedPipe);
  addFlange(new THREE.Vector3(-3.15, 1.1, 0));
  addFlange(new THREE.Vector3(-2.44, 0.54, 0), 'z', Math.PI / 2);

  // 2. Raw Biogas Header: Reactor Dome top (-1.55, 2.55, 0) -> H2S Scrubber bottom/inlet (0.12, 1.92, 0)
  const rawGasCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.55, 2.52, 0),
    new THREE.Vector3(-1.55, 2.86, 0),
    new THREE.Vector3(-0.7, 2.88, 0),
    new THREE.Vector3(0.08, 2.86, 0),
    new THREE.Vector3(0.12, 2.58, 0),
    new THREE.Vector3(0.12, 1.88, 0),
  ]);
  const rawGasPipe = new THREE.Mesh(
    new THREE.TubeGeometry(rawGasCurve, 40, 0.042, 10, false),
    mats.solids.pipeEmerald
  );
  group.add(rawGasPipe);
  addFlange(new THREE.Vector3(-1.55, 2.56, 0));
  addFlange(new THREE.Vector3(0.12, 1.92, 0));

  // 3. Purified Biogas Thermal Output: Booster/Scrubber (0.58, 1.56, 0) -> Elevated Boiler Header (2.55, 2.48, -0.35)
  const thermalOutCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.56, 1.48, 0.0),
    new THREE.Vector3(0.56, 2.42, -0.18),
    new THREE.Vector3(1.42, 2.48, -0.35),
    new THREE.Vector3(2.58, 2.48, -0.35),
  ]);
  const thermalOutPipe = new THREE.Mesh(
    new THREE.TubeGeometry(thermalOutCurve, 36, 0.042, 10, false),
    mats.solids.pipeEmerald
  );
  group.add(thermalOutPipe);
  addFlange(new THREE.Vector3(2.54, 2.48, -0.35), 'z', Math.PI / 2);

  // Support post for elevated thermal exit stub
  const exitPost = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 2.34, 8),
    mats.solids.steelMachined
  );
  exitPost.position.set(2.38, 1.33, -0.35);
  group.add(exitPost);

  // 4. Digestato Transfer Line: Reactor bottom outlet (-0.64, 0.44, 0.25) -> Buffer Tank inlet (1.48, 0.44, 0.25)
  const digestatoCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.68, 0.46, 0.22),
    new THREE.Vector3(-0.1, 0.44, 0.34),
    new THREE.Vector3(0.75, 0.44, 0.34),
    new THREE.Vector3(1.52, 0.46, 0.14),
  ]);
  const digestatoPipe = new THREE.Mesh(
    new THREE.TubeGeometry(digestatoCurve, 32, 0.048, 10, false),
    mats.solids.pipeTeal
  );
  group.add(digestatoPipe);
  addFlange(new THREE.Vector3(-0.66, 0.46, 0.22), 'z', Math.PI / 2);
  addFlange(new THREE.Vector3(1.5, 0.46, 0.14), 'z', Math.PI / 2);

  return {
    group,
    curves: {
      feed: feedCurve,
      rawGas: rawGasCurve,
      thermalOut: thermalOutCurve,
      digestato: digestatoCurve,
    },
  };
}
