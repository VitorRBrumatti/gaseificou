import { useEffect, useRef } from 'react'
import { mountBurner } from '../visuals/mountBurner'

export function Problem() {
  const mediaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const media = mediaRef.current
    if (!media) return

    const canvas = document.createElement('canvas')
    canvas.className = 'burner-canvas'
    canvas.setAttribute('aria-label', 'Simulação animada da chama de biogás purificado em fogão industrial')
    media.prepend(canvas)
    const stop = mountBurner(canvas)

    return () => {
      stop()
      canvas.remove()
    }
  }, [])

  return (
    <section className="section-paper" id="problema">
      <div className="container">
        <div className="section-header-split">
          <div>
            <span className="eyebrow eyebrow--dark">01 · O problema</span>
            <h2 className="section-title" style={{ marginTop: '1rem' }}>
              Três custos diários na rotina de cozinhas profissionais.
            </h2>
          </div>
          <p className="section-lead">
            Hotéis, pousadas e restaurantes pagam duas vezes pelo mesmo ciclo: compram gás o mês inteiro e depois pagam para armazenar ou descartar quilos de restos orgânicos.
          </p>
        </div>

        <div className="pain-grid">
          <article className="pain-card reveal-up">
            <div>
              <div className="pain-card__top">
                <span className="pain-card__num">DOR 01</span>
                <div className="pain-card__icon" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2c1 4 5 6.5 5 11a5 5 0 1 1-10 0c0-2.8 1.8-5.3 3.2-7 .5 1.5 1.5 2.4 2.3 2.8C12 6.8 12.2 4.4 12 2Z" />
                  </svg>
                </div>
              </div>
              <h3 style={{ marginTop: '1.4rem' }}>Custo recorrente alto com GLP e aquecimento</h3>
              <p>
                Cozinhas industriais e sistemas de água quente queimam gás todos os dias. Esse gasto pesa direto na conta mensal e sobe a cada reajuste de preço.
              </p>
            </div>
            <div className="pain-card__tag">
              <span>↗</span> Gasto fixo mensal no OPEX
            </div>
          </article>

          <article className="pain-card reveal-up">
            <div>
              <div className="pain-card__top">
                <span className="pain-card__num">DOR 02</span>
                <div className="pain-card__icon" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18" />
                    <path d="M8 6V4h8v2" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                  </svg>
                </div>
              </div>
              <h3 style={{ marginTop: '1.4rem' }}>Descarte caro e mal visto de orgânicos</h3>
              <p>
                Sobras de buffet, preparos e cascas geram mau cheiro, exigem câmara fria ou coleta privada paga em centros urbanos e acabam em aterros sanitários.
              </p>
            </div>
            <div className="pain-card__tag">
              <span>↗</span> Coleta paga e destino em aterro
            </div>
          </article>

          <article className="pain-card reveal-up">
            <div>
              <div className="pain-card__top">
                <span className="pain-card__num">DOR 03</span>
                <div className="pain-card__icon pain-card__icon--teal" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="18" rx="1" />
                    <rect x="14" y="8" width="7" height="13" rx="1" />
                    <path d="M6.5 7v.01M6.5 11v.01M6.5 15v.01M17.5 12v.01M17.5 16v.01" />
                  </svg>
                </div>
              </div>
              <h3 style={{ marginTop: '1.4rem' }}>Falta de soluções adaptadas à cidade</h3>
              <p>
                Biodigestores tradicionais precisam de área rural para escoar dezenas de litros de efluente líquido por dia. Se o fornecedor entrega só o tanque em um hotel urbano, a operação trava na segunda semana.
              </p>
            </div>
            <div className="pain-card__tag" style={{ color: '#0b6e49' }}>
              <span>✓</span> Resolvido pelo módulo urbano com camlock
            </div>
          </article>
        </div>

        <div className="thermal-banner reveal-up">
          <div className="thermal-banner__copy">
            <span className="eyebrow">Decisão de engenharia</span>
            <h3>Uso 100% térmico direto. Onde o retorno fecha.</h3>
            <p>
              Descartamos geração elétrica em pequena escala. Nela, a eficiência cai para 25% a 30% e inviabiliza o payback. Com queima direta no fogão industrial e no aquecimento de água, o aproveitamento fica entre 70% e 85%.
            </p>
            <div className="efficiency-bars">
              <div className="eff-row">
                <div className="eff-row__meta">
                  <span>Uso térmico direto (Gaseificou!)</span>
                  <strong style={{ color: 'var(--bio-emerald)' }}>70% – 85%</strong>
                </div>
                <div className="eff-track">
                  <div className="eff-fill eff-fill--thermal" />
                </div>
              </div>
              <div className="eff-row">
                <div className="eff-row__meta">
                  <span>Geração elétrica em pequena escala</span>
                  <strong style={{ color: 'var(--flame-amber)' }}>25% – 30%</strong>
                </div>
                <div className="eff-track">
                  <div className="eff-fill eff-fill--electric" />
                </div>
              </div>
            </div>
          </div>

          <div className="thermal-banner__media" ref={mediaRef}>
            <div className="thermal-banner__badge">
              <span>CHAMA TÉRMICA FILTRADA (SEM H₂S)</span>
              <strong style={{ color: 'var(--bio-emerald)' }}>USO NO FOGÃO</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
