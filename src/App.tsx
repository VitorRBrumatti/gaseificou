import { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { RequireAuth } from './auth/RequireAuth'
import { AppShell } from './pages/app/AppShell'
import { DiagnosticDetailPage } from './pages/app/DiagnosticDetailPage'
import { DiagnosticsPage } from './pages/app/DiagnosticsPage'
import { OverviewPage } from './pages/app/OverviewPage'
import { UnitsPage } from './pages/app/UnitsPage'
import { GuestUnitPage } from './pages/hotel/GuestUnitPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { routes } from './routes'
import './styles/dashboard.css'

function ToStaticSite() {
  useEffect(() => {
    window.location.replace(routes.home)
  }, [])
  return null
}

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path={routes.login} element={<LoginPage />} />
        <Route path={routes.register} element={<RegisterPage />} />
        <Route
          path={routes.app}
          element={(
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          )}
        >
          <Route index element={<OverviewPage />} />
          <Route path="diagnosticos" element={<DiagnosticsPage />} />
          <Route path="diagnosticos/:diagnosticId" element={<DiagnosticDetailPage />} />
          <Route path="unidades" element={<UnitsPage />} />
          <Route path="unidades/:unitId" element={<UnitsPage />} />
        </Route>
        <Route path="/cliente/:unitId" element={<GuestUnitPage />} />
        <Route path="*" element={<ToStaticSite />} />
      </Routes>
    </AuthProvider>
  )
}
