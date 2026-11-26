import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  authErrorMessage,
  isGoogleAuthReady,
  registerWithEmail as registerWithEmailAccount,
  sendPasswordReset,
  signInWithEmail as signInWithEmailAccount,
  signInWithGoogle,
  signOutGoogle,
  subscribeAuth,
  type AuthFlow,
  type AuthUser,
} from '../services/authService'

interface AuthContextValue {
  user: AuthUser | null
  ready: boolean
  configured: boolean
  busy: boolean
  error: string
  signIn: () => Promise<boolean>
  signInWithEmail: (email: string, password: string) => Promise<boolean>
  registerWithEmail: (name: string, email: string, password: string) => Promise<boolean>
  resetPassword: (email: string) => Promise<boolean>
  signOut: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isGoogleAuthReady()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [ready, setReady] = useState(!configured)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!configured) return
    return subscribeAuth((next) => {
      setUser(next)
      setReady(true)
    })
  }, [configured])

  async function runAuth(flow: AuthFlow, action: () => Promise<unknown>): Promise<boolean> {
    setBusy(true)
    setError('')
    try {
      const result = await action()
      if (isAuthUser(result)) setUser(result)
      return true
    } catch (cause) {
      const message = authErrorMessage(cause, flow)
      if (message) setError(message)
      return false
    } finally {
      setBusy(false)
    }
  }

  const value = useMemo<AuthContextValue>(() => ({
    user,
    ready,
    configured,
    busy,
    error,
    signIn: () => runAuth('google', () => signInWithGoogle()),
    signInWithEmail: (email, password) => runAuth('email', () => signInWithEmailAccount(email, password)),
    registerWithEmail: (name, email, password) => runAuth('register', () => registerWithEmailAccount(name, email, password)),
    resetPassword: (email) => runAuth('reset', () => sendPasswordReset(email)),
    signOut: async () => {
      setBusy(true)
      setError('')
      try {
        await signOutGoogle()
        return true
      } catch (cause) {
        console.warn('[Gaseificou] Falha ao sair.', cause)
        setError('Não foi possível encerrar a sessão. Tente de novo.')
        return false
      } finally {
        setBusy(false)
      }
    },
  }), [user, ready, configured, busy, error])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function isAuthUser(value: unknown): value is AuthUser {
  return typeof value === 'object' && value !== null && 'uid' in value && typeof value.uid === 'string'
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth precisa estar dentro de AuthProvider.')
  return value
}
