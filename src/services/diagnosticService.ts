import { addDoc, collection, doc, getDoc, getDocs, serverTimestamp, Timestamp } from 'firebase/firestore'
import { getFirestoreDb } from '../lib/firebase'

export const DIAGNOSTICS_COLLECTION = 'diagnostics'
const LOCAL_STORAGE_KEY = 'gaseificou.diagnostics.v1'
const LOCAL_STORAGE_LIMIT = 50

export interface DiagnosticLead {
  hotelName: string
  volumeKgDay: number
  spaceProfile: string
  cityUf: string
  contactInfo: string
  estimatedMonthlyGlpBrl: number
  estimatedWeeklyBiofertL: number
}

export interface SaveDiagnosticResult {
  id: string
  storage: 'firestore' | 'local'
}

export interface ListedDiagnostic extends DiagnosticLead {
  id: string
  createdAt: string | null
  storage: 'firestore' | 'local'
}

interface StoredDiagnostic extends DiagnosticLead {
  id: string
  createdAt: string
}

function readStoredDiagnostics(): StoredDiagnostic[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.flatMap((item) => {
      const lead = readLead(item)
      if (!lead || !isRecord(item) || typeof item.id !== 'string' || typeof item.createdAt !== 'string') return []
      return [{ ...lead, id: item.id, createdAt: item.createdAt }]
    })
  } catch (error) {
    console.warn('[Gaseificou] Não foi possível ler os diagnósticos deste navegador.', error)
    return []
  }
}

function saveLocally(lead: DiagnosticLead): SaveDiagnosticResult {
  const id = `local-${crypto.randomUUID()}`
  const entry: StoredDiagnostic = {
    ...lead,
    id,
    createdAt: new Date().toISOString(),
  }

  try {
    const current = readStoredDiagnostics()
    current.push(entry)
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current.slice(-LOCAL_STORAGE_LIMIT)))
  } catch (error) {
    console.warn('[Gaseificou] Não foi possível gravar o diagnóstico neste navegador.', error)
    throw new Error('LOCAL_STORAGE_FAILED')
  }

  return { id, storage: 'local' }
}

export async function saveDiagnostic(lead: DiagnosticLead): Promise<SaveDiagnosticResult> {
  const db = getFirestoreDb()
  if (!db) return saveLocally(lead)

  const ref = await addDoc(collection(db, DIAGNOSTICS_COLLECTION), {
    hotelName: lead.hotelName,
    volumeKgDay: lead.volumeKgDay,
    spaceProfile: lead.spaceProfile,
    cityUf: lead.cityUf,
    contactInfo: lead.contactInfo,
    estimatedMonthlyGlpBrl: lead.estimatedMonthlyGlpBrl,
    estimatedWeeklyBiofertL: lead.estimatedWeeklyBiofertL,
    createdAt: serverTimestamp(),
  })

  return { id: ref.id, storage: 'firestore' }
}

export async function getDiagnostic(id: string): Promise<ListedDiagnostic | null> {
  const db = getFirestoreDb()
  if (!db) {
    const entry = readStoredDiagnostics().find((item) => item.id === id)
    return entry ? { ...entry, storage: 'local' } : null
  }

  const snapshot = await getDoc(doc(db, DIAGNOSTICS_COLLECTION, id))
  if (!snapshot.exists()) return null
  const lead = readLead(snapshot.data())
  if (!lead) return null
  return {
    ...lead,
    id: snapshot.id,
    createdAt: createdAtIso(snapshot.data().createdAt),
    storage: 'firestore',
  }
}

export async function listDiagnostics(): Promise<ListedDiagnostic[]> {
  const db = getFirestoreDb()
  if (!db) {
    return readStoredDiagnostics()
      .map((entry) => ({ ...entry, storage: 'local' as const }))
      .sort(byNewest)
  }

  const snapshot = await getDocs(collection(db, DIAGNOSTICS_COLLECTION))
  return snapshot.docs.flatMap((docSnap) => {
    const lead = readLead(docSnap.data())
    if (!lead) return []
    return [{
      ...lead,
      id: docSnap.id,
      createdAt: createdAtIso(docSnap.data().createdAt),
      storage: 'firestore' as const,
    }]
  }).sort(byNewest)
}

export function diagnosticListErrorMessage(error: unknown): string {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : ''
  if (code === 'permission-denied' || code.endsWith('/permission-denied')) {
    return 'A leitura dos diagnósticos ainda não está liberada para quem entrou com Google. Publique as regras do Firestore.'
  }
  return 'Não foi possível carregar os diagnósticos.'
}

function byNewest(a: ListedDiagnostic, b: ListedDiagnostic): number {
  const aTime = a.createdAt ? Date.parse(a.createdAt) : 0
  const bTime = b.createdAt ? Date.parse(b.createdAt) : 0
  return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime)
}

function createdAtIso(value: unknown): string | null {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  return null
}

function readLead(value: unknown): DiagnosticLead | null {
  if (!isRecord(value)) return null
  if (typeof value.hotelName !== 'string') return null
  if (typeof value.volumeKgDay !== 'number' || !Number.isFinite(value.volumeKgDay)) return null
  if (typeof value.spaceProfile !== 'string') return null
  if (typeof value.cityUf !== 'string') return null
  if (typeof value.contactInfo !== 'string') return null
  if (typeof value.estimatedMonthlyGlpBrl !== 'number' || !Number.isFinite(value.estimatedMonthlyGlpBrl)) return null
  if (typeof value.estimatedWeeklyBiofertL !== 'number' || !Number.isFinite(value.estimatedWeeklyBiofertL)) return null
  return {
    hotelName: value.hotelName,
    volumeKgDay: value.volumeKgDay,
    spaceProfile: value.spaceProfile,
    cityUf: value.cityUf,
    contactInfo: value.contactInfo,
    estimatedMonthlyGlpBrl: value.estimatedMonthlyGlpBrl,
    estimatedWeeklyBiofertL: value.estimatedWeeklyBiofertL,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
