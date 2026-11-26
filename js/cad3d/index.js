import { initHardwareCad3D } from './HardwareCadViewer.js';

function bootCad3D() {
  const container = document.getElementById('cad3dViewport');
  if (!container) return;

  const viewer = initHardwareCad3D({
    container,
    pinsContainer: document.getElementById('cad3dPins'),
    dragHint: document.getElementById('cad3dHint'),
    toolbar: {
      btnOverview: document.getElementById('cadBtnOverview'),
      btnXray: document.getElementById('cadBtnXray'),
      btnFlow: document.getElementById('cadBtnFlow'),
      btnZoomIn: document.getElementById('cadBtnZoomIn'),
      btnZoomOut: document.getElementById('cadBtnZoomOut'),
    },
    onSelectSubsystem(id) {
      window.__gaseificouSelectCadPart?.(id, { from3D: true });
    },
  });

  if (viewer) {
    window.__gaseificouCad3D = viewer;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootCad3D);
} else {
  bootCad3D();
}
