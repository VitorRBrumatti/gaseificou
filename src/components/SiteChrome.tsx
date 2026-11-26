import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { routes } from '../routes'

interface SiteHeaderProps {
  open: boolean
  onToggle: () => void
}

function BrandMark({ size = 18 }: { size?: number }) {
  return (
    <span className="brand__mark" aria-hidden="true">
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M12 2C9.5 6 6 8.8 6 13.5C6 17.09 8.69 20 12 20C15.31 20 18 17.09 18 13.5C18 10.6 16.3 8.2 14.5 6.3C14.1 8.1 13.2 9.2 12 9.8C12.3 7.4 12.6 4.7 12 2Z" fill="#10f0a0" />
        <path d="M12 12.2C10.9 13.7 10 14.9 10 16.3C10 17.4 10.9 18.3 12 18.3C13.1 18.3 14 17.4 14 16.3C14 14.9 13.1 13.7 12 12.2Z" fill="#ff6b2b" />
      </svg>
    </span>
  )
}

const NAV_LINKS = [
  { href: '#problema', label: 'O Problema' },
  { href: '#arquitetura', label: '4 Módulos' },
  { href: '#simulador', label: 'Simulador ROI' },
  { href: '#iot-esg', label: 'IoT & ESG' },
  { href: '#modelo', label: 'Investimento' },
]

export function SiteHeader({ open, onToggle }: SiteHeaderProps) {
  return (
    <header className="site-header" id="siteHeader">
      <nav className={open ? 'nav-shell is-open' : 'nav-shell'} id="navShell" aria-label="Navegação principal">
        <a href="#topo" className="brand">
          <BrandMark />
          <span>Gaseificou<span className="brand__accent">!</span></span>
        </a>

        <ul className="nav-links">
          {NAV_LINKS.map((link) => (
            <li key={link.href}><a href={link.href}>{link.label}</a></li>
          ))}
        </ul>

        <div className="nav-actions">
          <span className="nav-pill-metric">
            <span className="pulse-dot" />
            70–85% Eficiência Térmica
          </span>
          <GoogleAuthControl />
          <a href="#contato" className="btn btn--primary btn--sm magnetic">
            Diagnóstico Grátis
            <span className="btn__arrow" aria-hidden="true">→</span>
          </a>
          <button className="nav-toggle" type="button" aria-label="Abrir menu" aria-expanded={open} onClick={onToggle}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="7" x2="20" y2="7" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="17" x2="20" y2="17" />
            </svg>
          </button>
        </div>
      </nav>
    </header>
  )
}

function GoogleAuthControl() {
  const { user, ready, busy, signOut } = useAuth()
  const label = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Conta'
  const initial = label.slice(0, 1).toUpperCase()

  if (!ready) {
    return (
      <Link className="btn btn--ghost btn--sm nav-auth" to={routes.login} aria-busy="true">
        Entrar
      </Link>
    )
  }

  if (user) {
    return (
      <div className="nav-account">
        {user.photoURL ? (
          <img className="nav-account__photo" src={user.photoURL} alt="" referrerPolicy="no-referrer" />
        ) : (
          <span className="nav-account__fallback" aria-hidden="true">{initial}</span>
        )}
        <span className="nav-account__name">{label}</span>
        <Link className="btn btn--ghost btn--sm nav-auth" to={routes.app}>
          Painel
        </Link>
        <button className="btn btn--ghost btn--sm nav-auth" type="button" onClick={() => void signOut()} disabled={busy}>
          {busy ? 'Saindo...' : 'Sair'}
        </button>
      </div>
    )
  }

  return (
    <Link className="btn btn--ghost btn--sm nav-auth" to={routes.login}>
      Entrar
    </Link>
  )
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div style={{ maxWidth: 340, display: 'grid', gap: '0.85rem' }}>
            <a href="#topo" className="brand">
              <BrandMark size={16} />
              <span>Gaseificou<span className="brand__accent">!</span></span>
            </a>
            <p style={{ fontSize: '0.9rem', color: 'var(--ink-secondary)' }}>
              Biodigestão compacta turnkey, escoamento urbano com engate camlock e telemetria IoT para cozinhas de hotéis, pousadas e restaurantes.
            </p>
          </div>

          <div className="footer-cols">
            <div className="footer-col">
              <h4>Solução</h4>
              <ul>
                <li><a href="#problema">O Problema</a></li>
                <li><a href="#arquitetura">Arquitetura 4 Módulos</a></li>
                <li><a href="#iot-esg">Telemetria IoT e QR ESG</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Viabilidade</h4>
              <ul>
                <li><a href="#simulador">Simulador de ROI</a></li>
                <li><a href="#modelo">Modelo Híbrido</a></li>
                <li><a href="#contato">Diagnóstico Gratuito</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-wordmark" aria-hidden="true">GASEIFICOU!</div>

        <div className="footer-bottom">
          <span>© 2026 Gaseificou! · Biodigestão Turnkey</span>
          <span className="mono">USO TÉRMICO 70–85% · ESCOAMENTO URBANO · IOT</span>
        </div>
      </div>
    </footer>
  )
}
