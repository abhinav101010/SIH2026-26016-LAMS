import { useContext } from 'react'
import { AuthContext } from './AuthContext'

const PermissionGate = ({ permission, permissions, requireAll = false, fallback = null, children }) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useContext(AuthContext)

  if (permission && !hasPermission(permission)) {
    return fallback
  }

  if (permissions && !requireAll && !hasAnyPermission(permissions)) {
    return fallback
  }

  if (permissions && requireAll && !hasAllPermissions(permissions)) {
    return fallback
  }

  return children
}

export default PermissionGate
