import { useEffect, useRef } from 'react'
import { mountHeroWebGL } from '../visuals/mountHeroWebGL'

const MARQUEE = [
  'GÁS PRÓPRIO NO LOCAL',
  'FILTRAGEM DE H₂S E CORTA-CHAMAS',
  'ENGATE RÁPIDO CAMLOCK URBANO',
  'REATOR COMPACTO 3.000 L',
  'TELEMETRIA IOT PREVENTIVA',
  'QR CODE ESG NA RECEPÇÃO',
]

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const canvas = document.createElement('canvas')
    canvas.className = 'hero__canvas'
    canvas.setAttribute('aria-hidden', 'true')
    section.prepend(canvas)
    const stop = mountHeroWebGL(canvas)

    return () => {
      stop()
      canvas.remove()
    }
  }, [])

  return (
    <section className="hero" ref={sectionRef}>
      <div className="hero__vignette" aria-hidden="true" />
      <div className="container hero__inner">
        <div className="hero__content">
          <span className="eyebrow hero-reveal">
            <span className="pulse-dot" />
            Biodigestão turnkey para hotelaria e restaurantes
          </span>

          <h1 className="hero__title" id="heroTitle">
            <span className="line-wrap">
              <span className="line-inner">O resto do seu buffet</span>
            </span>
            <span className="line-wrap">
              <span className="line-inner">
                vira o <span className="text-gradient">gás da sua cozinha.</span>
              </span>
            </span>
          </h1>

          <p className="hero__subtitle hero-reveal">
            Sistema compacto entregue pronto para operar. Ele converte os resíduos orgânicos da cozinha de hotéis, pousadas e restaurantes em gás próprio para fogão e aquecimento, com retirada garantida do biofertilizante em área urbana e monitoramento IoT.
          </p>

          <div className="hero__cta-row hero-reveal">
            <a href="#simulador" className="btn btn--primary magnetic">
              Simular economia em GLP
              <span className="btn__arrow" aria-hidden="true">→</span>
            </a>
            <a href="#arquitetura" className="btn btn--ghost magnetic">
              Ver arquitetura em 4 módulos
            </a>
            <span className="hero__trust-note">
              <span className="pulse-dot pulse-dot--amber" />
              Equipamento próprio desde o Dia 1 · Funciona em área urbana
            </span>
          </div>
        </div>

        <div className="hero__metrics hero-reveal" aria-label="Indicadores principais">
          <div className="metric-cell">
            <div className="metric-cell__value">
              70%–<span>85%</span>
            </div>
            <div className="metric-cell__label">Eficiência no uso térmico direto (fogão e água quente)</div>
          </div>
          <div className="metric-cell">
            <div className="metric-cell__value">
              <span>~2,5 L</span> / kg
            </div>
            <div className="metric-cell__label">Digestato líquido com retirada semanal ou uso no jardim</div>
          </div>
          <div className="metric-cell">
            <div className="metric-cell__value">
              R$ <span>22.029</span>
            </div>
            <div className="metric-cell__label">Preço sugerido do Kit Urbano 35 kg/dia instalado</div>
          </div>
          <div className="metric-cell">
            <div className="metric-cell__value">
              <span>1,5–3,6</span> anos
            </div>
            <div className="metric-cell__label">Payback em hotéis médios (50 a 100 kg/dia)</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function MarqueeBand() {
  const items = [...MARQUEE, ...MARQUEE]
  return (
    <div className="marquee-band" aria-hidden="true">
      <div className="marquee-track">
        {items.map((item, index) => (
          <span className="marquee-item" key={`${item}-${index}`}>
            {index % 2 === 0 ? <strong>{item}</strong> : item}
            <span className="marquee-sep" />
          </span>
        ))}
      </div>
    </div>
  )
}
