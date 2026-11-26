import { useState, type FormEvent } from 'react'
import type { StoredUnit, UnitTelemetry, TelemetryStatus } from '../../services/telemetryService'
import { isValidUnitId, normalizeUnitId } from '../../services/telemetryService'

export interface ReadingDraft {
  pressureMbar: string
  temperatureC: string
  bufferLevelPct: string
  flowM3PerDay: string
  filterOk: 'yes' | 'no'
  collectionLabel: string
  monthlyOrganicKg: string
  monthlyBiofertL: string
  status: TelemetryStatus
}

const EMPTY_READING: ReadingDraft = {
  pressureMbar: '18,4',
  temperatureC: '35,6',
  bufferLevelPct: '62',
  flowM3PerDay: '4,6',
  filterOk: 'yes',
  collectionLabel: 'Coleta: Qui 08h',
  monthlyOrganicKg: '1050',
  monthlyBiofertL: '2625',
  status: 'nominal',
}

export function draftFromUnit(unit: StoredUnit): ReadingDraft {
  return {
    pressureMbar: String(unit.pressureMbar).replace('.', ','),
    temperatureC: String(unit.temperatureC).replace('.', ','),
    bufferLevelPct: String(unit.bufferLevelPct).replace('.', ','),
    flowM3PerDay: String(unit.flowM3PerDay).replace('.', ','),
    filterOk: unit.filterOk ? 'yes' : 'no',
    collectionLabel: unit.collectionLabel,
    monthlyOrganicKg: String(unit.monthlyOrganicKg).replace('.', ','),
    monthlyBiofertL: String(unit.monthlyBiofertL).replace('.', ','),
    status: unit.status,
  }
}

export function NewUnitForm({
  busy,
  onSubmit,
}: {
  busy: boolean
  onSubmit: (input: { id: string, name: string, reading: UnitTelemetry }) => Promise<void>
}) {
  const [id, setId] = useState('KIT-URB-42')
  const [name, setName] = useState('Kit urbano')
  const [draft, setDraft] = useState<ReadingDraft>(EMPTY_READING)
  const [formError, setFormError] = useState('')

  async function submit(event: FormEvent) {
    event.preventDefault()
    const unitId = normalizeUnitId(id)
    const reading = readingFromDraft(draft)
    if (!isValidUnitId(unitId) || name.trim().length < 2 || !reading) {
      setFormError('Use um identificador como KIT-URB-42, um nome e números dentro da faixa.')
      return
    }
    setFormError('')
    await onSubmit({ id: unitId, name: name.trim(), reading })
  }

  return (
    <form className="unit-form" onSubmit={(event) => void submit(event)}>
      <h2>Nova unidade</h2>
      <div className="unit-form__grid">
        <Field prefix="nova" label="Identificador" value={id} onChange={setId} />
        <Field prefix="nova" label="Nome" value={name} onChange={setName} />
        <ReadingFields prefix="nova" draft={draft} onChange={setDraft} />
      </div>
      {formError ? <p className="app-banner" role="alert">{formError}</p> : null}
      <button className="btn btn--primary btn--sm" type="submit" disabled={busy}>
        {busy ? 'Salvando...' : 'Cadastrar unidade'}
      </button>
    </form>
  )
}

export function NewReadingForm({
  busy,
  initial,
  onSubmit,
}: {
  busy: boolean
  initial: ReadingDraft
  onSubmit: (reading: UnitTelemetry) => Promise<void>
}) {
  const [draft, setDraft] = useState(initial)
  const [formError, setFormError] = useState('')

  async function submit(event: FormEvent) {
    event.preventDefault()
    const reading = readingFromDraft(draft)
    if (!reading) {
      setFormError('Revise os números. O tanque fica entre 0 e 100.')
      return
    }
    setFormError('')
    await onSubmit(reading)
  }

  return (
    <form className="unit-form" onSubmit={(event) => void submit(event)}>
      <h2>Nova leitura</h2>
      <div className="unit-form__grid">
        <ReadingFields prefix="leitura" draft={draft} onChange={setDraft} />
      </div>
      {formError ? <p className="app-banner" role="alert">{formError}</p> : null}
      <button className="btn btn--primary btn--sm" type="submit" disabled={busy}>
        {busy ? 'Salvando...' : 'Lançar leitura'}
      </button>
    </form>
  )
}

function ReadingFields({
  prefix,
  draft,
  onChange,
}: {
  prefix: string
  draft: ReadingDraft
  onChange: (draft: ReadingDraft) => void
}) {
  function set<K extends keyof ReadingDraft>(key: K, value: ReadingDraft[K]) {
    onChange({ ...draft, [key]: value })
  }

  return (
    <>
      <Field prefix={prefix} label="Pressão (mbar)" value={draft.pressureMbar} onChange={(value) => set('pressureMbar', value)} />
      <Field prefix={prefix} label="Temperatura (°C)" value={draft.temperatureC} onChange={(value) => set('temperatureC', value)} />
      <Field prefix={prefix} label="Tanque pulmão (%)" value={draft.bufferLevelPct} onChange={(value) => set('bufferLevelPct', value)} />
      <Field prefix={prefix} label="Vazão (m³/dia)" value={draft.flowM3PerDay} onChange={(value) => set('flowM3PerDay', value)} />
      <label className="field" htmlFor={`${prefix}-filtro`}>
        Filtro H₂S
        <select id={`${prefix}-filtro`} value={draft.filterOk} onChange={(event) => set('filterOk', event.target.value === 'yes' ? 'yes' : 'no')}>
          <option value="yes">Operando</option>
          <option value="no">Em atenção</option>
        </select>
      </label>
      <Field prefix={prefix} label="Coleta" value={draft.collectionLabel} onChange={(value) => set('collectionLabel', value)} />
      <Field prefix={prefix} label="Orgânico no mês (kg)" value={draft.monthlyOrganicKg} onChange={(value) => set('monthlyOrganicKg', value)} />
      <Field prefix={prefix} label="Biofertilizante no mês (L)" value={draft.monthlyBiofertL} onChange={(value) => set('monthlyBiofertL', value)} />
      <label className="field" htmlFor={`${prefix}-status`}>
        Status
        <select id={`${prefix}-status`} value={draft.status} onChange={(event) => set('status', event.target.value === 'alert' ? 'alert' : 'nominal')}>
          <option value="nominal">Nominal</option>
          <option value="alert">Alerta</option>
        </select>
      </label>
    </>
  )
}

function Field({ prefix, label, value, onChange }: { prefix: string, label: string, value: string, onChange: (value: string) => void }) {
  const id = `${prefix}-${label.replace(/\s+/g, '-').toLowerCase()}`
  return (
    <label className="field" htmlFor={id}>
      {label}
      <input id={id} value={value} onChange={(event) => onChange(event.target.value)} required />
    </label>
  )
}

function readingFromDraft(draft: ReadingDraft): UnitTelemetry | null {
  const pressureMbar = readNumber(draft.pressureMbar)
  const temperatureC = readNumber(draft.temperatureC)
  const bufferLevelPct = readNumber(draft.bufferLevelPct)
  const flowM3PerDay = readNumber(draft.flowM3PerDay)
  const monthlyOrganicKg = readNumber(draft.monthlyOrganicKg)
  const monthlyBiofertL = readNumber(draft.monthlyBiofertL)
  if (
    pressureMbar === null || temperatureC === null || bufferLevelPct === null
    || flowM3PerDay === null || monthlyOrganicKg === null || monthlyBiofertL === null
  ) return null
  return {
    pressureMbar,
    temperatureC,
    bufferLevelPct,
    flowM3PerDay,
    filterOk: draft.filterOk === 'yes',
    collectionLabel: draft.collectionLabel.trim(),
    monthlyOrganicKg,
    monthlyBiofertL,
    status: draft.status,
  }
}

function readNumber(value: string): number | null {
  const parsed = Number(value.trim().replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : null
}
