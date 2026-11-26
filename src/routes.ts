export const routes = {
  home: '/',
  login: '/entrar',
  register: '/criar-conta',
  app: '/app',
  appDiagnostics: '/app/diagnosticos',
  appUnits: '/app/unidades',
} as const

export function diagnosticPath(id: string): string {
  return `${routes.appDiagnostics}/${encodeURIComponent(id)}`
}

export function unitPath(id: string): string {
  return `${routes.appUnits}/${encodeURIComponent(id)}`
}

export function hotelUnit(id: string): string {
  return `/cliente/${encodeURIComponent(id)}`
}
