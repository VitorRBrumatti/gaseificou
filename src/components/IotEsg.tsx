import { useEffect, useRef, useState } from 'react'
import { DEMO_UNIT_ID, createInitialTelemetry, startTelemetryFeed, type TelemetryView } from '../services/telemetryService'
import { drawTelemetryChart } from '../visuals/telemetryChart'
import { formatInt } from '../data/roi'

function formatSensor(value: number, digits: number, unit: string) {
  return `${value.toFixed(digits)} ${unit}`
}

function formatFlow(flow: number, filterOk: boolean) {
  const label = flow.toFixed(1).replace('.', ',')
  return `${label} m³/dia · ${filterOk ? 'Filtro H₂S OK' : 'Filtro H₂S em atenção'}`
}

export function IotEsg() {
  const [telemetry, setTelemetry] = useState<TelemetryView>(createInitialTelemetry)
  const [preview, setPreview] = useState(false)
  const previewRef = useRef(false)
  const chartRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    return startTelemetryFeed({
      isAlertPreview: () => previewRef.current,
      onUpdate: setTelemetry,
    })
  }, [])

  const alertVisual = preview || (telemetry.source === 'firestore' && telemetry.status === 'alert')

  useEffect(() => {
    const canvas = chartRef.current
    if (!canvas) return
    drawTelemetryChart(canvas, telemetry.series, alertVisual)
  }, [telemetry, alertVisual])

  const togglePreview = () => {
    setPreview((current) => {
      previewRef.current = !current
      return !current
    })
  }

  const levelStatus = alertVisual
    ? telemetry.source === 'simulation'
      ? '▲ Pulmão em 89% · Coleta acionada'
      : `▲ Pulmão em ${Math.round(telemetry.bufferLevelPct)}% · Coleta acionada`
    : `● ${telemetry.collectionLabel}`

  const sourceLabel = telemetry.source === 'firestore'
    ? `FIRESTORE · ${DEMO_UNIT_ID}`
    : 'SIMULAÇÃO LOCAL'

  return (
    <section className="section-dark" id="iot-esg">
      <div className="container">
        <div className="section-header-split">
          <div>
            <span className="eyebrow">04 · IoT e experiência ESG</span>
            <h2 className="section-title" style={{ marginTop: '1rem' }}>
              Sensores no reator. <span className="text-gradient">Dados abertos ao hóspede.</span>
            </h2>
          </div>
          <p className="section-lead">
            A operação não depende de conferência manual da equipe da cozinha. Os sensores monitoram pressão, temperatura e nível do tanque pulmão, e o QR Code mostra os resultados na recepção.
          </p>
        </div>

        <div className="iot-grid reveal-up">
          <div className="iot-console">
            <div className="iot-console__header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span className="pulse-dot" />
                  <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem' }}>
                    Painel IoT · Unidade demonstração (35 kg/dia)
                  </strong>
                </div>
                <span className="mono" style={{ fontSize: '0.74rem', color: 'var(--ink-muted)' }}>
                  TELEMETRIA PREVENTIVA · {sourceLabel}
                </span>
              </div>
              <button className="btn btn--ghost btn--sm" type="button" onClick={togglePreview}>
                {preview ? 'Restaurar operação normal' : 'Testar alerta preventivo'}
              </button>
            </div>

            <div className="iot-sensors">
              <div className="sensor-tile">
                <span className="sensor-tile__label">Pressão do gás</span>
                <span className="sensor-tile__value">{formatSensor(telemetry.pressureMbar, 1, 'mbar')}</span>
                <span className="sensor-tile__status">● Chama estável</span>
              </div>
              <div className={alertVisual ? 'sensor-tile is-alert' : 'sensor-tile'}>
                <span className="sensor-tile__label">Temp. interna</span>
                <span className="sensor-tile__value">{formatSensor(telemetry.temperatureC, 1, '°C')}</span>
                <span className="sensor-tile__status">{alertVisual ? '▲ Queda térmica detectada' : '● Zona mesofílica'}</span>
              </div>
              <div className={alertVisual ? 'sensor-tile is-alert' : 'sensor-tile'}>
                <span className="sensor-tile__label">Tanque pulmão</span>
                <span className="sensor-tile__value">{Math.round(telemetry.bufferLevelPct)}%</span>
                <span className="sensor-tile__status">{levelStatus}</span>
              </div>
            </div>

            <div className="telemetry-chart-box">
              <div className="telemetry-chart-head">
                <span>PRODUÇÃO DE GÁS NO GASÔMETRO (4–5 m³)</span>
                <span style={{ color: 'var(--bio-emerald)' }}>{formatFlow(telemetry.flowM3PerDay, telemetry.filterOk)}</span>
              </div>
              <canvas className="telemetry-canvas" ref={chartRef} width={600} height={120} />
            </div>

            <div className={alertVisual ? 'alert-banner is-warning' : 'alert-banner'}>
              <span>
                {alertVisual
                  ? 'Alerta preventivo disparado: suporte remoto acionou ajuste de carga e antecipou a coleta camlock antes de qualquer parada.'
                  : 'Biologia estável. Pressão, temperatura interna e nível do tanque pulmão dentro da faixa.'}
              </span>
              <span className="mono" style={{ fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                {alertVisual ? 'PREVENÇÃO ATIVA' : 'STATUS: NOMINAL'}
              </span>
            </div>
          </div>

          <div className="guest-phone-card">
            <div>
              <span className="mono" style={{ fontSize: '0.74rem', color: 'var(--bio-emerald)', textTransform: 'uppercase' }}>
                Recepção e restaurante
              </span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', marginTop: '0.35rem' }}>
                O que o hóspede vê ao escanear o QR Code
              </h3>
            </div>

            <div className="phone-frame">
              <div className="phone-notch" />
              <div className="guest-live-pill">
                <span className="pulse-dot" />
                AO VIVO · PAINEL GASEIFICOU!
              </div>
              <h4 className="guest-headline">
                As refeições deste hotel usam gás gerado dos próprios resíduos orgânicos da cozinha.
              </h4>
              <div className="guest-stats-row">
                <div className="guest-stat">
                  <strong>{formatInt(telemetry.monthlyOrganicKg)} kg</strong>
                  <span>Orgânicos processados no mês</span>
                </div>
                <div className="guest-stat">
                  <strong>{formatInt(telemetry.monthlyBiofertL)} L</strong>
                  <span>Biofertilizante retirado por parceiros locais</span>
                </div>
              </div>
              <div className="qr-strip">
                <div className="qr-box" aria-hidden="true">
                  <svg viewBox="0 0 36 36" width="52" height="52" fill="#060a08">
                    <rect x="2" y="2" width="10" height="10" rx="1.5" />
                    <rect x="4" y="4" width="6" height="6" fill="#fff" />
                    <rect x="5.5" y="5.5" width="3" height="3" />
                    <rect x="24" y="2" width="10" height="10" rx="1.5" />
                    <rect x="26" y="4" width="6" height="6" fill="#fff" />
                    <rect x="27.5" y="5.5" width="3" height="3" />
                    <rect x="2" y="24" width="10" height="10" rx="1.5" />
                    <rect x="4" y="26" width="6" height="6" fill="#fff" />
                    <rect x="5.5" y="27.5" width="3" height="3" />
                    <rect x="15" y="4" width="3" height="3" />
                    <rect x="19" y="7" width="3" height="3" />
                    <rect x="14" y="12" width="4" height="4" />
                    <rect x="20" y="14" width="3" height="6" />
                    <rect x="4" y="15" width="6" height="3" />
                    <rect x="14" y="19" width="4" height="4" />
                    <rect x="25" y="16" width="4" height="4" />
                    <rect x="30" y="21" width="4" height="4" />
                    <rect x="16" y="26" width="5" height="3" />
                    <rect x="24" y="26" width="4" height="7" />
                    <rect x="30" y="29" width="4" height="5" />
                  </svg>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--ink-secondary)', lineHeight: 1.45 }}>
                  <strong style={{ color: 'var(--ink-primary)', display: 'block' }}>Placa na recepção e mesas</strong>
                  O hóspede abre o painel no celular e acompanha quanto lixo virou energia limpa.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
