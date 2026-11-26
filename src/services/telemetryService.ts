import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from 'firebase/firestore'
import { getFirestoreDb } from '../lib/firebase'

export const TELEMETRY_COLLECTION = 'telemetry_units'
export const DEMO_UNIT_ID = 'KIT-URB-35'

export type TelemetrySource = 'firestore' | 'simulation'
export type TelemetryStatus = 'nominal' | 'alert'

export interface UnitTelemetry {
  pressureMbar: number
  temperatureC: number
  bufferLevelPct: number
  flowM3PerDay: number
  filterOk: boolean
  monthlyOrganicKg: number
  monthlyBiofertL: number
  collectionLabel: string
  status: TelemetryStatus
}

export interface TelemetryView extends UnitTelemetry {
  source: TelemetrySource
  series: number[]
}

const INITIAL_SERIES = [3.9, 4.1, 4.3, 4.2, 4.5, 4.7, 4.6, 4.8, 4.7, 4.9, 4.6, 4.7, 4.8, 4.6, 4.5, 4.7, 4.9, 4.8]

function asNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function asString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value : fallback
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

export function readUnitTelemetry(data: Record<string, unknown>): UnitTelemetry {
  const monthlyOrganicKg = asNumber(data.monthlyOrganicKg, 1050)
  return {
    pressureMbar: asNumber(data.pressureMbar, 18.4),
    temperatureC: asNumber(data.temperatureC, 35.6),
    bufferLevelPct: asNumber(data.bufferLevelPct, 62),
    flowM3PerDay: asNumber(data.flowM3PerDay, 4.6),
    filterOk: asBoolean(data.filterOk, true),
    monthlyOrganicKg,
    monthlyBiofertL: asNumber(data.monthlyBiofertL, Math.round(monthlyOrganicKg * 2.5)),
    collectionLabel: asString(data.collectionLabel, 'Coleta: Qui 08h'),
    status: data.status === 'alert' ? 'alert' : 'nominal',
  }
}

export function createInitialTelemetry(): TelemetryView {
  return {
    source: 'simulation',
    pressureMbar: 18.4,
    temperatureC: 35.6,
    bufferLevelPct: 62,
    flowM3PerDay: 4.6,
    filterOk: true,
    monthlyOrganicKg: 1050,
    monthlyBiofertL: 2625,
    collectionLabel: 'Coleta: Qui 08h',
    status: 'nominal',
    series: [...INITIAL_SERIES],
  }
}

export interface TelemetryFeedOptions {
  isAlertPreview: () => boolean
  onUpdate: (view: TelemetryView) => void
}

function pushSeries(series: number[], next: number): number[] {
  return [...series.slice(1), next]
}

function simulatedReading(alert: boolean, guestKg: number): UnitTelemetry {
  return {
    pressureMbar: alert ? 14.8 + (Math.random() - 0.5) * 0.4 : 18.4 + (Math.random() - 0.5) * 0.5,
    temperatureC: alert ? 29.4 + (Math.random() - 0.5) * 0.3 : 35.6 + (Math.random() - 0.5) * 0.3,
    bufferLevelPct: alert ? 89 : 62 + Math.floor(Math.random() * 2),
    flowM3PerDay: alert ? 3.5 + Math.random() * 0.35 : 4.45 + Math.random() * 0.45,
    filterOk: true,
    monthlyOrganicKg: guestKg,
    monthlyBiofertL: Math.round(guestKg * 2.5),
    collectionLabel: 'Coleta: Qui 08h',
    status: 'nominal',
  }
}

/**
 * Assina telemetry_units/KIT-URB-35. Sem credenciais, sem documento ou
 * offline, mantém a simulação local animada e devolve o unsubscribe.
 */
export function startTelemetryFeed(options: TelemetryFeedOptions): () => void {
  let active = true
  let mode: TelemetrySource = 'simulation'
  let series = [...INITIAL_SERIES]
  let guestKg = 1050
  let intervalId = 0

  const publish = (reading: UnitTelemetry, source: TelemetrySource) => {
    if (!active) return
    options.onUpdate({
      ...reading,
      source,
      series: [...series],
    })
  }

  const tickSimulation = () => {
    if (!active || mode !== 'simulation') return
    guestKg += 2
    const reading = simulatedReading(options.isAlertPreview(), guestKg)
    series = pushSeries(series, reading.flowM3PerDay)
    publish(reading, 'simulation')
  }

  const startSimulation = () => {
    mode = 'simulation'
    if (intervalId) return
    intervalId = window.setInterval(tickSimulation, 2200)
  }

  const stopSimulation = () => {
    window.clearInterval(intervalId)
    intervalId = 0
  }

  publish(createInitialTelemetry(), 'simulation')
  startSimulation()

  const db = getFirestoreDb()
  if (!db) {
    return () => {
      active = false
      stopSimulation()
    }
  }

  const unsubscribe = onSnapshot(
    doc(db, TELEMETRY_COLLECTION, DEMO_UNIT_ID),
    (snapshot) => {
      if (!active) return
      if (!snapshot.exists()) {
        if (mode !== 'simulation') startSimulation()
        return
      }

      mode = 'firestore'
      stopSimulation()
      const reading = readUnitTelemetry(snapshot.data() as Record<string, unknown>)
      series = pushSeries(series, reading.flowM3PerDay)
      publish(reading, 'firestore')
    },
    () => {
      if (!active) return
      if (mode !== 'simulation') startSimulation()
    },
  )

  return () => {
    active = false
    stopSimulation()
    unsubscribe()
  }
}

const LOCAL_UNITS_KEY = 'gaseificou.units.v1'
const READING_LIMIT = 12

export interface StoredUnit extends UnitTelemetry {
  id: string
  name: string
  updatedAt: string | null
  source: 'firestore' | 'local'
}

export interface UnitReading extends UnitTelemetry {
  id: string
  createdAt: string | null
}

export interface NewUnitInput {
  id: string
  name: string
  reading: UnitTelemetry
}

interface LocalUnit extends StoredUnit {
  readings: UnitReading[]
}

export function normalizeUnitId(value: string): string {
  return value.trim().toUpperCase()
}

export function isValidUnitId(value: string): boolean {
  return /^[A-Z0-9][A-Z0-9-]{1,30}$/.test(value)
}

export type UnitWatch =
  | { state: 'ready', unit: StoredUnit }
  | { state: 'missing' }
  | { state: 'error', message: string }

export function watchUnit(unitId: string, onUpdate: (result: UnitWatch) => void): () => void {
  const id = normalizeUnitId(unitId)
  if (!isValidUnitId(id)) {
    onUpdate({ state: 'missing' })
    return () => {}
  }

  const db = getFirestoreDb()
  if (!db) {
    const unit = readLocalUnits().find((item) => item.id === id)
    onUpdate(unit ? { state: 'ready', unit: withoutReadings(unit) } : { state: 'missing' })
    return () => {}
  }

  return onSnapshot(
    doc(db, TELEMETRY_COLLECTION, id),
    (snapshot) => {
      if (!snapshot.exists()) {
        onUpdate({ state: 'missing' })
        return
      }
      onUpdate({
        state: 'ready',
        unit: toStoredUnit(snapshot.id, snapshot.data() as Record<string, unknown>, 'firestore'),
      })
    },
    (error) => {
      onUpdate({ state: 'error', message: publicUnitErrorMessage(error) })
    },
  )
}

export async function listUnits(): Promise<StoredUnit[]> {
  const db = getFirestoreDb()
  if (!db) return readLocalUnits().map(withoutReadings).sort(byUnitId)

  const snapshot = await getDocs(collection(db, TELEMETRY_COLLECTION))
  return snapshot.docs
    .map((docSnap) => toStoredUnit(docSnap.id, docSnap.data() as Record<string, unknown>, 'firestore'))
    .sort(byUnitId)
}

export async function listReadings(unitId: string): Promise<UnitReading[]> {
  const db = getFirestoreDb()
  if (!db) {
    const unit = readLocalUnits().find((item) => item.id === unitId)
    return unit ? [...unit.readings].sort(byNewestReading).slice(0, READING_LIMIT) : []
  }

  const snapshot = await getDocs(query(
    collection(db, TELEMETRY_COLLECTION, unitId, 'readings'),
    orderBy('createdAt', 'desc'),
    limit(READING_LIMIT),
  ))
  return snapshot.docs.map((docSnap) => toReading(docSnap.id, docSnap.data() as Record<string, unknown>))
}

export async function createUnit(input: NewUnitInput): Promise<void> {
  const id = normalizeUnitId(input.id)
  const name = input.name.trim()
  assertUnitIdentity(id, name)
  assertReading(input.reading)

  const db = getFirestoreDb()
  if (!db) {
    const units = readLocalUnits()
    if (units.some((unit) => unit.id === id)) throw new Error('UNIT_EXISTS')
    const now = new Date().toISOString()
    units.push({
      id,
      name,
      ...input.reading,
      updatedAt: now,
      source: 'local',
      readings: [{ id: `local-${crypto.randomUUID()}`, ...input.reading, createdAt: now }],
    })
    writeLocalUnits(units)
    return
  }

  const unitRef = doc(db, TELEMETRY_COLLECTION, id)
  const existing = await getDoc(unitRef)
  if (existing.exists()) throw new Error('UNIT_EXISTS')

  const batch = writeBatch(db)
  batch.set(unitRef, unitPayload(name, input.reading))
  batch.set(doc(collection(unitRef, 'readings')), readingPayload(input.reading))
  await batch.commit()
}

export async function addReading(unitId: string, name: string, reading: UnitTelemetry): Promise<void> {
  const id = normalizeUnitId(unitId)
  assertUnitIdentity(id, name.trim())
  assertReading(reading)

  const db = getFirestoreDb()
  if (!db) {
    const units = readLocalUnits()
    const unit = units.find((item) => item.id === id)
    if (!unit) throw new Error('UNIT_MISSING')
    const now = new Date().toISOString()
    unit.readings.push({ id: `local-${crypto.randomUUID()}`, ...reading, createdAt: now })
    Object.assign(unit, reading, { name: name.trim(), updatedAt: now })
    writeLocalUnits(units)
    return
  }

  const unitRef = doc(db, TELEMETRY_COLLECTION, id)
  const batch = writeBatch(db)
  batch.set(doc(collection(unitRef, 'readings')), readingPayload(reading))
  batch.update(unitRef, { ...reading, name: name.trim(), updatedAt: serverTimestamp() })
  await batch.commit()
}

function publicUnitErrorMessage(error: unknown): string {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : ''
  if (code === 'permission-denied' || code.endsWith('/permission-denied')) {
    return 'A leitura pública desta unidade ainda não está liberada. Publique as regras do Firestore.'
  }
  return 'Não foi possível abrir esta unidade.'
}

export function telemetryWriteErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message === 'UNIT_EXISTS') {
    return 'Já existe uma unidade com esse identificador.'
  }
  if (error instanceof Error && error.message === 'UNIT_MISSING') {
    return 'Essa unidade não está mais na lista. Atualize a página.'
  }
  if (error instanceof Error && error.message === 'INVALID_UNIT') {
    return 'Revise o identificador, o nome e os números da leitura.'
  }
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : ''
  if (code === 'permission-denied' || code.endsWith('/permission-denied')) {
    return 'A gravação de unidades ainda não está liberada para quem entrou. Publique as regras do Firestore.'
  }
  return 'Não foi possível gravar. Tente de novo.'
}

function unitPayload(name: string, reading: UnitTelemetry) {
  return {
    name,
    ...reading,
    updatedAt: serverTimestamp(),
  }
}

function readingPayload(reading: UnitTelemetry) {
  return {
    ...reading,
    createdAt: serverTimestamp(),
  }
}

function assertUnitIdentity(id: string, name: string): void {
  if (!isValidUnitId(id) || name.length < 2 || name.length > 80) throw new Error('INVALID_UNIT')
}

function assertReading(reading: UnitTelemetry): void {
  const ok = inRange(reading.pressureMbar, 0, 200)
    && inRange(reading.temperatureC, 0, 80)
    && inRange(reading.bufferLevelPct, 0, 100)
    && inRange(reading.flowM3PerDay, 0, 100)
    && inRange(reading.monthlyOrganicKg, 0, 1_000_000)
    && inRange(reading.monthlyBiofertL, 0, 1_000_000)
    && reading.collectionLabel.trim().length >= 2
    && reading.collectionLabel.trim().length <= 80
    && (reading.status === 'nominal' || reading.status === 'alert')
    && typeof reading.filterOk === 'boolean'
  if (!ok) throw new Error('INVALID_UNIT')
}

function inRange(value: number, min: number, max: number): boolean {
  return Number.isFinite(value) && value >= min && value <= max
}

function toStoredUnit(id: string, data: Record<string, unknown>, source: StoredUnit['source']): StoredUnit {
  return {
    id,
    name: asString(data.name, 'Kit urbano'),
    ...readUnitTelemetry(data),
    updatedAt: timestampIso(data.updatedAt),
    source,
  }
}

function toReading(id: string, data: Record<string, unknown>): UnitReading {
  return {
    id,
    ...readUnitTelemetry(data),
    createdAt: timestampIso(data.createdAt),
  }
}

function timestampIso(value: unknown): string | null {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (typeof value === 'string') return value
  return null
}

function withoutReadings(unit: LocalUnit): StoredUnit {
  return {
    id: unit.id,
    name: unit.name,
    pressureMbar: unit.pressureMbar,
    temperatureC: unit.temperatureC,
    bufferLevelPct: unit.bufferLevelPct,
    flowM3PerDay: unit.flowM3PerDay,
    filterOk: unit.filterOk,
    monthlyOrganicKg: unit.monthlyOrganicKg,
    monthlyBiofertL: unit.monthlyBiofertL,
    collectionLabel: unit.collectionLabel,
    status: unit.status,
    updatedAt: unit.updatedAt,
    source: 'local',
  }
}

function byUnitId(a: StoredUnit, b: StoredUnit): number {
  return a.id.localeCompare(b.id, 'pt-BR')
}

function byNewestReading(a: UnitReading, b: UnitReading): number {
  const aTime = a.createdAt ? Date.parse(a.createdAt) : 0
  const bTime = b.createdAt ? Date.parse(b.createdAt) : 0
  return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime)
}

function readLocalUnits(): LocalUnit[] {
  try {
    const raw = localStorage.getItem(LOCAL_UNITS_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.flatMap((item) => {
      if (!isRecord(item) || typeof item.id !== 'string' || typeof item.name !== 'string') return []
      const readings = Array.isArray(item.readings)
        ? item.readings.flatMap((reading) => {
          if (!isRecord(reading) || typeof reading.id !== 'string') return []
          return [{ id: reading.id, ...readUnitTelemetry(reading), createdAt: timestampIso(reading.createdAt) }]
        })
        : []
      return [{
        ...toStoredUnit(item.id, item, 'local'),
        name: item.name,
        readings,
      }]
    })
  } catch (error) {
    console.warn('[Gaseificou] Não foi possível ler as unidades deste navegador.', error)
    return []
  }
}

function writeLocalUnits(units: LocalUnit[]): void {
  localStorage.setItem(LOCAL_UNITS_KEY, JSON.stringify(units))
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
