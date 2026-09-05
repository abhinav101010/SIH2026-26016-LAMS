import { useContext } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { AuthContext } from '../auth/AuthContext'

const ProtectedRoute = ({ children, requiredPermission, requiredPermissions, fallback = null }) => {
  const { isAuthenticated, loading, hasPermission, hasAnyPermission, hasAllPermissions } = useContext(AuthContext)
  const location = useLocation()

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-text-secondary">Authenticating...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    if (fallback) return fallback
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">403</h1>
          <p className="text-foreground-secondary mb-6">Access Denied</p>
          <p className="text-sm text-foreground-secondary mb-6">You do not have permission to view this page.</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (requiredPermissions && !hasAllPermissions(requiredPermissions)) {
    if (fallback) return fallback
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">403</h1>
          <p className="text-foreground-secondary mb-6">Access Denied</p>
          <p className="text-sm text-foreground-secondary mb-6">You do not have the required permissions to view this page.</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return children
}

export default ProtectedRoute
