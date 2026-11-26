import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { authReturnPath } from '../../auth/RequireAuth'
import { useAuth } from '../../auth/AuthProvider'
import { routes } from '../../routes'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, ready, configured, busy, error, signIn, signInWithEmail, resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')
  const next = authReturnPath(location.state)

  if (!ready) {
    return (
      <div className="app-gate">
        <p className="app-gate__status">Abrindo sessão...</p>
      </div>
    )
  }

  if (user) return <Navigate to={next} replace />

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError('')
    setNotice('')
    if (!email.includes('@') || password.length < 6) {
      setFormError('Informe um e-mail válido e uma senha com pelo menos 6 caracteres.')
      return
    }
    const ok = await signInWithEmail(email, password)
    if (ok) navigate(next, { replace: true })
  }

  async function onGoogle() {
    setFormError('')
    setNotice('')
    const ok = await signIn()
    if (ok) navigate(next, { replace: true })
  }

  async function onReset() {
    setFormError('')
    setNotice('')
    if (!email.includes('@')) {
      setFormError('Informe o e-mail para enviar o link de redefinição.')
      return
    }
    const ok = await resetPassword(email)
    if (ok) setNotice('Enviamos um link de redefinição para esse e-mail.')
  }

  return (
    <div className="app-gate">
      <p className="app-kicker">Gaseificou</p>
      <h1>Entrar</h1>
      <p>Use e-mail e senha ou a conta Google para abrir os diagnósticos.</p>
      {configured ? (
        <form className="auth-form" onSubmit={(event) => void onSubmit(event)}>
          <div className="field">
            <label htmlFor="login-email">E-mail</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="login-password">Senha</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={6}
              required
            />
          </div>
          <button className="btn btn--primary" type="submit" disabled={busy}>
            {busy ? 'Entrando...' : 'Entrar'}
          </button>
          <button className="btn btn--ghost" type="button" onClick={() => void onGoogle()} disabled={busy}>
            <GoogleMark />
            Entrar com Google
          </button>
          <button className="auth-text-btn" type="button" onClick={() => void onReset()} disabled={busy}>
            Esqueci a senha
          </button>
        </form>
      ) : (
        <p className="app-gate__status" role="status">O login ainda não está configurado neste ambiente.</p>
      )}
      {formError ? <p className="app-gate__error" role="alert">{formError}</p> : null}
      {error ? <p className="app-gate__error" role="alert">{error}</p> : null}
      {notice ? <p className="auth-note" role="status">{notice}</p> : null}
      <p className="auth-switch">
        Ainda não tem conta? <Link to={routes.register}>Criar conta</Link>
      </p>
      <a className="app-gate__back" href={routes.home}>Voltar ao site</a>
    </div>
  )
}

function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z" />
    </svg>
  )
}
