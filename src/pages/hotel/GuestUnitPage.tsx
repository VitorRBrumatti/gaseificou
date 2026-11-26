import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { formatDecimal, formatInt } from '../../data/roi'
import { routes } from '../../routes'
import { watchUnit, type StoredUnit, type UnitWatch } from '../../services/telemetryService'

export function GuestUnitPage() {
  const { unitId = '' } = useParams()
  const [watch, setWatch] = useState<UnitWatch | null>(null)

  useEffect(() => {
    setWatch(null)
    return watchUnit(unitId, setWatch)
  }, [unitId])

  return (
    <main className="guest-page">
      <header className="guest-page__top">
        <a className="app-brand" href={routes.home}>
          Gaseificou<span className="brand__accent">!</span>
        </a>
        <a className="guest-page__back" href={routes.home}>Voltar ao site</a>
      </header>

      {watch === null ? <p className="app-empty">Carregando unidade...</p> : null}
      {watch?.state === 'missing' ? (
        <p className="app-empty">Esta unidade não está publicada.</p>
      ) : null}
      {watch?.state === 'error' ? <p className="app-banner" role="alert">{watch.message}</p> : null}
      {watch?.state === 'ready' ? <GuestBoard unit={watch.unit} /> : null}
    </main>
  )
}

function GuestBoard({ unit }: { unit: StoredUnit }) {
  const alert = unit.status === 'alert'
  return (
    <article className={alert ? 'unit-card is-alert guest-board' : 'unit-card guest-board'}>
      <div className="unit-card__head">
        <div>
          <p className="app-kicker">{unit.id}</p>
          <h1>{unit.name}</h1>
        </div>
        <span className={alert ? 'unit-flag is-alert' : 'unit-flag'}>{alert ? 'Alerta' : 'Nominal'}</span>
      </div>
      <p className="guest-lead">
        As refeições deste hotel usam gás gerado dos próprios resíduos orgânicos da cozinha.
      </p>
      <p className={alert ? 'unit-status is-alert' : 'unit-status'} role="status">
        {alert
          ? 'Alerta preventivo: a última leitura saiu da faixa. A coleta pode ser antecipada antes de a operação parar.'
          : 'Operação estável. Pressão, temperatura interna e nível do tanque pulmão dentro da faixa da última leitura.'}
      </p>
      <dl className="unit-metrics">
        <div>
          <dt>Pressão</dt>
          <dd>{formatDecimal(unit.pressureMbar)} mbar</dd>
        </div>
        <div>
          <dt>Temperatura</dt>
          <dd>{formatDecimal(unit.temperatureC)} °C</dd>
        </div>
        <div>
          <dt>Tanque pulmão</dt>
          <dd>{formatInt(unit.bufferLevelPct)}%</dd>
        </div>
        <div>
          <dt>Vazão</dt>
          <dd>{formatDecimal(unit.flowM3PerDay)} m³/dia</dd>
        </div>
        <div>
          <dt>Filtro H₂S</dt>
          <dd>{unit.filterOk ? 'Operando' : 'Em atenção'}</dd>
        </div>
        <div>
          <dt>Orgânico no mês</dt>
          <dd>{formatInt(unit.monthlyOrganicKg)} kg</dd>
        </div>
        <div>
          <dt>Biofertilizante no mês</dt>
          <dd>{formatInt(unit.monthlyBiofertL)} L</dd>
        </div>
      </dl>
    </article>
  )
}
