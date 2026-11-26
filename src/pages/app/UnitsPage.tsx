import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { formatDecimal, formatInt } from '../../data/roi'
import { hotelUnit, unitPath } from '../../routes'
import {
  addReading,
  createInitialTelemetry,
  createUnit,
  listReadings,
  listUnits,
  normalizeUnitId,
  startTelemetryFeed,
  telemetryWriteErrorMessage,
  type StoredUnit,
  type TelemetryView,
  type UnitReading,
  type UnitTelemetry,
} from '../../services/telemetryService'
import { drawTelemetryChart, type TelemetryChartScale } from '../../visuals/telemetryChart'
import { NewReadingForm, NewUnitForm, draftFromUnit } from './UnitForms'

const whenFormat = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

export function UnitsPage() {
  const { unitId: rawUnitId } = useParams()
  const navigate = useNavigate()
  const requestedId = rawUnitId ? normalizeUnitId(rawUnitId) : null
  const [units, setUnits] = useState<StoredUnit[] | null>(null)
  const [readings, setReadings] = useState<UnitReading[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    let active = true
    listUnits()
      .then((next) => {
        if (!active) return
        setUnits(next)
        if (next.length === 0) return
        const known = requestedId !== null && next.some((unit) => unit.id === requestedId)
        if (!known) navigate(unitPath(next[0].id), { replace: true })
      })
      .catch((cause: unknown) => {
        if (!active) return
        setError(telemetryWriteErrorMessage(cause))
        setUnits(null)
      })
    return () => {
      active = false
    }
  }, [navigate, requestedId])

  useEffect(() => {
    if (!requestedId) {
      setReadings([])
      return
    }
    let active = true
    listReadings(requestedId)
      .then((next) => {
        if (active) setReadings(next)
      })
      .catch((cause: unknown) => {
        if (!active) return
        setError(telemetryWriteErrorMessage(cause))
      })
    return () => {
      active = false
    }
  }, [requestedId])

  const selected = units?.find((unit) => unit.id === requestedId) ?? null
  const showDemo = units !== null && units.length === 0 && !error

  async function onCreate(input: { id: string, name: string, reading: UnitTelemetry }) {
    setBusy(true)
    setError('')
    try {
      await createUnit(input)
      setShowCreate(false)
      navigate(unitPath(normalizeUnitId(input.id)))
    } catch (cause) {
      setError(telemetryWriteErrorMessage(cause))
    } finally {
      setBusy(false)
    }
  }

  async function onReading(reading: UnitTelemetry) {
    if (!selected) return
    setBusy(true)
    setError('')
    try {
      await addReading(selected.id, selected.name, reading)
      const next = await listUnits()
      setUnits(next)
      setReadings(await listReadings(selected.id))
    } catch (cause) {
      setError(telemetryWriteErrorMessage(cause))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="app-page">
      <header className="app-page__head">
        <h1>Unidades</h1>
        <p>Cadastre um kit e lance leituras. O cartão mostra o estado mais recente.</p>
      </header>

      {units === null && !error ? <p className="app-empty">Carregando unidades...</p> : null}
      {error ? <p className="app-banner" role="alert">{error}</p> : null}

      <div className="unit-toolbar">
        <button className="btn btn--ghost btn--sm" type="button" onClick={() => setShowCreate((open) => !open)}>
          {showCreate ? 'Fechar cadastro' : 'Nova unidade'}
        </button>
      </div>

      {showCreate ? <NewUnitForm busy={busy} onSubmit={onCreate} /> : null}
      {showDemo ? <DemoUnit /> : null}

      {units && units.length > 0 ? (
        <div className="unit-board">
          <ul className="unit-picker">
            {units.map((unit) => (
              <li key={unit.id}>
                <button
                  type="button"
                  className={unit.id === requestedId ? 'is-active' : undefined}
                  onClick={() => navigate(unitPath(unit.id))}
                >
                  <strong>{unit.id}</strong>
                  <span>{unit.name}</span>
                </button>
              </li>
            ))}
          </ul>

          {selected ? (
            <div className="unit-detail">
              <UnitCard unit={selected} />
              <StatusBanner status={selected.status} />
              <FlowChart readings={readings} alert={selected.status === 'alert'} />
              <GuestAddress key={selected.id} unitId={selected.id} />
              <NewReadingForm
                key={`${selected.id}:${selected.updatedAt ?? ''}`}
                busy={busy}
                initial={draftFromUnit(selected)}
                onSubmit={onReading}
              />
              <ReadingList readings={readings} />
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}

function UnitCard({ unit }: { unit: StoredUnit }) {
  const alert = unit.status === 'alert'
  const sourceLabel = unit.source === 'firestore' ? 'Firestore' : 'Neste navegador'
  return (
    <article className={alert ? 'unit-card is-alert' : 'unit-card'}>
      <div className="unit-card__head">
        <div>
          <p className="app-kicker">{unit.id}</p>
          <h2>{unit.name}</h2>
        </div>
        <div className="unit-card__flags">
          <span className={alert ? 'unit-flag is-alert' : 'unit-flag'}>{alert ? 'Alerta' : 'Nominal'}</span>
          <span className="unit-flag">{sourceLabel}</span>
        </div>
      </div>
      <MetricList reading={unit} />
    </article>
  )
}

function StatusBanner({ status }: { status: UnitTelemetry['status'] }) {
  const alert = status === 'alert'
  return (
    <p className={alert ? 'unit-status is-alert' : 'unit-status'} role="status">
      {alert
        ? 'Alerta preventivo: a última leitura saiu da faixa. Ajuste a carga e antecipe a coleta antes de a operação parar.'
        : 'Operação estável. Pressão, temperatura interna e nível do tanque pulmão dentro da faixa da última leitura.'}
    </p>
  )
}

function FlowChart({ readings, alert }: { readings: UnitReading[], alert: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const series = [...readings].reverse().map((reading) => reading.flowM3PerDay)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || series.length < 2) return
    drawTelemetryChart(canvas, series, alert, flowScale(series))
  }, [alert, series])

  if (series.length < 2) return null

  return (
    <div className="unit-chart">
      <p>Vazão nas leituras</p>
      <canvas ref={canvasRef} width={640} height={140} />
    </div>
  )
}

function flowScale(series: number[]): TelemetryChartScale {
  const min = Math.min(...series)
  const max = Math.max(...series)
  const pad = Math.max((max - min) * 0.2, 0.2)
  return { min: min - pad, max: max + pad }
}

function GuestAddress({ unitId }: { unitId: string }) {
  const path = hotelUnit(unitId)
  const url = `${window.location.origin}${path}`
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="guest-address">
      <p className="app-kicker">Painel do hóspede</p>
      <div className="guest-address__row">
        <input readOnly value={url} aria-label="Endereço do painel do hóspede" onFocus={(event) => event.currentTarget.select()} />
        <button className="btn btn--ghost btn--sm" type="button" onClick={() => void copy()}>
          {copied ? 'Copiado' : 'Copiar'}
        </button>
        <Link className="btn btn--ghost btn--sm" to={path}>Abrir</Link>
      </div>
    </div>
  )
}

function DemoUnit() {
  const [telemetry, setTelemetry] = useState<TelemetryView>(() => createInitialTelemetry())

  useEffect(() => {
    return startTelemetryFeed({
      isAlertPreview: () => false,
      onUpdate: setTelemetry,
    })
  }, [])

  return (
    <article className="unit-card">
      <div className="unit-card__head">
        <div>
          <p className="app-kicker">KIT-URB-35</p>
          <h2>Kit urbano</h2>
        </div>
        <div className="unit-card__flags">
          <span className="unit-flag">Nominal</span>
          <span className="unit-flag">Simulação local</span>
        </div>
      </div>
      <MetricList reading={telemetry} />
    </article>
  )
}

function MetricList({ reading }: { reading: UnitTelemetry }) {
  return (
    <dl className="unit-metrics">
      <div>
        <dt>Pressão</dt>
        <dd>{formatDecimal(reading.pressureMbar)} mbar</dd>
      </div>
      <div>
        <dt>Temperatura</dt>
        <dd>{formatDecimal(reading.temperatureC)} °C</dd>
      </div>
      <div>
        <dt>Tanque pulmão</dt>
        <dd>{formatInt(reading.bufferLevelPct)}%</dd>
      </div>
      <div>
        <dt>Vazão</dt>
        <dd>{formatDecimal(reading.flowM3PerDay)} m³/dia</dd>
      </div>
      <div>
        <dt>Filtro H₂S</dt>
        <dd>{reading.filterOk ? 'Operando' : 'Em atenção'}</dd>
      </div>
      <div>
        <dt>Coleta</dt>
        <dd>{reading.collectionLabel}</dd>
      </div>
      <div>
        <dt>Orgânico no mês</dt>
        <dd>{formatInt(reading.monthlyOrganicKg)} kg</dd>
      </div>
      <div>
        <dt>Biofertilizante no mês</dt>
        <dd>{formatInt(reading.monthlyBiofertL)} L</dd>
      </div>
    </dl>
  )
}

function ReadingList({ readings }: { readings: UnitReading[] }) {
  if (readings.length === 0) return <p className="app-empty">Ainda não há leitura lançada.</p>
  return (
    <ul className="reading-list">
      {readings.map((reading) => (
        <li key={reading.id}>
          <time dateTime={reading.createdAt ?? undefined}>{formatWhen(reading.createdAt)}</time>
          <span>{formatDecimal(reading.pressureMbar)} mbar</span>
          <span>{formatDecimal(reading.temperatureC)} °C</span>
          <span>{formatDecimal(reading.flowM3PerDay)} m³/dia</span>
        </li>
      ))}
    </ul>
  )
}

function formatWhen(iso: string | null): string {
  if (!iso) return 'Agora'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'Agora'
  return whenFormat.format(date)
}
