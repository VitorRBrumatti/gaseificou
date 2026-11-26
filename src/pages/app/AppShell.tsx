import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../auth/AuthProvider'
import { routes } from '../../routes'

const NAV = [
  { to: routes.app, label: 'Visão geral', end: true },
  { to: routes.appDiagnostics, label: 'Diagnósticos', end: false },
  { to: routes.appUnits, label: 'Unidades', end: false },
]

export function AppShell() {
  const { user, busy, error, signOut } = useAuth()
  const label = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Conta'
  const initial = label.slice(0, 1).toUpperCase()

  async function leave() {
    await signOut()
    window.location.assign(routes.home)
  }

  return (
    <div className="app-shell">
      <aside className="app-side">
        <a className="app-brand" href={routes.home}>
          <span className="brand__mark" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C9.5 6 6 8.8 6 13.5C6 17.09 8.69 20 12 20C15.31 20 18 17.09 18 13.5C18 10.6 16.3 8.2 14.5 6.3C14.1 8.1 13.2 9.2 12 9.8C12.3 7.4 12.6 4.7 12 2Z" fill="#10f0a0" />
              <path d="M12 12.2C10.9 13.7 10 14.9 10 16.3C10 17.4 10.9 18.3 12 18.3C13.1 18.3 14 17.4 14 16.3C14 14.9 13.1 13.7 12 12.2Z" fill="#ff6b2b" />
            </svg>
          </span>
          <span>Gaseificou<span className="brand__accent">!</span></span>
        </a>
        <nav className="app-nav" aria-label="Painel">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => (isActive ? 'is-active' : undefined)}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <a className="app-side__site" href={routes.home}>Voltar ao site</a>
      </aside>

      <div className="app-main">
        <header className="app-top">
          <p className="app-kicker">Operação</p>
          <div className="app-top__account">
            {user?.photoURL ? (
              <img className="nav-account__photo" src={user.photoURL} alt="" referrerPolicy="no-referrer" />
            ) : (
              <span className="nav-account__fallback" aria-hidden="true">{initial}</span>
            )}
            <span>{label}</span>
            <button className="btn btn--ghost btn--sm" type="button" onClick={() => void leave()} disabled={busy}>
              {busy ? 'Saindo...' : 'Sair'}
            </button>
          </div>
        </header>
        {error ? <p className="app-banner" role="alert">{error}</p> : null}
        <Outlet />
      </div>
    </div>
  )
}
