import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { routes } from '../routes'
import { useAuth } from './AuthProvider'

export function authReturnPath(state: unknown): string {
  if (state && typeof state === 'object' && 'from' in state) {
    const from = (state as { from?: unknown }).from
    if (typeof from === 'string' && from.startsWith('/app')) return from
  }
  return routes.app
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation()
  const { user, ready } = useAuth()

  if (!ready) {
    return (
      <div className="app-gate">
        <p className="app-gate__status">Abrindo sessão...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <Navigate
        to={routes.login}
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    )
  }

  return children
}
