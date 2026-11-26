import * as THREE from 'three';

export const CAMERA_PRESETS = {
  overview: {
    position: new THREE.Vector3(3.8, 3.0, 6.4),
    target: new THREE.Vector3(-0.15, 1.12, 0.0),
  },
  reator: {
    position: new THREE.Vector3(-2.15, 2.35, 4.05),
    target: new THREE.Vector3(-1.55, 1.25, 0.0),
  },
  gas: {
    position: new THREE.Vector3(0.42, 2.0, 3.2),
    target: new THREE.Vector3(0.32, 1.15, 0.05),
  },
  pulmao: {
    position: new THREE.Vector3(2.95, 1.85, 3.4),
    target: new THREE.Vector3(2.15, 0.92, 0.0),
  },
};

export const CALLOUT_ANCHORS = {
  reator: new THREE.Vector3(-1.55, 2.75, 0.0),
  gas: new THREE.Vector3(0.28, 2.15, 0.1),
  pulmao: new THREE.Vector3(2.1, 1.72, 0.0),
  carga: new THREE.Vector3(-3.2, 1.85, 0.0),
  saida: new THREE.Vector3(2.55, 2.52, -0.35),
};
