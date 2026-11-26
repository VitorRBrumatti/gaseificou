import { useEffect, useRef, useState } from 'react'
import { Architecture } from '../components/Architecture'
import { DiagnosticSection } from '../components/DiagnosticForm'
import { Hero, MarqueeBand } from '../components/Hero'
import { IotEsg } from '../components/IotEsg'
import { Pricing } from '../components/Pricing'
import { Problem } from '../components/Problem'
import { RoiSimulator } from '../components/RoiSimulator'
import { SiteFooter, SiteHeader } from '../components/SiteChrome'
import { mountSiteMotion } from '../visuals/mountSiteMotion'

export function LandingPage() {
  const progressRef = useRef<HTMLDivElement>(null)
  const [navOpen, setNavOpen] = useState(false)

  useEffect(() => {
    return mountSiteMotion({
      progressBar: progressRef.current,
      onAnchorNavigate: () => setNavOpen(false),
    })
  }, [])

  return (
    <>
      <div className="scroll-progress" aria-hidden="true">
        <div className="scroll-progress__bar" id="scrollProgress" ref={progressRef} />
      </div>
      <div className="noise-overlay" aria-hidden="true" />
      <SiteHeader open={navOpen} onToggle={() => setNavOpen((open) => !open)} />
      <main id="topo">
        <Hero />
        <MarqueeBand />
        <Problem />
        <Architecture />
        <RoiSimulator />
        <IotEsg />
        <Pricing />
        <DiagnosticSection />
      </main>
      <SiteFooter />
    </>
  )
}
