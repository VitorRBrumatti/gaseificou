import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthProvider'
import { routes } from '../../routes'

export function RegisterPage() {
  const navigate = useNavigate()
  const { user, ready, configured, busy, error, signIn, registerWithEmail } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [formError, setFormError] = useState('')

  if (!ready) {
    return (
      <div className="app-gate">
        <p className="app-gate__status">Abrindo sessão...</p>
      </div>
    )
  }

  if (user) return <Navigate to={routes.app} replace />

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError('')
    if (name.trim().length < 2) {
      setFormError('Informe o nome com pelo menos 2 caracteres.')
      return
    }
    if (!email.includes('@')) {
      setFormError('Informe um e-mail válido.')
      return
    }
    if (password.length < 6) {
      setFormError('A senha precisa ter pelo menos 6 caracteres.')
      return
    }
    if (password !== confirm) {
      setFormError('A confirmação da senha não confere.')
      return
    }
    const ok = await registerWithEmail(name, email, password)
    if (ok) navigate(routes.app, { replace: true })
  }

  async function onGoogle() {
    setFormError('')
    const ok = await signIn()
    if (ok) navigate(routes.app, { replace: true })
  }

  return (
    <div className="app-gate">
      <p className="app-kicker">Gaseificou</p>
      <h1>Criar conta</h1>
      <p>O cadastro abre a inbox de diagnósticos assim que o Firebase aceita a conta.</p>
      {configured ? (
        <form className="auth-form" onSubmit={(event) => void onSubmit(event)}>
          <div className="field">
            <label htmlFor="register-name">Nome</label>
            <input
              id="register-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="register-email">E-mail</label>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="register-password">Senha</label>
            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={6}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="register-confirm">Confirmar senha</label>
            <input
              id="register-confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              minLength={6}
              required
            />
          </div>
          <button className="btn btn--primary" type="submit" disabled={busy}>
            {busy ? 'Criando conta...' : 'Criar conta'}
          </button>
          <button className="btn btn--ghost" type="button" onClick={() => void onGoogle()} disabled={busy}>
            <GoogleMark />
            Criar com Google
          </button>
        </form>
      ) : (
        <p className="app-gate__status" role="status">O login ainda não está configurado neste ambiente.</p>
      )}
      {formError ? <p className="app-gate__error" role="alert">{formError}</p> : null}
      {error ? <p className="app-gate__error" role="alert">{error}</p> : null}
      <p className="auth-switch">
        Já tem conta? <Link to={routes.login}>Entrar</Link>
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
