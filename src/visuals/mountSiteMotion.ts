import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

export interface SiteMotionOptions {
  progressBar: HTMLElement | null
  onAnchorNavigate: () => void
}

export function mountSiteMotion({ progressBar, onAnchorNavigate }: SiteMotionOptions): () => void {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let lenis: Lenis | null = null

  const onTick = (time: number) => {
    lenis?.raf(time * 1000)
  }

  if (!prefersReducedMotion) {
    lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      autoRaf: false,
    })
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add(onTick)
    gsap.ticker.lagSmoothing(0)
  }

  const onClick = (event: MouseEvent) => {
    const target = event.target
    if (!(target instanceof Element)) return
    const anchor = target.closest('a[href^="#"]')
    if (!(anchor instanceof HTMLAnchorElement)) return
    const targetId = anchor.getAttribute('href')
    if (!targetId || targetId === '#') return
    const el = document.querySelector(targetId)
    if (!(el instanceof HTMLElement)) return
    if (lenis) {
      event.preventDefault()
      lenis.scrollTo(el, { offset: -84 })
    }
    onAnchorNavigate()
  }

  const onScroll = () => {
    if (!progressBar) return
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    const pct = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0
    progressBar.style.width = `${pct}%`
  }

  const onPointerMove = (event: PointerEvent) => {
    const target = event.target
    if (!(target instanceof Element)) return

    const card = target.closest('.spotlight-card')
    if (card instanceof HTMLElement) {
      const rect = card.getBoundingClientRect()
      card.style.setProperty('--mx', `${event.clientX - rect.left}px`)
      card.style.setProperty('--my', `${event.clientY - rect.top}px`)
    }

    if (prefersReducedMotion) return
    const magnetic = target.closest('.magnetic')
    if (magnetic instanceof HTMLElement) {
      const rect = magnetic.getBoundingClientRect()
      const dx = (event.clientX - rect.left - rect.width / 2) * 0.18
      const dy = (event.clientY - rect.top - rect.height / 2) * 0.18
      magnetic.style.transform = `translate(${dx}px, ${dy}px)`
    }
  }

  const onPointerOut = (event: PointerEvent) => {
    if (prefersReducedMotion) return
    const target = event.target
    if (!(target instanceof Element)) return
    const magnetic = target.closest('.magnetic')
    if (!(magnetic instanceof HTMLElement)) return
    const next = event.relatedTarget
    if (next instanceof Node && magnetic.contains(next)) return
    magnetic.style.transform = ''
  }

  const ctx = gsap.context(() => {
    if (prefersReducedMotion) return

    gsap.from('#heroTitle .line-inner', {
      yPercent: 115,
      opacity: 0,
      duration: 1.05,
      stagger: 0.14,
      ease: 'power4.out',
      delay: 0.1,
    })

    gsap.from('.hero-reveal', {
      y: 26,
      opacity: 0,
      duration: 0.85,
      stagger: 0.1,
      ease: 'power3.out',
      delay: 0.35,
    })

    document.querySelectorAll<HTMLElement>('.reveal-up').forEach((el) => {
      gsap.from(el, {
        y: 38,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 86%',
          once: true,
        },
      })
    })

    gsap.from('.eff-fill', {
      scaleX: 0,
      duration: 1.15,
      stagger: 0.18,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.efficiency-bars',
        start: 'top 85%',
        once: true,
      },
    })
  })

  document.addEventListener('click', onClick)
  document.addEventListener('pointermove', onPointerMove)
  document.addEventListener('pointerout', onPointerOut)
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()

  return () => {
    document.removeEventListener('click', onClick)
    document.removeEventListener('pointermove', onPointerMove)
    document.removeEventListener('pointerout', onPointerOut)
    window.removeEventListener('scroll', onScroll)
    ctx.revert()
    gsap.ticker.remove(onTick)
    lenis?.destroy()
  }
}
