import { useContext } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import RequireAuth from '../auth/RequireAuth'
import ProtectedRoute from '../auth/ProtectedRoute'
import PermissionGate from '../auth/PermissionGate'
import AppShell from '../components/layout/AppShell'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { AuthContext } from '../auth/AuthContext'

const Login = lazy(() => import('../pages/Login'))
const Dashboard = lazy(() => import('../pages/Dashboard'))
const Proposals = lazy(() => import('../pages/Proposals'))
const ProposalDetails = lazy(() => import('../pages/ProposalDetails'))
const CreateProposal = lazy(() => import('../pages/CreateProposal'))
const EditProposal = lazy(() => import('../pages/EditProposal'))
const GISMap = lazy(() => import('../pages/GISMap'))
const Notifications = lazy(() => import('../pages/Notifications'))
const Settings = lazy(() => import('../pages/Settings'))
const Users = lazy(() => import('../pages/Users'))
const Departments = lazy(() => import('../pages/Departments'))
const AuditLogs = lazy(() => import('../pages/AuditLogs'))
const NotFound = lazy(() => import('../pages/NotFound'))

function NavigateToDefault() {
  const { isAuthenticated } = useContext(AuthContext)
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  return isAuthenticated ? (
    <Navigate to={from} replace />
  ) : (
    <Navigate to="/login" replace />
  )
}

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<NavigateToDefault />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <ProtectedRoute requiredPermission="DASHBOARD_VIEW">
                <AppShell><Dashboard /></AppShell>
              </ProtectedRoute>
            </RequireAuth>
          }
        />

        <Route
          path="/proposals"
          element={
            <RequireAuth>
              <ProtectedRoute requiredPermission="PROPOSALS_VIEW">
                <AppShell><Proposals /></AppShell>
              </ProtectedRoute>
            </RequireAuth>
          }
        />

        <Route
          path="/proposals/:id"
          element={
            <RequireAuth>
              <ProtectedRoute requiredPermission="PROPOSALS_VIEW">
                <AppShell><ProposalDetails /></AppShell>
              </ProtectedRoute>
            </RequireAuth>
          }
        />

        <Route
          path="/proposals/new"
          element={
            <RequireAuth>
              <ProtectedRoute requiredPermission="PROPOSALS_CREATE">
                <AppShell><CreateProposal /></AppShell>
              </ProtectedRoute>
            </RequireAuth>
          }
        />

        <Route
          path="/proposals/:id/edit"
          element={
            <RequireAuth>
              <ProtectedRoute requiredPermission="PROPOSALS_EDIT">
                <AppShell><EditProposal /></AppShell>
              </ProtectedRoute>
            </RequireAuth>
          }
        />

        <Route
          path="/map"
          element={
            <RequireAuth>
              <ProtectedRoute requiredPermission="GIS_VIEW">
                <AppShell><GISMap /></AppShell>
              </ProtectedRoute>
            </RequireAuth>
          }
        />

        <Route
          path="/notifications"
          element={
            <RequireAuth>
              <ProtectedRoute requiredPermission="NOTIFICATIONS_VIEW">
                <AppShell><Notifications /></AppShell>
              </ProtectedRoute>
            </RequireAuth>
          }
        />

        <Route
          path="/settings"
          element={
            <RequireAuth>
              <ProtectedRoute requiredPermission="SETTINGS_VIEW">
                <AppShell><Settings /></AppShell>
              </ProtectedRoute>
            </RequireAuth>
          }
        />

        <Route
          path="/users"
          element={
            <RequireAuth>
              <ProtectedRoute requiredPermission="USERS_VIEW">
                <AppShell><Users /></AppShell>
              </ProtectedRoute>
            </RequireAuth>
          }
        />

        <Route
          path="/departments"
          element={
            <RequireAuth>
              <ProtectedRoute requiredPermission="USERS_VIEW">
                <AppShell><Departments /></AppShell>
              </ProtectedRoute>
            </RequireAuth>
          }
        />

        <Route
          path="/audit-logs"
          element={
            <RequireAuth>
              <ProtectedRoute requiredPermission="AUDIT_VIEW">
                <AppShell><AuditLogs /></AppShell>
              </ProtectedRoute>
            </RequireAuth>
          }
        />

        <Route
          path="/help"
          element={
            <RequireAuth>
              <AppShell><NotFound /></AppShell>
            </RequireAuth>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}

export default AppRoutes
