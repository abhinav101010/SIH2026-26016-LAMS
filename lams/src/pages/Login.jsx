import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, LogIn, Shield, Users, ClipboardCheck } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import Logo from '../components/common/Logo'
import {
  Box,
  Card,
  TextField,
  IconButton,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Typography,
  Link as MuiLink,
  Alert,
  CircularProgress,
  useTheme,
} from '@mui/material'

const Login = () => {
  const { login } = useAuth()
  const theme = useTheme()
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
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: 'background.default',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Left Side — Brand */}
      <Box
        sx={{
          display: { xs: 'none', lg: 'flex' },
          flexDirection: 'column',
          width: { lg: '45%', xl: '40%' },
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(145deg, #0f3d7a 0%, #1e6fff 50%, #0a2a5c 100%)',
          color: 'white',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: 0.08,
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 20% 80%, rgba(13,158,110,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(217,119,6,0.1) 0%, transparent 50%)',
          }}
        />

        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%', p: { lg: 6, xl: 8 } }}>
          <Box sx={{ mb: 6 }}>
            <Logo size="lg" variant="full" animated />
          </Box>

          <Box sx={{ mt: 'auto' }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <Typography variant="h3" fontWeight={700} sx={{ lineHeight: 1.2, mb: 2.5, letterSpacing: '-0.03em' }}>
                Digital Land Acquisition.
                <br />
                Transparent Governance.
                <br />
                Faster Infrastructure.
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.85, mb: 6, maxWidth: 420, lineHeight: 1.7 }}>
                Bharat Bhoomi — digitizing and monitoring the land acquisition lifecycle across India with
                full transparency and accountability.
              </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 5 }}>
                {[
                  { value: '1,248', label: 'Active Projects' },
                  { value: '52K+', label: 'Hectares Proposed' },
                  { value: '31K+', label: 'Hectares Acquired' },
                ].map((stat, i) => (
                  <Box
                    key={i}
                    sx={{
                      p: 2.5,
                      borderRadius: 4,
                      bgcolor: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: '-0.02em' }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7, mt: 0.5, display: 'block' }}>
                      {stat.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2.5 }}>
                {trustIndicators.map((item, i) => (
                  <Box key={i} sx={{ textAlign: 'center' }}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 3,
                        bgcolor: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 1.5,
                      }}
                    >
                      <item.icon size={20} />
                    </Box>
                    <Typography variant="caption" fontWeight={600} sx={{ display: 'block', mb: 0.3 }}>
                      {item.text}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.65, lineHeight: 1.4, display: 'block' }}>
                      {item.desc}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </motion.div>
          </Box>
        </Box>
      </Box>

      {/* Right Side — Login Card */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 3, sm: 4, md: 6 },
          bgcolor: 'background.default',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ width: '100%', maxWidth: 440 }}
        >
          {/* Mobile logo */}
          <Box sx={{ display: { xs: 'flex', lg: 'none' }, justifyContent: 'center', mb: 4 }}>
            <Logo size="lg" variant="full" animated />
          </Box>

          <Card
            elevation={0}
            sx={{
              p: { xs: 4, sm: 5 },
              borderRadius: 5,
              border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'}`,
              boxShadow: theme.palette.mode === 'dark'
                ? '0 8px 32px rgba(0,0,0,0.35)'
                : '8px 12px 32px rgba(30,111,255,0.06), 4px 6px 14px rgba(15,23,42,0.03)',
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 3,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                  boxShadow: '0 4px 14px rgba(30,111,255,0.2)',
                }}
              >
                <Shield size={26} />
              </Box>
              <Typography variant="h4" fontWeight={700} sx={{ letterSpacing: '-0.02em', mb: 1 }}>
                Welcome to Bharat Bhoomi
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in to access the land acquisition platform
              </Typography>
            </Box>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
                  {error}
                </Alert>
              </motion.div>
            )}

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  label="Email / User ID"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@bharatbhoomi.gov.in"
                  required
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Mail size={18} style={{ opacity: 0.5 }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock size={18} style={{ opacity: 0.5 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                          sx={{ color: 'text.secondary' }}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        sx={{ borderRadius: 1 }}
                      />
                    }
                    label={<Typography variant="body2">Remember me</Typography>}
                  />
                  <MuiLink
                    href="#"
                    underline="hover"
                    variant="body2"
                    sx={{ color: 'primary.main', fontWeight: 500 }}
                  >
                    Forgot password?
                  </MuiLink>
                </Box>

                <Box
                  component="button"
                  type="submit"
                  disabled={isLoading}
                  sx={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1.5,
                    py: 1.75,
                    px: 3,
                    borderRadius: 3,
                    border: 'none',
                    background: 'linear-gradient(145deg, #1e6fff, #1552d6)',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(30,111,255,0.25)',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      background: 'linear-gradient(145deg, #1552d6, #1e6fff)',
                      boxShadow: '0 6px 20px rgba(30,111,255,0.35)',
                      transform: 'translateY(-1px)',
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                    },
                    '&:disabled': {
                      opacity: 0.6,
                      cursor: 'not-allowed',
                      transform: 'none',
                    },
                  }}
                >
                  {isLoading ? (
                    <CircularProgress size={20} sx={{ color: 'white' }} />
                  ) : (
                    <LogIn size={20} />
                  )}
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Box>
              </Box>
            </form>

            <Box sx={{ mt: 4, pt: 3, borderTop: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'}`, textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, color: 'text.secondary' }}>
                <Shield size={14} />
                <Typography variant="caption">Secure Government Platform — Audit-enabled system</Typography>
              </Box>
            </Box>
          </Card>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Demo: admin@bharatbhoomi.gov.in / admin123
            </Typography>
            <br />
            <Typography variant="caption" color="text.secondary">
              Also: proposal@gmail.com, authority@gmail.com, fieldoff@gmail.com
            </Typography>
          </Box>
        </motion.div>
      </Box>
    </Box>
  )
}

export default Login
