import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, LogIn, Shield, Users, ClipboardCheck } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import Logo from '../components/common/Logo'

const Login = () => {
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const location = useLocation()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const result = await login(email, password, rememberMe)

    if (result.success) {
      const from = location.state?.from?.pathname || '/dashboard'
      navigate(from, { replace: true })
    } else {
      setError(result.error)
    }
    setIsLoading(false)
  }

  const trustIndicators = [
    { icon: Shield, text: 'Secure Government Platform', desc: '256-bit encryption' },
    { icon: Users, text: 'Role-based Access', desc: '7-tier permission system' },
    { icon: ClipboardCheck, text: 'Audit-enabled', desc: 'Full activity trail' },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Side — Brand */}
      <div className="hidden lg:flex lg:flex-col lg:w-1/2 xl:w-5/12 relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900">
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
              <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="12" cy="12" r="1" fill="white" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        <div className="relative flex flex-col h-full p-10 text-white">
          <div className="mb-12">
            <Logo size="lg" variant="full" animated={true} />
          </div>

          <div className="mt-auto">
            <h1 className="text-3xl font-bold mb-3 leading-tight">
              Digital Land Acquisition.<br />
              Transparent Governance.<br />
              Faster Infrastructure.
            </h1>
            <p className="text-blue-100 text-sm mb-10 leading-relaxed max-w-md">
              National Land Acquisition & Management System — digitizing and monitoring the land
              acquisition lifecycle across India with full transparency and accountability.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-10">
              <div className="bg-white/10 rounded-2xl p-4 text-center border border-white/10">
                <p className="text-2xl font-bold">1,248</p>
                <p className="text-xs text-blue-200 mt-1">Active Projects</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-4 text-center border border-white/10">
                <p className="text-2xl font-bold">52K+</p>
                <p className="text-xs text-blue-200 mt-1">Hectares Proposed</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-4 text-center border border-white/10">
                <p className="text-2xl font-bold">31K+</p>
                <p className="text-xs text-blue-200 mt-1">Hectares Acquired</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {trustIndicators.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className="text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-3">
                    <item.icon size={20} className="text-white" />
                  </div>
                  <p className="text-xs font-medium text-white">{item.text}</p>
                  <p className="text-xs text-blue-200 mt-1">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side — Login Card */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-12 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <Logo size="lg" variant="full" animated={true} />
          </div>

          <div className="clay-card p-8 sm:p-10 shadow-clay-lg border-border">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Shield size={24} className="text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Welcome to NLAMS</h2>
              <p className="text-sm text-foreground-secondary mt-1.5">
                Sign in to access the land acquisition platform
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-3 rounded-xl bg-status-rejected/10 border border-status-rejected/30 text-status-rejected text-sm"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Email / User ID
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-tertiary" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@nlams.gov.in"
                    required
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-surface border border-border text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-tertiary" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-11 pr-11 py-2.5 rounded-xl bg-surface border border-border text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-tertiary hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="accent-primary w-4 h-4 rounded focus:ring-2 focus:ring-primary/30"
                  />
                  <span className="text-sm text-foreground">Remember me</span>
                </label>
                <a href="#" className="text-sm text-primary hover:text-primaryHover transition-colors font-medium">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium bg-primary text-primaryFg hover:bg-primaryHover shadow-clay-btn hover:shadow-clay-btn-hover focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <svg className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogIn size={18} />
                )}
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-border text-center">
              <p className="text-xs text-foreground-secondary">
                <Shield size={12} className="inline mr-1" />
                Secure Government Platform — Audit-enabled system
              </p>
            </div>
          </div>

          {/* Demo hint */}
          <p className="text-center text-xs text-foreground-tertiary mt-4">
            Demo: admin@nlams.gov.in / admin123
          </p>
          <p className="text-center text-xs text-foreground-tertiary mt-2">
            Also: proposal@gmail.com, authority@gmail.com, fieldoff@gmail.com
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default Login
