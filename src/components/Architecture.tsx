import { useState } from 'react'
import { CAD_HOTSPOTS, SPACE_PROFILES, TURNKEY_MODULES, type HotspotId, type ModuleId, type SpaceProfileId } from '../data/modules'

export function Architecture() {
  const [moduleId, setModuleId] = useState<ModuleId>(1)
  const [space, setSpace] = useState<SpaceProfileId>('urban')
  const [hotspotId, setHotspotId] = useState<HotspotId>('reator')
  const active = TURNKEY_MODULES.find((item) => item.id === moduleId) ?? TURNKEY_MODULES[0]
  const hotspot = CAD_HOTSPOTS.find((item) => item.id === hotspotId) ?? CAD_HOTSPOTS[0]

  return (
    <section className="section-dark" id="arquitetura">
      <div className="container">
        <div className="section-header-split">
          <div>
            <span className="eyebrow">02 · Arquitetura em 4 módulos</span>
            <h2 className="section-title" style={{ marginTop: '1rem' }}>
              Sistema completo em <span className="text-gradient">4 módulos padronizados.</span>
            </h2>
          </div>
          <p className="section-lead">
            A entrega cobre a planta inteira: reator anaeróbico, linha de gás com segurança térmica, logística de saída do digestato e telemetria remota.
          </p>
        </div>

        <div className="blueprint-stage reveal-up">
          <div className="blueprint-stage__top">
            <div>
              <span className="mono" style={{ fontSize: '0.76rem', color: 'var(--bio-emerald)', textTransform: 'uppercase' }}>
                Fluxograma interativo · Kit Urbano 35 kg/dia
              </span>
              <div style={{ fontSize: '0.92rem', color: 'var(--ink-secondary)' }}>
                Selecione um módulo para ver as especificações de massa, gás e sensores.
              </div>
            </div>
            <div className="blueprint-tabs" role="tablist" aria-label="Selecionar módulo">
              {TURNKEY_MODULES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={item.id === moduleId ? 'bp-tab is-active' : 'bp-tab'}
                  role="tab"
                  aria-selected={item.id === moduleId}
                  onClick={() => setModuleId(item.id)}
                >
                  {item.tab}
                </button>
              ))}
            </div>
          </div>

          <svg className="schematic-svg" viewBox="0 0 1120 260" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Diagrama de fluxo dos 4 módulos Gaseificou">
            <path className="pipe-base" d="M 165 130 H 255" />
            <path className="pipe-base" d="M 455 100 H 545" />
            <path className="pipe-base" d="M 455 160 C 495 160 495 200 545 200" />
            <path className="pipe-base" d="M 745 100 H 845" />
            <path className="pipe-base" d="M 745 200 H 845" />
            <path className="pipe-base" d="M 355 68 V 28 H 950 V 68" />

            <path className="pipe-flow pipe-flow--amber" d="M 165 130 H 255" />
            <path className="pipe-flow" d="M 455 100 H 545" />
            <path className="pipe-flow pipe-flow--teal" d="M 455 160 C 495 160 495 200 545 200" />
            <path className="pipe-flow" d="M 745 100 H 845" />
            <path className="pipe-flow pipe-flow--teal" d="M 745 200 H 845" />
            <path className="pipe-flow" style={{ strokeDasharray: '4 10', opacity: 0.65 }} d="M 355 68 V 28 H 950 V 68" />

            <g>
              <rect x="15" y="82" width="150" height="96" rx="16" fill="#131512" stroke="rgba(255,107,43,0.45)" strokeWidth="1.5" />
              <text x="33" y="110" fill="#ff6b2b" fontFamily="JetBrains Mono" fontSize="11" fontWeight="600">ENTRADA DIÁRIA</text>
              <text x="33" y="134" fill="#f4f2ec" fontFamily="Bricolage Grotesque" fontSize="16" fontWeight="700">Cozinha</text>
              <text x="33" y="156" fill="#a2b2a9" fontFamily="Plus Jakarta Sans" fontSize="12">~35 kg/dia triados</text>
            </g>

            <g className={moduleId === 1 ? 'bp-node is-active' : 'bp-node'} onClick={() => setModuleId(1)}>
              <rect className="node-box" x="255" y="68" width="200" height="124" rx="18" />
              <text x="275" y="96" fill="#10f0a0" fontFamily="JetBrains Mono" fontSize="11" fontWeight="600">MÓDULO 01</text>
              <text x="275" y="122" fill="#f4f2ec" fontFamily="Bricolage Grotesque" fontSize="18" fontWeight="700">Core anaeróbico</text>
              <text x="275" y="146" fill="#a2b2a9" fontFamily="Plus Jakarta Sans" fontSize="12">Reator 3.000 L · 30 dias</text>
              <text x="275" y="168" fill="#a2b2a9" fontFamily="Plus Jakarta Sans" fontSize="12">Gasômetro 4–5 m³ + funil</text>
            </g>

            <g className={moduleId === 2 ? 'bp-node is-active' : 'bp-node'} onClick={() => setModuleId(2)}>
              <rect className="node-box" x="545" y="54" width="200" height="92" rx="16" />
              <text x="565" y="80" fill="#10f0a0" fontFamily="JetBrains Mono" fontSize="11" fontWeight="600">MÓDULO 02 · TÉRMICO</text>
              <text x="565" y="104" fill="#f4f2ec" fontFamily="Bricolage Grotesque" fontSize="17" fontWeight="700">Gás e segurança</text>
              <text x="565" y="126" fill="#a2b2a9" fontFamily="Plus Jakarta Sans" fontSize="12">Filtro H₂S · Corta-chamas</text>
            </g>

            <g className={moduleId === 3 ? 'bp-node is-active' : 'bp-node'} onClick={() => setModuleId(3)}>
              <rect className="node-box" x="545" y="162" width="200" height="84" rx="16" />
              <text x="565" y="186" fill="#00d4c8" fontFamily="JetBrains Mono" fontSize="11" fontWeight="600">MÓDULO 03 · URBANO</text>
              <text x="565" y="210" fill="#f4f2ec" fontFamily="Bricolage Grotesque" fontSize="17" fontWeight="700">Escoamento físico</text>
              <text x="565" y="230" fill="#a2b2a9" fontFamily="Plus Jakarta Sans" fontSize="12">Pulmão 1.000 L + camlock</text>
            </g>

            <g className={moduleId === 4 ? 'bp-node is-active' : 'bp-node'} onClick={() => setModuleId(4)}>
              <rect className="node-box" x="845" y="54" width="260" height="92" rx="16" />
              <text x="865" y="80" fill="#10f0a0" fontFamily="JetBrains Mono" fontSize="11" fontWeight="600">SAÍDA TÉRMICA + MÓDULO 04</text>
              <text x="865" y="104" fill="#f4f2ec" fontFamily="Bricolage Grotesque" fontSize="17" fontWeight="700">Fogão + IoT e QR ESG</text>
              <text x="865" y="126" fill="#a2b2a9" fontFamily="Plus Jakarta Sans" fontSize="12">Queimadores adaptados + sensores</text>
            </g>

            <g>
              <rect x="845" y="162" width="260" height="84" rx="16" fill="#0b1614" stroke="rgba(0,212,200,0.4)" strokeWidth="1.5" />
              <text x="865" y="186" fill="#00d4c8" fontFamily="JetBrains Mono" fontSize="11" fontWeight="600">DESTINO GARANTIDO</text>
              <text x="865" y="210" fill="#f4f2ec" fontFamily="Bricolage Grotesque" fontSize="17" fontWeight="700">~612 L/sem biofertilizante</text>
              <text x="865" y="230" fill="#a2b2a9" fontFamily="Plus Jakarta Sans" fontSize="12">Chácaras/viveiros locais ou jardim</text>
            </g>
          </svg>

          <div className="bp-detail-bar">
            <div>
              <strong>{active.detailTag}</strong>
              <p style={{ color: 'var(--ink-secondary)', marginTop: '0.2rem' }}>{active.detailText}</p>
            </div>
            <span className="mono" style={{ fontSize: '0.78rem', color: 'var(--ink-primary)' }}>{active.detailMetric}</span>
          </div>
        </div>

        <div className="modules-grid">
          {TURNKEY_MODULES.map((item) => (
            <article
              key={item.id}
              className={item.id === moduleId ? 'spotlight-card reveal-up is-highlighted' : 'spotlight-card reveal-up'}
            >
              <div className="module-head">
                <span className={item.badgeClass}>{item.badge}</span>
                <span className="mono" style={{ fontSize: '0.8rem', color: item.metaColor ?? 'var(--ink-muted)' }}>{item.meta}</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>

              {item.specs.length > 0 && (
                <ul className="spec-list">
                  {item.specs.map((spec) => (
                    <li key={spec}><span className="spec-check">✓</span><span>{spec}</span></li>
                  ))}
                </ul>
              )}

              {item.id === 3 && (
                <>
                  <div className="mode-toggle" role="tablist" aria-label="Cenário de escoamento">
                    {SPACE_PROFILES.map((profile) => (
                      <button
                        key={profile.id}
                        type="button"
                        className={space === profile.id ? 'mode-toggle__btn is-active' : 'mode-toggle__btn'}
                        role="tab"
                        aria-selected={space === profile.id}
                        onClick={() => setSpace(profile.id)}
                      >
                        {profile.tabLabel}
                      </button>
                    ))}
                  </div>
                  {SPACE_PROFILES.map((profile) => (
                    <div className="mode-panel" key={profile.id} hidden={space !== profile.id}>
                      <ul className="spec-list" style={{ marginTop: 0 }}>
                        {profile.specs.map((spec) => (
                          <li key={spec}><span className="spec-check">✓</span><span>{spec}</span></li>
                        ))}
                      </ul>
                      <span className="saving-pill">{profile.pill}</span>
                    </div>
                  ))}
                </>
              )}
            </article>
          ))}
        </div>

        <div className="hardware-showcase reveal-up">
          <div className="hardware-stage">
            <svg className="hardware-iso-svg" viewBox="0 0 820 460" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Maquete técnica interativa do Kit Urbano 35 kg/dia Gaseificou">
              <defs>
                <radialGradient id="isoGlow" cx="50%" cy="48%" r="55%">
                  <stop offset="0%" stopColor="#10f0a0" stopOpacity="0.16" />
                  <stop offset="100%" stopColor="#060a08" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="tankBody" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#111d18" />
                  <stop offset="45%" stopColor="#1d3027" />
                  <stop offset="100%" stopColor="#0b1410" />
                </linearGradient>
                <linearGradient id="bufferBody" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#0d1b1b" />
                  <stop offset="50%" stopColor="#163132" />
                  <stop offset="100%" stopColor="#081314" />
                </linearGradient>
                <linearGradient id="liquidFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00d4c8" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#10f0a0" stopOpacity="0.16" />
                </linearGradient>
                <pattern id="isoGrid" width="32" height="32" patternUnits="userSpaceOnUse">
                  <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(244,242,236,0.045)" strokeWidth="1" />
                </pattern>
              </defs>

              <rect width="820" height="460" fill="url(#isoGrid)" />
              <rect width="820" height="460" fill="url(#isoGlow)" />

              <polygon points="90,340 420,425 745,330 415,255" fill="#0d1512" stroke="rgba(244,242,236,0.14)" strokeWidth="1.5" />
              <polygon points="90,340 420,425 420,442 90,357" fill="#080e0c" stroke="rgba(244,242,236,0.08)" />
              <polygon points="420,425 745,330 745,347 420,442" fill="#0a120f" stroke="rgba(244,242,236,0.08)" />

              <path className="pipe-base" d="M 275 112 V 82 H 445 V 158" />
              <path className="pipe-flow" d="M 275 112 V 82 H 445 V 158" />
              <path className="pipe-base" d="M 485 182 H 555 V 100 H 715" />
              <path className="pipe-flow" d="M 485 182 H 555 V 100 H 715" />
              <path className="pipe-base" d="M 340 288 H 522 V 278 H 572" />
              <path className="pipe-flow pipe-flow--teal" d="M 340 288 H 522 V 278 H 572" />
              <path className="pipe-base" style={{ strokeWidth: 1.5 }} d="M 275 142 H 532 V 162" />
              <path className="pipe-flow" style={{ strokeWidth: 1.5, strokeDasharray: '4 8' }} d="M 275 142 H 532 V 162" />

              <g className={hotspotId === 'reator' ? 'iso-part is-focused' : 'iso-part'}>
                <path d="M 118 196 L 178 196 L 160 236 L 136 236 Z" fill="#1b1511" stroke="#ff6b2b" strokeWidth="1.6" />
                <rect x="143" y="236" width="10" height="58" fill="#1b1511" stroke="rgba(255,107,43,0.6)" />
                <path className="pipe-flow pipe-flow--amber" d="M 148 206 V 290 H 206" />
                <ellipse cx="275" cy="316" rx="86" ry="26" fill="#070c0a" stroke="rgba(16,240,160,0.3)" strokeWidth="1.5" />
                <rect x="189" y="148" width="172" height="168" fill="url(#tankBody)" stroke="rgba(244,242,236,0.22)" strokeWidth="1.5" />
                <path d="M 189 148 C 189 96 361 96 361 148 Z" fill="#11221b" stroke="rgba(16,240,160,0.55)" strokeWidth="1.8" />
                <ellipse cx="275" cy="148" rx="86" ry="22" fill="#142921" stroke="rgba(16,240,160,0.4)" strokeWidth="1.4" />
                <rect x="242" y="182" width="66" height="108" rx="10" fill="#070f0c" stroke="rgba(16,240,160,0.35)" strokeWidth="1.2" />
                <rect x="246" y="218" width="58" height="68" rx="6" fill="url(#liquidFill)" />
                <circle className="bio-bubble b1" cx="262" cy="264" r="3.5" fill="#10f0a0" />
                <circle className="bio-bubble b2" cx="278" cy="250" r="4.5" fill="#00d4c8" />
                <circle className="bio-bubble b3" cx="290" cy="272" r="3" fill="#10f0a0" />
                <circle className="bio-bubble b4" cx="270" cy="228" r="2.8" fill="#ffb84d" />
                <text x="196" y="362" fill="#a2b2a9" fontFamily="JetBrains Mono" fontSize="11">REATOR 3.000 L + GASÔMETRO 4-5m³</text>
              </g>

              <g className={hotspotId === 'gas' ? 'iso-part is-focused' : 'iso-part'}>
                <rect x="412" y="156" width="76" height="142" rx="12" fill="#101a16" stroke="rgba(244,242,236,0.22)" strokeWidth="1.5" />
                <rect x="428" y="176" width="22" height="86" rx="11" fill="#0a2018" stroke="#10f0a0" strokeWidth="1.5" />
                <line x1="428" y1="205" x2="450" y2="205" stroke="rgba(16,240,160,0.45)" />
                <line x1="428" y1="235" x2="450" y2="235" stroke="rgba(16,240,160,0.45)" />
                <circle cx="468" cy="196" r="13" fill="#060a08" stroke="#ffb84d" strokeWidth="1.6" />
                <line x1="468" y1="196" x2="475" y2="189" stroke="#ff6b2b" strokeWidth="2" strokeLinecap="round" />
                <rect x="458" y="232" width="20" height="30" rx="5" fill="#1f1510" stroke="#ff6b2b" strokeWidth="1.4" />
                <text x="394" y="318" fill="#a2b2a9" fontFamily="JetBrains Mono" fontSize="10">FILTRO H₂S · BOOSTER</text>
              </g>

              <g className={hotspotId === 'iot' ? 'iso-part is-focused' : 'iso-part'}>
                <rect x="514" y="154" width="60" height="72" rx="10" fill="#0b1612" stroke="#10f0a0" strokeWidth="1.6" />
                <circle cx="544" cy="182" r="14" fill="rgba(16,240,160,0.12)" stroke="#10f0a0" strokeWidth="2" />
                <circle cx="544" cy="182" r="5" fill="#10f0a0" />
                <rect x="525" y="206" width="38" height="8" rx="3" fill="rgba(244,242,236,0.16)" />
                <text x="506" y="244" fill="#10f0a0" fontFamily="JetBrains Mono" fontSize="10">IOT HUB 24/7</text>
              </g>

              <g className={hotspotId === 'pulmao' ? 'iso-part is-focused' : 'iso-part'}>
                <ellipse cx="640" cy="316" rx="64" ry="20" fill="#070c0a" stroke="rgba(0,212,200,0.35)" strokeWidth="1.5" />
                <rect x="576" y="196" width="128" height="120" fill="url(#bufferBody)" stroke="rgba(0,212,200,0.4)" strokeWidth="1.5" />
                <ellipse cx="640" cy="196" rx="64" ry="18" fill="#132b2d" stroke="rgba(0,212,200,0.55)" strokeWidth="1.5" />
                <rect x="628" y="220" width="24" height="74" rx="6" fill="#060c0c" stroke="rgba(0,212,200,0.4)" />
                <rect x="631" y="246" width="18" height="45" rx="4" fill="#00d4c8" fillOpacity="0.65" />
                <rect x="704" y="274" width="34" height="18" rx="5" fill="#202e29" stroke="#00d4c8" strokeWidth="1.8" />
                <circle cx="742" cy="283" r="6" fill="#00d4c8" />
                <text x="572" y="356" fill="#00d4c8" fontFamily="JetBrains Mono" fontSize="10">PULMÃO 1.000 L + CAMLOCK</text>
              </g>

              <g>
                <rect x="660" y="76" width="136" height="46" rx="10" fill="#0a1913" stroke="rgba(16,240,160,0.5)" strokeWidth="1.3" />
                <text x="674" y="96" fill="#10f0a0" fontFamily="JetBrains Mono" fontSize="10" fontWeight="600">SAÍDA TÉRMICA →</text>
                <text x="674" y="112" fill="#f4f2ec" fontFamily="Plus Jakarta Sans" fontSize="11">Fogão industrial</text>
              </g>
            </svg>

            {CAD_HOTSPOTS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={hotspotId === item.id ? 'hotspot is-active' : 'hotspot'}
                style={{ top: item.top, left: item.left }}
                aria-label={item.ariaLabel}
                onClick={() => setHotspotId(item.id)}
              >
                {item.pin}
              </button>
            ))}
          </div>

          <div className="hardware-inspector">
            <div>
              <span className="eyebrow" style={{ marginBottom: '1rem' }}>Raio-X do hardware</span>
              <div className="hotspot-info">
                <h3 className="hotspot-info__title">{hotspot.title}</h3>
                <p className="hotspot-info__desc">{hotspot.description}</p>
              </div>
              <div className="hotspot-specs">
                <div className="hotspot-spec-box">
                  <span>{hotspot.spec1Label}</span>
                  <strong>{hotspot.spec1Value}</strong>
                </div>
                <div className="hotspot-spec-box">
                  <span>{hotspot.spec2Label}</span>
                  <strong>{hotspot.spec2Value}</strong>
                </div>
              </div>
            </div>
            <p className="mono" style={{ fontSize: '0.74rem', color: 'var(--ink-muted)' }}>
              Clique nos pinos numerados (01–04) para ver os dados de cada subsistema.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
