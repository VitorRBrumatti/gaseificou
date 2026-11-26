import * as THREE from 'three'

export function mountHeroWebGL(canvas: HTMLCanvasElement): () => void {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(window.innerWidth, window.innerHeight)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.set(0, 0.6, 8.2)

  const coreGroup = new THREE.Group()
  const getOffsetX = () => (window.innerWidth > 960 ? 2.15 : 0)
  coreGroup.position.set(getOffsetX(), 0.2, 0)
  scene.add(coreGroup)

  const spriteCanvas = document.createElement('canvas')
  spriteCanvas.width = 64
  spriteCanvas.height = 64
  const spriteContext = spriteCanvas.getContext('2d')
  if (!spriteContext) {
    renderer.dispose()
    return () => {}
  }

  const gradient = spriteContext.createRadialGradient(32, 32, 0, 32, 32, 32)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.28, 'rgba(255,255,255,0.85)')
  gradient.addColorStop(0.65, 'rgba(255,255,255,0.2)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  spriteContext.fillStyle = gradient
  spriteContext.fillRect(0, 0, 64, 64)
  const particleTex = new THREE.CanvasTexture(spriteCanvas)

  const COUNT = 1800
  const positions = new Float32Array(COUNT * 3)
  const colors = new Float32Array(COUNT * 3)
  const seeds = new Float32Array(COUNT * 3)

  const cAmber = new THREE.Color('#ff6b2b')
  const cGold = new THREE.Color('#ffb84d')
  const cEmerald = new THREE.Color('#10f0a0')
  const cCyan = new THREE.Color('#00d4c8')
  const tempColor = new THREE.Color()

  for (let i = 0; i < COUNT; i++) {
    const i3 = i * 3
    const t = Math.random()
    const angle = Math.random() * Math.PI * 2
    const radius = 0.65 + Math.pow(Math.random(), 0.7) * 2.15 * (1 - t * 0.42)
    const y = (t - 0.5) * 6.8

    positions[i3] = Math.cos(angle) * radius
    positions[i3 + 1] = y
    positions[i3 + 2] = Math.sin(angle) * radius

    seeds[i3] = angle
    seeds[i3 + 1] = radius
    seeds[i3 + 2] = 0.25 + Math.random() * 0.55

    if (t < 0.35) tempColor.lerpColors(cAmber, cGold, t / 0.35)
    else if (t < 0.72) tempColor.lerpColors(cGold, cEmerald, (t - 0.35) / 0.37)
    else tempColor.lerpColors(cEmerald, cCyan, (t - 0.72) / 0.28)

    colors[i3] = tempColor.r
    colors[i3 + 1] = tempColor.g
    colors[i3 + 2] = tempColor.b
  }

  const pGeo = new THREE.BufferGeometry()
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const pMat = new THREE.PointsMaterial({
    size: 0.145,
    map: particleTex,
    vertexColors: true,
    transparent: true,
    opacity: 0.88,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })

  const particleField = new THREE.Points(pGeo, pMat)
  coreGroup.add(particleField)

  const ringGroup = new THREE.Group()
  const ringMatEmerald = new THREE.MeshBasicMaterial({
    color: 0x10f0a0,
    transparent: true,
    opacity: 0.16,
    wireframe: true,
  })
  const ringMatSubtle = new THREE.MeshBasicMaterial({
    color: 0xf4f2ec,
    transparent: true,
    opacity: 0.08,
    wireframe: true,
  })

  const outerReactor = new THREE.Mesh(new THREE.CylinderGeometry(1.95, 2.2, 4.4, 28, 6, true), ringMatSubtle)
  ringGroup.add(outerReactor)

  const innerCore = new THREE.Mesh(new THREE.IcosahedronGeometry(1.15, 2), ringMatEmerald)
  ringGroup.add(innerCore)

  const torusMat = new THREE.MeshBasicMaterial({
    color: 0x10f0a0,
    transparent: true,
    opacity: 0.28,
  })
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(2.55, 0.012, 12, 96), torusMat)
  ring1.rotation.x = Math.PI * 0.42
  ring1.rotation.y = 0.25
  ringGroup.add(ring1)

  const ring2Mat = new THREE.MeshBasicMaterial({ color: 0xff6b2b, transparent: true, opacity: 0.22 })
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.85, 0.008, 12, 96), ring2Mat)
  ring2.rotation.x = Math.PI * 0.56
  ring2.rotation.y = -0.35
  ringGroup.add(ring2)

  coreGroup.add(ringGroup)

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
  const onPointerMove = (event: PointerEvent) => {
    pointer.tx = (event.clientX / window.innerWidth - 0.5) * 2
    pointer.ty = (event.clientY / window.innerHeight - 0.5) * 2
  }
  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    coreGroup.position.x = getOffsetX()
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('resize', onResize)

  const startedAt = performance.now()
  let frame = 0
  let stopped = false

  const animate = () => {
    if (stopped) return
    frame = requestAnimationFrame(animate)

    const elapsed = (performance.now() - startedAt) / 1000
    const dt = prefersReducedMotion ? 0 : 0.014

    pointer.x += (pointer.tx - pointer.x) * 0.05
    pointer.y += (pointer.ty - pointer.y) * 0.05

    const posArr = pGeo.getAttribute('position').array as Float32Array
    const colArr = pGeo.getAttribute('color').array as Float32Array

    if (!prefersReducedMotion) {
      for (let i = 0; i < COUNT; i++) {
        const i3 = i * 3
        let y = posArr[i3 + 1] + seeds[i3 + 2] * dt * 1.45
        if (y > 3.4) y = -3.4

        const normY = (y + 3.4) / 6.8
        const swirlAngle = seeds[i3] + elapsed * (0.42 + (1 - normY) * 0.35) + normY * 2.4
        const r = seeds[i3 + 1] * (1.05 - normY * 0.38) + Math.sin(elapsed * 1.6 + seeds[i3]) * 0.08

        posArr[i3] = Math.cos(swirlAngle) * r
        posArr[i3 + 1] = y
        posArr[i3 + 2] = Math.sin(swirlAngle) * r

        if (normY < 0.35) tempColor.lerpColors(cAmber, cGold, normY / 0.35)
        else if (normY < 0.72) tempColor.lerpColors(cGold, cEmerald, (normY - 0.35) / 0.37)
        else tempColor.lerpColors(cEmerald, cCyan, (normY - 0.72) / 0.28)

        colArr[i3] = tempColor.r
        colArr[i3 + 1] = tempColor.g
        colArr[i3 + 2] = tempColor.b
      }
      pGeo.attributes.position.needsUpdate = true
      pGeo.attributes.color.needsUpdate = true

      outerReactor.rotation.y = elapsed * 0.08
      innerCore.rotation.y = -elapsed * 0.16
      innerCore.rotation.x = elapsed * 0.09
      ring1.rotation.z = elapsed * 0.22
      ring2.rotation.z = -elapsed * 0.15
    }

    const scrollRatio = Math.min(window.scrollY / window.innerHeight, 1.2)
    coreGroup.rotation.y = pointer.x * 0.28
    coreGroup.rotation.x = pointer.y * 0.16 + scrollRatio * 0.25
    coreGroup.position.y = 0.2 - scrollRatio * 0.85

    renderer.render(scene, camera)
  }

  animate()

  return () => {
    stopped = true
    cancelAnimationFrame(frame)
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('resize', onResize)
    particleTex.dispose()
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
        object.geometry.dispose()
        const material = object.material
        if (Array.isArray(material)) material.forEach((item) => item.dispose())
        else material.dispose()
      }
    })
    renderer.dispose()
  }
}
