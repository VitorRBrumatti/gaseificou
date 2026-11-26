/**
 * Regras de negócio do simulador de ROI.
 * Calibradas nos pontos de referência da landing:
 * 10 kg = R$ 143 · 35 kg = R$ 502 · 50 kg = R$ 717 · 100 kg = R$ 1.433 · 200 kg = R$ 2.866
 */

export const GLP_BRL_PER_KG_DAY = 14.331
export const DIGESTATE_LITERS_PER_KG_DAY = 2.5
export const OPEX_UP_TO_100_BRL = 200
export const OPEX_ABOVE_100_BRL = 300
export const CAPEX_BASE_BRL = 22029
export const CAPEX_THRESHOLD_KG = 100
export const CAPEX_EXTRA_PER_KG_BRL = 180

const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
})

const intFmt = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
const decimalFmt = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 })

export function estimateMonthlyGlpBrl(kgPerDay: number): number {
  return Math.round(kgPerDay * GLP_BRL_PER_KG_DAY)
}

export function estimateDailyDigestateL(kgPerDay: number): number {
  return kgPerDay * DIGESTATE_LITERS_PER_KG_DAY
}

export function estimateWeeklyDigestateL(kgPerDay: number): number {
  return Math.floor(estimateDailyDigestateL(kgPerDay) * 7)
}

export function estimateOpexBrl(kgPerDay: number): number {
  return kgPerDay <= CAPEX_THRESHOLD_KG ? OPEX_UP_TO_100_BRL : OPEX_ABOVE_100_BRL
}

export function estimateCapexBrl(kgPerDay: number): number {
  if (kgPerDay <= CAPEX_THRESHOLD_KG) return CAPEX_BASE_BRL
  return CAPEX_BASE_BRL + (kgPerDay - CAPEX_THRESHOLD_KG) * CAPEX_EXTRA_PER_KG_BRL
}

export function estimateMonthlyDivertedKg(kgPerDay: number): number {
  return kgPerDay * 30
}

export type RoiBand = 'entry' | 'traction' | 'scale'

export function roiBand(kgPerDay: number): RoiBand {
  if (kgPerDay <= 35) return 'entry'
  if (kgPerDay <= 100) return 'traction'
  return 'scale'
}

export function formatBrl(value: number): string {
  return brl.format(value)
}

export function formatInt(value: number): string {
  return intFmt.format(value)
}

export function formatDecimal(value: number): string {
  return decimalFmt.format(value)
}

export interface RoiSnapshot {
  kg: number
  monthlyGross: number
  opex: number
  netMonthly: number
  capex: number
  dailyDigestateL: number
  weeklyDigestateL: number
  monthlyDivertedKg: number
  paybackLabel: string
  monthlyGrossLabel: string
  netSummary: string
  weeklyDigestateLabel: string
  dailyDigestateLabel: string
  divertedLabel: string
  band: RoiBand
  rangePercent: number
}

export function estimatePaybackLabel(kgPerDay: number): string {
  const netMonthly = estimateMonthlyGlpBrl(kgPerDay) - estimateOpexBrl(kgPerDay)
  if (netMonthly <= 0) return 'Projeto ESG / saneamento'
  const years = estimateCapexBrl(kgPerDay) / (netMonthly * 12)
  return `${years.toFixed(1).replace('.', ',')} anos`
}

export function simulateRoi(kgPerDay: number, rangeMin = 10, rangeMax = 240): RoiSnapshot {
  const monthlyGross = estimateMonthlyGlpBrl(kgPerDay)
  const opex = estimateOpexBrl(kgPerDay)
  const netMonthly = monthlyGross - opex
  const dailyDigestateL = estimateDailyDigestateL(kgPerDay)
  const weeklyDigestateL = estimateWeeklyDigestateL(kgPerDay)
  const monthlyDivertedKg = estimateMonthlyDivertedKg(kgPerDay)
  const capex = estimateCapexBrl(kgPerDay)

  const netSummary = netMonthly > 0
    ? `Saldo líquido: ~${formatBrl(netMonthly)}/mês (descontando ~${formatBrl(opex)} de OPEX)`
    : `Economia bruta de ${formatBrl(monthlyGross)}/mês · foco em saneamento e redução de coleta paga`

  return {
    kg: kgPerDay,
    monthlyGross,
    opex,
    netMonthly,
    capex,
    dailyDigestateL,
    weeklyDigestateL,
    monthlyDivertedKg,
    paybackLabel: estimatePaybackLabel(kgPerDay),
    monthlyGrossLabel: formatBrl(monthlyGross),
    netSummary,
    weeklyDigestateLabel: `${formatInt(weeklyDigestateL)} L`,
    dailyDigestateLabel: `${formatDecimal(dailyDigestateL)} L`,
    divertedLabel: `${formatInt(monthlyDivertedKg)} kg`,
    band: roiBand(kgPerDay),
    rangePercent: ((kgPerDay - rangeMin) / (rangeMax - rangeMin)) * 100,
  }
}

export interface RoiPreset {
  kg: number
  title: string
  detail: string
  pill: string
}

export const ROI_PRESETS: RoiPreset[] = [
  {
    kg: 35,
    title: 'Hotéis pequenos e pousadas',
    detail: '10 a 35 kg/dia · Porta de entrada e saneamento',
    pill: '35 kg/dia',
  },
  {
    kg: 50,
    title: 'Hotéis médios / c/ restaurante',
    detail: '50 a 100 kg/dia · Payback de 1,5 a 3,6 anos',
    pill: '50 kg/dia',
  },
  {
    kg: 100,
    title: 'Hotel médio de alto giro',
    detail: '100 kg/dia · Mesma estrutura periférica, retorno em 1,5 ano',
    pill: '100 kg/dia',
  },
  {
    kg: 200,
    title: 'Resorts e mini-hubs turísticos',
    detail: '200+ kg/dia · Alto volume ou unidade compartilhada',
    pill: '200 kg/dia',
  },
]

export interface GtmRow {
  profile: string
  badge?: string
  daily: string
  gross: string
  role: string
}

export const GTM_ROWS: GtmRow[] = [
  {
    profile: 'Hotéis pequenos e pousadas',
    daily: '10 a 35 kg/dia',
    gross: 'R$ 143 a R$ 502',
    role: 'Porta de entrada rápida e vitrine: venda direta para pousadas ecológicas (saneamento + marketing verde) ou hotéis urbanos que já pagam coleta privada de lixo.',
  },
  {
    profile: 'Hotéis médios / c/ restaurante',
    badge: 'TRAÇÃO',
    daily: '50 a 100 kg/dia',
    gross: 'R$ 717 a R$ 1.433',
    role: 'Ponto ideal de tração financeira: usa quase a mesma estrutura periférica do kit pequeno e leva o payback do cliente para 1,5 a 3,6 anos.',
  },
  {
    profile: 'Resorts e mini-hubs turísticos',
    daily: '200+ kg/dia',
    gross: 'Acima de R$ 2.866',
    role: 'Escala e contratos maiores: operação de alto volume (hotel grande ou 1 unidade atendendo pousadas vizinhas), abrindo margem futura para assinatura completa (EaaS).',
  },
]

export interface DiagnosticVolumeOption {
  kg: number
  label: string
}

export const DIAGNOSTIC_VOLUME_OPTIONS: DiagnosticVolumeOption[] = [
  { kg: 35, label: '10 a 35 kg/dia (Pequeno)' },
  { kg: 50, label: '50 a 100 kg/dia (Médio)' },
  { kg: 200, label: '200+ kg/dia (Resort / Hub)' },
]

export const ROI_RANGE = {
  min: 10,
  max: 240,
  step: 5,
  initial: 50,
} as const
