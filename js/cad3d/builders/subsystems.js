import * as THREE from 'three';
import { PALETTE, addCadEdges, createBoltRing } from '../materials.js';

function tagSubsystem(object, id) {
  object.traverse((node) => {
    node.userData.subsystemId = id;
  });
}

/* --------------------------------------------------------------------------
   01 · FEED HOPPER (CARGA 35 kg/d) + 3.000 L ANAEROBIC REACTOR + GASOMETER
   -------------------------------------------------------------------------- */
export function buildReactorSubsystem(mats) {
  const group = new THREE.Group();
  group.name = 'Subsystem_Reator';

  // --- Feed Hopper (left of reactor at x = -3.15) ---
  const hopperGroup = new THREE.Group();
  hopperGroup.position.set(-3.15, 0.18, 0);

  // Four tapered steel support legs
  const legGeom = new THREE.CylinderGeometry(0.024, 0.028, 1.15, 8);
  [[-0.24, -0.24], [0.24, -0.24], [-0.24, 0.24], [0.24, 0.24]].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(legGeom, mats.solids.steelMachined);
    leg.position.set(lx, 0.58, lz);
    hopperGroup.add(leg);
  });

  // Trapezoidal hopper body (4-sided frustum rotated 45 deg)
  const hopperCone = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.13, 0.56, 4),
    mats.solids.amberMetal
  );
  hopperCone.rotation.y = Math.PI / 4;
  hopperCone.position.y = 1.24;
  addCadEdges(hopperCone, mats.edges.amber, 12);
  hopperGroup.add(hopperCone);

  // Top reinforced steel rim + protective grate bars
  const rim = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.05, 0.62), mats.solids.steelMachined);
  rim.position.y = 1.54;
  hopperGroup.add(rim);

  const grateBarGeom = new THREE.BoxGeometry(0.54, 0.016, 0.016);
  for (let i = -2; i <= 2; i++) {
    const bar = new THREE.Mesh(grateBarGeom, mats.solids.steelBolt);
    bar.position.set(0, 1.53, i * 0.1);
    hopperGroup.add(bar);
  }

  // Lower mixer motor housing under funnel
  const mixerBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.11, 0.22, 14),
    mats.solids.skidSteel
  );
  mixerBody.position.y = 0.88;
  hopperGroup.add(mixerBody);
  group.add(hopperGroup);

  // --- Main 3.000 L Cylindrical Anaerobic Reactor (x = -1.55) ---
  const reactorGroup = new THREE.Group();
  reactorGroup.position.set(-1.55, 0.18, 0);

  const rRadius = 0.92;
  const rHeight = 1.66;

  // Translucent X-Ray Shell
  const shell = new THREE.Mesh(
    new THREE.CylinderGeometry(rRadius, rRadius, rHeight, 36, 1, false),
    mats.xrayShells.reator
  );
  shell.position.y = rHeight / 2;
  addCadEdges(shell, mats.edges.reator, 24);
  reactorGroup.add(shell);

  // Structural stiffening rings around outer shell
  const ringGeom = new THREE.TorusGeometry(rRadius + 0.025, 0.024, 10, 42);
  [0.24, 0.86, 1.48].forEach((ry) => {
    const ring = new THREE.Mesh(ringGeom, mats.solids.steelMachined);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = ry;
    reactorGroup.add(ring);
  });

  // Heavy Top & Bottom Bolted Flanges + Instanced Bolts
  const flangeRingGeom = new THREE.CylinderGeometry(rRadius + 0.08, rRadius + 0.08, 0.06, 36);
  const bottomFlange = new THREE.Mesh(flangeRingGeom, mats.solids.skidSteel);
  bottomFlange.position.y = 0.03;
  reactorGroup.add(bottomFlange);

  const topFlange = new THREE.Mesh(flangeRingGeom, mats.solids.skidSteel);
  topFlange.position.y = rHeight;
  reactorGroup.add(topFlange);
  reactorGroup.add(createBoltRing(rRadius + 0.04, 18, rHeight + 0.04, mats.solids.steelBolt, 0.022));
  reactorGroup.add(createBoltRing(rRadius + 0.04, 18, 0.07, mats.solids.steelBolt, 0.022));

  // Side Inspection Manway / Hatch with circular bolt ring
  const hatchGroup = new THREE.Group();
  hatchGroup.position.set(0, 0.82, rRadius + 0.04);
  hatchGroup.rotation.x = Math.PI / 2;
  const hatchNeck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.24, 0.1, 20),
    mats.solids.steelMachined
  );
  hatchGroup.add(hatchNeck);
  const hatchLid = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.28, 0.03, 20),
    mats.solids.skidSteel
  );
  hatchLid.position.y = 0.055;
  hatchGroup.add(hatchLid);
  hatchGroup.add(createBoltRing(0.245, 10, 0.075, mats.solids.steelBolt, 0.014));
  reactorGroup.add(hatchGroup);

  // Internal Visible Biomass Fluid Volume + Shimmering Surface Ring
  const liquidHeight = 1.08;
  const biomass = new THREE.Mesh(
    new THREE.CylinderGeometry(rRadius - 0.06, rRadius - 0.06, liquidHeight, 32),
    mats.solids.biomassLiquid
  );
  biomass.position.y = liquidHeight / 2 + 0.05;
  reactorGroup.add(biomass);

  const meniscus = new THREE.Mesh(
    new THREE.TorusGeometry(rRadius - 0.07, 0.012, 8, 36),
    mats.solids.tealMetal
  );
  meniscus.rotation.x = Math.PI / 2;
  meniscus.position.y = liquidHeight + 0.05;
  reactorGroup.add(meniscus);

  // Gasometer Dome (4–5 m³) on top of reactor with glowing meridian ribs
  const domeGroup = new THREE.Group();
  domeGroup.position.y = rHeight + 0.02;

  const domeMesh = new THREE.Mesh(
    new THREE.SphereGeometry(rRadius * 0.98, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.48),
    mats.xrayShells.dome
  );
  domeGroup.add(domeMesh);

  // Glowing emerald meridian ribs over dome for crisp CAD silhouette
  const ribCurve = new THREE.ArcCurve(0, 0, rRadius * 0.99, 0, Math.PI, false);
  const ribPts = ribCurve.getPoints(24).map((p) => new THREE.Vector3(p.x, p.y, 0));
  const ribGeo = new THREE.BufferGeometry().setFromPoints(ribPts);
  for (let i = 0; i < 4; i++) {
    const rib = new THREE.Line(ribGeo, mats.edges.reator);
    rib.rotation.y = (i * Math.PI) / 4;
    domeGroup.add(rib);
  }

  // Top gas outlet nozzle on dome apex
  const apexNozzle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.14, 0.14, 16),
    mats.solids.steelMachined
  );
  apexNozzle.position.y = rRadius * 0.92;
  domeGroup.add(apexNozzle);
  reactorGroup.add(domeGroup);

  group.add(reactorGroup);
  tagSubsystem(group, 'reator');

  return {
    group,
    domeGroup,
    biomass,
    meniscus,
    reactorCenter: new THREE.Vector3(-1.55, 0.25, 0),
    reactorRadius: rRadius - 0.14,
    liquidHeight,
  };
}

/* --------------------------------------------------------------------------
   02 · VERTICAL H2S SCRUBBER + MANOMETER + SOLENOID VALVE + BIOGAS BOOSTER
   -------------------------------------------------------------------------- */
export function buildGasScrubberSubsystem(mats) {
  const group = new THREE.Group();
  group.name = 'Subsystem_Gas';
  group.position.set(0.32, 0.18, 0);

  // Open steel structural frame (4 vertical posts + top/mid crossbars)
  const frameW = 0.88;
  const frameD = 0.72;
  const frameH = 1.62;
  const postGeom = new THREE.BoxGeometry(0.04, frameH, 0.04);
  [[-frameW / 2, -frameD / 2], [frameW / 2, -frameD / 2], [-frameW / 2, frameD / 2], [frameW / 2, frameD / 2]].forEach(([px, pz]) => {
    const post = new THREE.Mesh(postGeom, mats.solids.skidSteel);
    post.position.set(px, frameH / 2, pz);
    group.add(post);
  });

  [0.54, frameH].forEach((fy) => {
    const barX = new THREE.Mesh(new THREE.BoxGeometry(frameW, 0.035, 0.035), mats.solids.steelMachined);
    barX.position.set(0, fy, frameD / 2);
    group.add(barX);
    const barX2 = barX.clone();
    barX2.position.z = -frameD / 2;
    group.add(barX2);
  });

  // Vertical H2S Desulfurization Column (left side of skid, x = -0.2)
  const colX = -0.2;
  const colH = 1.38;
  const colR = 0.21;

  const colShell = new THREE.Mesh(
    new THREE.CylinderGeometry(colR, colR, colH, 24),
    mats.xrayShells.gas
  );
  colShell.position.set(colX, colH / 2 + 0.22, 0);
  addCadEdges(colShell, mats.edges.gas, 20);
  group.add(colShell);

  // Top & bottom bolted flanges on scrubber column
  const colFlangeGeom = new THREE.CylinderGeometry(colR + 0.05, colR + 0.05, 0.045, 24);
  [0.24, colH + 0.22].forEach((cy) => {
    const fl = new THREE.Mesh(colFlangeGeom, mats.solids.steelMachined);
    fl.position.set(colX, cy, 0);
    group.add(fl);
  });
  const topBolts = createBoltRing(colR + 0.025, 10, colH + 0.25, mats.solids.steelBolt, 0.013);
  topBolts.position.x = colX;
  group.add(topBolts);

  // 3 Stacked H2S Filter Cartridges visible inside the X-Ray column
  const cartGeom = new THREE.CylinderGeometry(colR - 0.04, colR - 0.04, 0.3, 18);
  [0.5, 0.88, 1.26].forEach((cy) => {
    const cart = new THREE.Mesh(cartGeom, mats.solids.cartridgeMedia);
    cart.position.set(colX, cy, 0);
    addCadEdges(cart, mats.edges.gas, 20);
    group.add(cart);
  });

  // Moisture condensate drain trap at base of column
  const drainPot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.06, 0.16, 12),
    mats.solids.tealMetal
  );
  drainPot.position.set(colX, 0.11, 0);
  group.add(drainPot);

  // Right side of skid (x = +0.22): Manometer + Flame Arrestor + Solenoid + Biogas Booster
  const manX = 0.22;

  // Industrial Circular Manometer Dial (amber bezel + needle)
  const gaugeGroup = new THREE.Group();
  gaugeGroup.position.set(manX, 1.32, 0.18);
  const bezel = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.06, 24), mats.solids.amberMetal);
  bezel.rotation.x = Math.PI / 2;
  gaugeGroup.add(bezel);
  const face = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.105, 0.064, 24), mats.solids.gaugeFace);
  face.rotation.x = Math.PI / 2;
  gaugeGroup.add(face);
  const needle = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.085, 0.01), mats.solids.amberMetal);
  needle.position.set(0.02, 0.02, 0.036);
  needle.rotation.z = -0.65;
  gaugeGroup.add(needle);
  group.add(gaugeGroup);

  // Flame Arrestor + CH4 Solenoid Cutoff Valve
  const arrestor = new THREE.Mesh(
    new THREE.CylinderGeometry(0.095, 0.095, 0.22, 16),
    mats.solids.amberMetal
  );
  arrestor.position.set(manX, 0.98, 0.05);
  addCadEdges(arrestor, mats.edges.amber, 16);
  group.add(arrestor);

  const solenoidBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 0.14, 0.14),
    mats.solids.skidSteel
  );
  solenoidBox.position.set(manX + 0.12, 0.98, 0.05);
  addCadEdges(solenoidBox, mats.edges.amber, 15);
  group.add(solenoidBox);

  // Compact Biogas Booster / Side-Channel Blower on skid base
  const boosterGroup = new THREE.Group();
  boosterGroup.position.set(manX, 0.28, 0);
  const motor = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.14, 0.34, 18),
    mats.solids.steelMachined
  );
  motor.rotation.z = Math.PI / 2;
  boosterGroup.add(motor);
  const volute = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.2, 0.12, 20),
    mats.solids.skidSteel
  );
  volute.rotation.z = Math.PI / 2;
  volute.position.x = -0.18;
  addCadEdges(volute, mats.edges.gas, 18);
  boosterGroup.add(volute);
  group.add(boosterGroup);

  // Vertical manifold linking booster -> arrestor -> top exit
  const innerRiser = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.035, 1.18, 10),
    mats.solids.pipeEmerald
  );
  innerRiser.position.set(manX, 0.88, 0.02);
  group.add(innerRiser);

  tagSubsystem(group, 'gas');
  return { group, needle };
}

/* --------------------------------------------------------------------------
   03 · 1.000 L BUFFER TANK (PULMÃO) + TRANSFER PUMP + CAMLOCK QUICK COUPLING
   -------------------------------------------------------------------------- */
export function buildBufferTankSubsystem(mats) {
  const group = new THREE.Group();
  group.name = 'Subsystem_Pulmao';
  group.position.set(2.08, 0.18, 0);

  const bRadius = 0.58;
  const bHeight = 1.32;

  // Translucent 1.000 L Sealed Buffer Tank Shell
  const tankShell = new THREE.Mesh(
    new THREE.CylinderGeometry(bRadius, bRadius, bHeight, 28),
    mats.xrayShells.pulmao
  );
  tankShell.position.y = bHeight / 2;
  addCadEdges(tankShell, mats.edges.pulmao, 22);
  group.add(tankShell);

  // Structural horizontal ribs
  const ribGeom = new THREE.TorusGeometry(bRadius + 0.02, 0.02, 8, 32);
  [0.32, 0.72, 1.12].forEach((ry) => {
    const rib = new THREE.Mesh(ribGeom, mats.solids.steelMachined);
    rib.rotation.x = Math.PI / 2;
    rib.position.y = ry;
    group.add(rib);
  });

  // Top sealed lid + ultrasonic level sensor boss
  const lid = new THREE.Mesh(
    new THREE.CylinderGeometry(bRadius + 0.04, bRadius + 0.04, 0.055, 28),
    mats.solids.skidSteel
  );
  lid.position.y = bHeight;
  group.add(lid);
  group.add(createBoltRing(bRadius + 0.015, 12, bHeight + 0.035, mats.solids.steelBolt, 0.016));

  const levelCap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.14, 0.12, 16),
    mats.solids.tealMetal
  );
  levelCap.position.set(0, bHeight + 0.08, 0);
  group.add(levelCap);

  // Internal visible biofertilizer liquid (~62% full)
  const fluidH = bHeight * 0.62;
  const fluid = new THREE.Mesh(
    new THREE.CylinderGeometry(bRadius - 0.05, bRadius - 0.05, fluidH, 24),
    mats.solids.bufferLiquid
  );
  fluid.position.y = fluidH / 2 + 0.04;
  group.add(fluid);

  const fluidRing = new THREE.Mesh(
    new THREE.TorusGeometry(bRadius - 0.055, 0.01, 8, 28),
    mats.solids.tealMetal
  );
  fluidRing.rotation.x = Math.PI / 2;
  fluidRing.position.y = fluidH + 0.04;
  group.add(fluidRing);

  // Transfer Pump + Ball Valve + Detailed Camlock Quick Coupling on Right (+X)
  const camGroup = new THREE.Group();
  camGroup.position.set(bRadius + 0.34, 0.24, 0);

  // Centrifugal transfer pump
  const pumpMotor = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.11, 0.28, 16),
    mats.solids.steelMachined
  );
  pumpMotor.rotation.z = Math.PI / 2;
  camGroup.add(pumpMotor);

  const pumpHead = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.14, 0.08, 16),
    mats.solids.tealMetal
  );
  pumpHead.rotation.z = Math.PI / 2;
  pumpHead.position.x = -0.16;
  camGroup.add(pumpHead);

  // Discharge pipe + isolation ball valve with lever handle
  const outSpool = new THREE.Mesh(
    new THREE.CylinderGeometry(0.042, 0.042, 0.42, 12),
    mats.solids.steelMachined
  );
  outSpool.rotation.z = Math.PI / 2;
  outSpool.position.set(0.28, 0.04, 0);
  camGroup.add(outSpool);

  const valveHandle = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.025, 0.025),
    mats.solids.amberMetal
  );
  valveHandle.position.set(0.24, 0.13, 0);
  camGroup.add(valveHandle);

  // Camlock Coupler Body + Dual Locking Cam Arms + Dust Cap
  const camBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.068, 0.062, 0.14, 16),
    mats.solids.tealMetal
  );
  camBody.rotation.z = Math.PI / 2;
  camBody.position.set(0.48, 0.04, 0);
  addCadEdges(camBody, mats.edges.pulmao, 18);
  camGroup.add(camBody);

  // Dual Camlock lever arms (top & bottom ears)
  const armGeom = new THREE.BoxGeometry(0.11, 0.018, 0.022);
  [0.095, -0.015].forEach((ay) => {
    const arm = new THREE.Mesh(armGeom, mats.solids.steelBolt);
    arm.position.set(0.45, ay, 0.045);
    arm.rotation.z = ay > 0 ? -0.22 : 0.22;
    camGroup.add(arm);
  });

  // End plug cap
  const endCap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.055, 0.04, 16),
    mats.solids.emeraldAccent
  );
  endCap.rotation.z = Math.PI / 2;
  endCap.position.set(0.57, 0.04, 0);
  camGroup.add(endCap);

  group.add(camGroup);
  tagSubsystem(group, 'pulmao');

  return { group, fluid, fluidRing };
}
