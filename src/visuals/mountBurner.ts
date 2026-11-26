export function mountBurner(canvas: HTMLCanvasElement): () => void {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const ctx = canvas.getContext('2d')
  if (!ctx) return () => {}

  let w = 0
  let h = 0
  let time = 0
  let frame = 0
  let stopped = false
  const JET_COUNT = 32

  const resize = () => {
    const rect = canvas.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    w = rect.width || 560
    h = rect.height || 380
    canvas.width = w * dpr
    canvas.height = h * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  const draw = () => {
    if (stopped) return
    frame = requestAnimationFrame(draw)
    time += prefersReducedMotion ? 0 : 0.055
    ctx.clearRect(0, 0, w, h)

    const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.5, 20, w * 0.5, h * 0.5, Math.max(w, h) * 0.72)
    bgGrad.addColorStop(0, '#0d221c')
    bgGrad.addColorStop(0.55, '#070e0b')
    bgGrad.addColorStop(1, '#040706')
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, w, h)

    const cx = w * 0.5
    const cy = h * 0.52
    const rx = Math.min(w * 0.31, 155)
    const ry = rx * 0.56

    const halo = ctx.createRadialGradient(cx, cy, rx * 0.2, cx, cy, rx * 1.55)
    halo.addColorStop(0, 'rgba(0, 212, 200, 0.22)')
    halo.addColorStop(0.5, 'rgba(16, 240, 160, 0.08)')
    halo.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = halo
    ctx.beginPath()
    ctx.ellipse(cx, cy, rx * 1.55, ry * 1.7, 0, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = 'rgba(244, 242, 236, 0.1)'
    ctx.lineWidth = 6
    ctx.lineCap = 'round'
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2 + Math.PI / 4
      ctx.beginPath()
      ctx.moveTo(cx + Math.cos(a) * rx * 0.55, cy + Math.sin(a) * ry * 0.55)
      ctx.lineTo(cx + Math.cos(a) * rx * 1.48, cy + Math.sin(a) * ry * 1.48)
      ctx.stroke()
    }

    ctx.save()
    ctx.beginPath()
    ctx.ellipse(cx, cy + 5, rx * 0.78, ry * 0.78, 0, 0, Math.PI * 2)
    ctx.fillStyle = '#0c1310'
    ctx.fill()
    ctx.lineWidth = 2
    ctx.strokeStyle = 'rgba(244, 242, 236, 0.18)'
    ctx.stroke()

    ctx.beginPath()
    ctx.ellipse(cx, cy, rx * 0.66, ry * 0.66, 0, 0, Math.PI * 2)
    const metalGrad = ctx.createLinearGradient(cx - rx, cy - ry, cx + rx, cy + ry)
    metalGrad.addColorStop(0, '#2a3630')
    metalGrad.addColorStop(0.5, '#121916')
    metalGrad.addColorStop(1, '#314139')
    ctx.fillStyle = metalGrad
    ctx.fill()
    ctx.restore()

    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    for (let i = 0; i < JET_COUNT; i++) {
      const angle = (i / JET_COUNT) * Math.PI * 2
      const bx = cx + Math.cos(angle) * rx * 0.76
      const by = cy + Math.sin(angle) * ry * 0.76
      const flicker = Math.sin(time * 2.4 + i * 1.7) * 0.16 + Math.cos(time * 4.1 + i * 0.9) * 0.08
      const flameLen = (26 + flicker * 14) * (0.85 + Math.sin(angle) * 0.12)
      const fx = bx + Math.cos(angle) * flameLen
      const fy = by + Math.sin(angle) * flameLen * 0.65 - (10 + flicker * 6)

      const fGrad = ctx.createLinearGradient(bx, by, fx, fy)
      fGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)')
      fGrad.addColorStop(0.28, 'rgba(0, 212, 200, 0.92)')
      fGrad.addColorStop(0.7, 'rgba(16, 240, 160, 0.55)')
      fGrad.addColorStop(1, 'rgba(56, 189, 248, 0)')

      ctx.beginPath()
      ctx.moveTo(bx, by)
      const perpX = -Math.sin(angle) * 6
      const perpY = Math.cos(angle) * 3.5
      ctx.quadraticCurveTo(bx + perpX + Math.cos(angle) * 10, by + perpY - 6, fx, fy)
      ctx.quadraticCurveTo(bx - perpX + Math.cos(angle) * 10, by - perpY - 6, bx, by)
      ctx.fillStyle = fGrad
      ctx.fill()
    }
    ctx.restore()

    ctx.font = '600 11px "JetBrains Mono", monospace'
    ctx.fillStyle = 'rgba(16, 240, 160, 0.8)'
    ctx.fillText('BIOGÁS FILTRADO · FILTRO H₂S ATIVO', 20, 30)
    ctx.fillStyle = 'rgba(244, 242, 236, 0.55)'
    ctx.fillText('EFICIÊNCIA TÉRMICA: 70%–85%', 20, 48)
  }

  resize()
  window.addEventListener('resize', resize)
  draw()

  return () => {
    stopped = true
    cancelAnimationFrame(frame)
    window.removeEventListener('resize', resize)
  }
}
