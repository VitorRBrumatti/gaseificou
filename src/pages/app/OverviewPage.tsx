import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatBrl, formatInt } from '../../data/roi'
import { diagnosticPath, unitPath } from '../../routes'
import { diagnosticListErrorMessage, listDiagnostics, type ListedDiagnostic } from '../../services/diagnosticService'
import { listUnits, telemetryWriteErrorMessage, type StoredUnit } from '../../services/telemetryService'

export function OverviewPage() {
  const [leads, setLeads] = useState<ListedDiagnostic[] | null>(null)
  const [units, setUnits] = useState<StoredUnit[] | null>(null)
  const [leadError, setLeadError] = useState('')
  const [unitError, setUnitError] = useState('')

  useEffect(() => {
    let active = true
    listDiagnostics()
      .then((next) => {
        if (active) setLeads(next)
      })
      .catch((cause: unknown) => {
        if (!active) return
        setLeadError(diagnosticListErrorMessage(cause))
        setLeads([])
      })
    listUnits()
      .then((next) => {
        if (active) setUnits(next)
      })
      .catch((cause: unknown) => {
        if (!active) return
        setUnitError(telemetryWriteErrorMessage(cause))
        setUnits([])
      })
    return () => {
      active = false
    }
  }, [])

  const loading = leads === null || units === null
  const alerts = units?.filter((unit) => unit.status === 'alert').length ?? 0

  return (
    <section className="app-page">
      <header className="app-page__head">
        <h1>Visão geral</h1>
        <p>Pré-diagnósticos recebidos e o estado atual dos kits em operação.</p>
      </header>

      {loading ? <p className="app-empty">Carregando o painel...</p> : null}
      {leadError ? <p className="app-banner" role="alert">{leadError}</p> : null}
      {unitError ? <p className="app-banner" role="alert">{unitError}</p> : null}

      {leads && units ? (
        <>
          <ul className="overview-stats">
            <li>
              <span>Pré-diagnósticos</span>
              <strong>{formatInt(leads.length)}</strong>
            </li>
            <li>
              <span>Unidades</span>
              <strong>{formatInt(units.length)}</strong>
            </li>
            <li>
              <span>Em alerta</span>
              <strong>{formatInt(alerts)}</strong>
            </li>
          </ul>

          <div className="overview-grid">
            <section>
              <h2>Mais recentes</h2>
              {leads.length === 0 ? <p className="app-empty">Ainda não há pré-diagnóstico.</p> : null}
              {leads.length > 0 ? (
                <ul className="overview-list">
                  {leads.slice(0, 3).map((lead) => (
                    <li key={lead.id}>
                      <Link to={diagnosticPath(lead.id)}>
                        <strong>{lead.hotelName}</strong>
                        <span>{lead.cityUf} · {formatInt(lead.volumeKgDay)} kg/dia · {formatBrl(lead.estimatedMonthlyGlpBrl)}/mês</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>

            <section>
              <h2>Kits</h2>
              {units.length === 0 ? <p className="app-empty">Ainda não há unidade cadastrada.</p> : null}
              {units.length > 0 ? (
                <ul className="overview-list">
                  {units.map((unit) => (
                    <li key={unit.id}>
                      <Link to={unitPath(unit.id)}>
                        <strong>{unit.name}</strong>
                        <span>{unit.id}</span>
                        <em className={unit.status === 'alert' ? 'is-alert' : undefined}>
                          {unit.status === 'alert' ? 'Alerta' : 'Nominal'}
                        </em>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          </div>
        </>
      ) : null}
    </section>
  )
}
