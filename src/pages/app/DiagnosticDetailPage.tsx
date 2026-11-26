import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { formatBrl, formatInt, simulateRoi } from '../../data/roi'
import { routes } from '../../routes'
import {
  diagnosticListErrorMessage,
  getDiagnostic,
  type ListedDiagnostic,
} from '../../services/diagnosticService'

const whenFormat = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

export function DiagnosticDetailPage() {
  const { diagnosticId = '' } = useParams()
  const [lead, setLead] = useState<ListedDiagnostic | null | undefined>(undefined)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLead(undefined)
    setError('')
    getDiagnostic(diagnosticId)
      .then((found) => {
        if (active) setLead(found)
      })
      .catch((cause: unknown) => {
        if (!active) return
        setError(diagnosticListErrorMessage(cause))
        setLead(null)
      })
    return () => {
      active = false
    }
  }, [diagnosticId])

  return (
    <section className="app-page">
      <Link className="app-back" to={routes.appDiagnostics}>Voltar aos diagnósticos</Link>

      {lead === undefined ? <p className="app-empty">Carregando diagnóstico...</p> : null}
      {error ? <p className="app-banner" role="alert">{error}</p> : null}

      {lead === null && !error ? (
        <p className="app-empty">Esse pré-diagnóstico não está na lista.</p>
      ) : null}

      {lead ? <DiagnosticSheet lead={lead} /> : null}
    </section>
  )
}

function DiagnosticSheet({ lead }: { lead: ListedDiagnostic }) {
  const roi = simulateRoi(lead.volumeKgDay)

  return (
    <>
      <header className="app-page__head">
        <h1>{lead.hotelName}</h1>
        <p>{lead.cityUf} · {formatWhen(lead.createdAt)}</p>
      </header>

      <dl className="detail-metrics">
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

      <h2 className="detail-title">Retorno estimado</h2>
      <dl className="detail-metrics">
        <div>
          <dt>GLP bruto</dt>
          <dd>{formatBrl(roi.monthlyGross)}/mês</dd>
        </div>
        <div>
          <dt>OPEX</dt>
          <dd>{formatBrl(roi.opex)}/mês</dd>
        </div>
        <div>
          <dt>Saldo</dt>
          <dd>{formatBrl(roi.netMonthly)}/mês</dd>
        </div>
        <div>
          <dt>CAPEX</dt>
          <dd>{formatBrl(roi.capex)}</dd>
        </div>
        <div>
          <dt>Payback</dt>
          <dd>{roi.paybackLabel}</dd>
        </div>
      </dl>
    </>
  )
}

function formatWhen(iso: string | null): string {
  if (!iso) return 'Sem data'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'Sem data'
  return whenFormat.format(date)
}
