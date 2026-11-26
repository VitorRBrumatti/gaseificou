import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatBrl, formatInt } from '../../data/roi'
import { diagnosticPath } from '../../routes'
import {
  diagnosticListErrorMessage,
  listDiagnostics,
  type ListedDiagnostic,
} from '../../services/diagnosticService'

const whenFormat = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

export function DiagnosticsPage() {
  const [rows, setRows] = useState<ListedDiagnostic[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    listDiagnostics()
      .then((list) => {
        if (active) setRows(list)
      })
      .catch((cause: unknown) => {
        if (!active) return
        setError(diagnosticListErrorMessage(cause))
        setRows([])
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <section className="app-page">
      <header className="app-page__head">
        <h1>Diagnósticos</h1>
        <p>Pré-diagnósticos enviados pelo formulário do site, do mais recente para o mais antigo.</p>
      </header>

      {rows === null ? <p className="app-empty">Carregando diagnósticos...</p> : null}
      {error ? <p className="app-banner" role="alert">{error}</p> : null}

      {rows && rows.length === 0 && !error ? (
        <p className="app-empty">Ainda não há pré-diagnóstico.</p>
      ) : null}

      {rows && rows.length > 0 ? (
        <ul className="lead-list">
          {rows.map((lead) => (
            <li key={lead.id}>
              <Link className="lead-card" to={diagnosticPath(lead.id)}>
              <div className="lead-card__title">
                <h2>{lead.hotelName}</h2>
                <time dateTime={lead.createdAt ?? undefined}>{formatWhen(lead.createdAt)}</time>
              </div>
              <dl>
                <div>
                  <dt>Cidade</dt>
                  <dd>{lead.cityUf}</dd>
                </div>
                <div>
                  <dt>Volume</dt>
                  <dd>{formatInt(lead.volumeKgDay)} kg/dia</dd>
                </div>
                <div>
                  <dt>Espaço</dt>
                  <dd>{lead.spaceProfile}</dd>
                </div>
                <div>
                  <dt>GLP / mês</dt>
                  <dd>{formatBrl(lead.estimatedMonthlyGlpBrl)}</dd>
                </div>
                <div>
                  <dt>Biofertilizante</dt>
                  <dd>{formatInt(lead.estimatedWeeklyBiofertL)} L/semana</dd>
                </div>
                <div>
                  <dt>Contato</dt>
                  <dd>{lead.contactInfo}</dd>
                </div>
              </dl>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}

function formatWhen(iso: string | null): string {
  if (!iso) return 'Sem data'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'Sem data'
  return whenFormat.format(date)
}
