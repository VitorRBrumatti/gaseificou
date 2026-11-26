export interface TelemetryChartScale {
  min: number
  max: number
}

export function drawTelemetryChart(
  canvas: HTMLCanvasElement,
  series: number[],
  alertActive: boolean,
  scale?: TelemetryChartScale,
) {
  const ctx = canvas.getContext('2d')
  if (!ctx || series.length < 2) return

  const w = canvas.width
  const h = canvas.height
  ctx.clearRect(0, 0, w, h)

  ctx.strokeStyle = 'rgba(244, 242, 236, 0.07)'
  ctx.lineWidth = 1
  for (let i = 1; i <= 3; i++) {
    const y = (h / 4) * i
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(w, y)
    ctx.stroke()
  }

  const minV = scale?.min ?? 2.8
  const maxV = scale?.max ?? 5.4
  const span = maxV - minV || 1
  const stepX = w / (series.length - 1)
  const points = series.map((value, idx) => ({
    x: idx * stepX,
    y: h - ((value - minV) / span) * (h - 22) - 10,
  }))

  const fillGrad = ctx.createLinearGradient(0, 0, 0, h)
  if (alertActive) {
    fillGrad.addColorStop(0, 'rgba(255, 107, 43, 0.34)')
    fillGrad.addColorStop(1, 'rgba(255, 107, 43, 0)')
  } else {
    fillGrad.addColorStop(0, 'rgba(16, 240, 160, 0.3)')
    fillGrad.addColorStop(1, 'rgba(16, 240, 160, 0)')
  }

  ctx.beginPath()
  ctx.moveTo(points[0].x, h)
  points.forEach((point) => ctx.lineTo(point.x, point.y))
  ctx.lineTo(points[points.length - 1].x, h)
  ctx.closePath()
  ctx.fillStyle = fillGrad
  ctx.fill()

  ctx.beginPath()
  points.forEach((point, idx) => (idx === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y)))
  ctx.strokeStyle = alertActive ? '#ff6b2b' : '#10f0a0'
  ctx.lineWidth = 2.5
  ctx.stroke()

  const last = points[points.length - 1]
  ctx.beginPath()
  ctx.arc(last.x, last.y, 5, 0, Math.PI * 2)
  ctx.fillStyle = alertActive ? '#ff6b2b' : '#10f0a0'
  ctx.fill()
}
