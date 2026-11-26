import type { CSSProperties } from 'react'
import { useMemo, useState } from 'react'
import { GTM_ROWS, ROI_PRESETS, ROI_RANGE, formatBrl, simulateRoi } from '../data/roi'

export function RoiSimulator() {
  const [kg, setKg] = useState<number>(ROI_RANGE.initial)
  const snapshot = useMemo(
    () => simulateRoi(kg, ROI_RANGE.min, ROI_RANGE.max),
    [kg],
  )

  return (
    <section className="section-dark section-dark--elevated" id="simulador">
      <div className="container">
        <div className="section-header-split">
          <div>
            <span className="eyebrow">03 · Calculadora de viabilidade</span>
            <h2 className="section-title" style={{ marginTop: '1rem' }}>
              Simule a economia de <span className="text-gradient">GLP e o payback</span> do seu hotel.
            </h2>
          </div>
          <p className="section-lead">
            Ajuste o volume diário de resíduos orgânicos da cozinha ou escolha um dos três perfis abaixo para conferir economia bruta, saldo líquido e prazo de retorno.
          </p>
        </div>

        <div className="sim-wrapper reveal-up">
          <div className="sim-controls">
            <div>
              <div className="sim-readout-big">
                <span className="mono" style={{ fontSize: '0.78rem', color: 'var(--ink-secondary)', textTransform: 'uppercase' }}>
                  Resíduos orgânicos / dia
                </span>
                <div className="sim-kg-display">
                  <span>{snapshot.kg}</span> <small>kg/dia</small>
                </div>
              </div>

              <div style={{ marginTop: '1.25rem' }}>
                <input
                  type="range"
                  className="range-slider"
                  min={ROI_RANGE.min}
                  max={ROI_RANGE.max}
                  step={ROI_RANGE.step}
                  value={kg}
                  aria-label="Volume diário de resíduos orgânicos em quilogramas"
                  style={{ '--pct': `${snapshot.rangePercent}%` } as CSSProperties}
                  onChange={(event) => setKg(Number(event.target.value))}
                />
                <div className="range-ticks">
                  <span>10 kg</span>
                  <span>35 kg</span>
                  <span>50 kg</span>
                  <span>100 kg</span>
                  <span>200+ kg</span>
                </div>
              </div>
            </div>

            <div className="preset-grid" aria-label="Perfis rápidos de clientes">
              {ROI_PRESETS.map((preset) => (
                <button
                  key={preset.kg}
                  type="button"
                  className={preset.kg === kg ? 'preset-btn is-active' : 'preset-btn'}
                  onClick={() => setKg(preset.kg)}
                >
                  <div>
                    <strong>{preset.title}</strong>
                    <span>{preset.detail}</span>
                  </div>
                  <span className="preset-pill">{preset.pill}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="sim-output">
            <div className="sim-highlight">
              <div className="sim-highlight__label">Economia bruta mensal em GLP</div>
              <div className="sim-highlight__value">{snapshot.monthlyGrossLabel}</div>
              <div className="sim-highlight__sub">{snapshot.netSummary}</div>
            </div>

            <div className="sim-kpi-grid">
              <div className="sim-kpi">
                <div className="sim-kpi__label">Payback estimado</div>
                <div className="sim-kpi__val">{snapshot.paybackLabel}</div>
              </div>
              <div className="sim-kpi">
                <div className="sim-kpi__label">Digestato / semana</div>
                <div className="sim-kpi__val sim-kpi__val--amber">{snapshot.weeklyDigestateLabel}</div>
              </div>
              <div className="sim-kpi">
                <div className="sim-kpi__label">Digestato / dia</div>
                <div className="sim-kpi__val">{snapshot.dailyDigestateLabel}</div>
              </div>
              <div className="sim-kpi">
                <div className="sim-kpi__label">Desviado do aterro / mês</div>
                <div className="sim-kpi__val">{snapshot.divertedLabel}</div>
              </div>
            </div>

            <div className="sim-recommendation">
              {snapshot.band === 'entry' && (
                <>
                  <strong>Kit Urbano 35 kg/dia (R$ 22.029):</strong> Reator de 3.000 L e tanque pulmão de 1.000 L. Porta de entrada para pousadas ecológicas ou hotéis urbanos que já pagam coleta privada.
                </>
              )}
              {snapshot.band === 'traction' && (
                <>
                  <strong>Faixa de tração (50 a 100 kg/dia):</strong> Usa quase a mesma estrutura periférica do kit de 35 kg/dia e reduz o payback para <strong>{snapshot.paybackLabel}</strong>.
                </>
              )}
              {snapshot.band === 'scale' && (
                <>
                  <strong>Escala resort ou mini-hub (200+ kg/dia):</strong> Alto volume em um único hotel ou unidade atendendo pousadas vizinhas, com economia acima de <strong>{formatBrl(snapshot.monthlyGross)}/mês</strong>.
                </>
              )}
            </div>
          </div>
        </div>

        <div className="gtm-table-wrap reveal-up">
          <table className="gtm-table">
            <thead>
              <tr>
                <th>Perfil do cliente</th>
                <th>Geração diária</th>
                <th>Economia bruta (GLP/mês)</th>
                <th>Papel na estratégia da startup</th>
              </tr>
            </thead>
            <tbody>
              {GTM_ROWS.map((row) => (
                <tr key={row.profile}>
                  <td>
                    <strong>{row.profile}</strong>
                    {row.badge ? <span className="badge-sweet">{row.badge}</span> : null}
                  </td>
                  <td className="mono">{row.daily}</td>
                  <td className="mono" style={{ color: 'var(--bio-emerald)' }}>{row.gross}</td>
                  <td>{row.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
