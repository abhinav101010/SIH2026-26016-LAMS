import { createContext, useState, useContext, useEffect } from 'react'
import { authApi } from '../services/authApi'

export const AuthContext = createContext()

const getStoredUser = () => {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem('nlams_user')
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      localStorage.removeItem('nlams_user')
      return null
    }
  }
  return null
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser)
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getStoredUser())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const stored = getStoredUser()
      if (stored) {
        try {
          const res = await authApi.getMe()
          setUser(res.data.user)
          setIsAuthenticated(true)
        } catch {
          localStorage.removeItem('nlams_token')
          localStorage.removeItem('nlams_user')
          setUser(null)
          setIsAuthenticated(false)
        }
      }
      setLoading(false)
    }
    initAuth()
  }, [])

  const login = async (email, password, remember = false) => {
    try {
      const res = await authApi.login(email, password, remember)
      const { token, user } = res.data || res

      if (token) {
        localStorage.setItem('nlams_token', token)
      }
      if (user) {
        localStorage.setItem('nlams_user', JSON.stringify(user))
      }
      setUser(user)
      setIsAuthenticated(true)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Login failed' }
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch {
      // ignore
    }
    localStorage.removeItem('nlams_token')
    localStorage.removeItem('nlams_user')
    setUser(null)
    setIsAuthenticated(false)
  }

  const hasPermission = (permission) => {
    if (!user?.permissions) return false
    return user.permissions.includes(permission)
  }

  const hasAnyPermission = (permissions) => {
    if (!user?.permissions) return false
    return permissions.some((perm) => user.permissions.includes(perm))
  }

  const hasAllPermissions = (permissions) => {
    if (!user?.permissions) return false
    return permissions.every((perm) => user.permissions.includes(perm))
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
