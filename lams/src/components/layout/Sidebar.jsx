import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Bell,
  Users,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ScrollText,
  Building2,
} from 'lucide-react'
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  IconButton,
  Tooltip,
  Divider,
  Typography,
} from '@mui/material'
import Logo from '../common/Logo'
import { useAuth } from '../../auth/AuthContext'
import { useAppTheme } from '../../styles/ThemeProvider'

const DRAWER_WIDTH = 260
const COLLAPSED_WIDTH = 72

const topNav = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', permission: 'DASHBOARD_VIEW' },
  { label: 'Proposals', icon: FileText, path: '/proposals', permission: 'PROPOSALS_VIEW' },
  { label: 'GIS Map', icon: BarChart3, path: '/map', permission: 'GIS_VIEW' },
  { label: 'Notifications', icon: Bell, path: '/notifications', permission: 'NOTIFICATIONS_VIEW' },
  { label: 'Users & Roles', icon: Users, path: '/users', permission: 'USERS_VIEW' },
  { label: 'Departments', icon: Building2, path: '/departments', permission: 'USERS_VIEW', roles: ['SUPER_ADMIN'] },
  { label: 'Audit Logs', icon: ScrollText, path: '/audit-logs', permission: 'AUDIT_VIEW' },
  { label: 'Settings', icon: Settings, path: '/settings', permission: 'SETTINGS_VIEW' },
]

const bottomNav = [
  { label: 'Help & Support', icon: HelpCircle, path: '/help' },
]

const Sidebar = ({ collapsed, onToggle, variant = 'permanent', open, onClose, onNavigate }) => {
  const location = useLocation()
  const { user, hasPermission } = useAuth()
  const { mode } = useAppTheme()
  const isDark = mode === 'dark'
  const isMobileDrawer = variant === 'temporary'

  const filteredTop = topNav.filter((item) => {
    if (!hasPermission(item.permission)) return false
    if (item.roles && !item.roles.includes(user?.role)) return false
    return true
  })

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  const renderNavItem = (item) => {
    const active = isActive(item.path)
    return (
      <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
        <ListItemButton
          component={Link}
          to={item.path}
          onClick={() => {
            if (variant === 'temporary') onClose?.()
            onNavigate?.(item.path)
          }}
          sx={{
            minHeight: 44,
            justifyContent: collapsed ? 'center' : 'flex-start',
            px: collapsed ? 2 : 2.5,
            py: 1,
            mx: collapsed ? 1 : 1.5,
            borderRadius: 3,
            bgcolor: active ? 'primary.main' : 'transparent',
            color: active ? 'primary.contrastText' : isDark ? 'grey.400' : 'grey.700',
            '&:hover': {
              bgcolor: active ? 'primary.dark' : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(30,111,255,0.06)',
              color: active ? 'primary.contrastText' : isDark ? 'grey.200' : 'grey.900',
            },
            transition: 'all 0.2s ease',
          }}
        >
          <Tooltip title={collapsed ? item.label : ''} placement="right" arrow disableInteractive>
            <ListItemIcon
              sx={{
                minWidth: collapsed ? 0 : 40,
                justifyContent: 'center',
                color: 'inherit',
                '& svg': { transition: 'transform 0.2s ease' },
              }}
            >
              <item.icon size={20} />
            </ListItemIcon>
          </Tooltip>
          {!collapsed && (
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontSize: '0.875rem',
                fontWeight: active ? 600 : 500,
                letterSpacing: '-0.01em',
              }}
            />
          )}
        </ListItemButton>
      </ListItem>
    )
  }

  return (
    <Drawer
      variant={variant}
      sx={{
        width: variant === 'permanent' ? (collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH) : DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: variant === 'permanent' ? (collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH) : DRAWER_WIDTH,
          boxSizing: 'border-box',
          bgcolor: isDark ? 'background.paper' : 'background.paper',
          borderRight: (t) => `1px solid ${t.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`,
          boxShadow: isDark ? '4px 0 24px rgba(0,0,0,0.1)' : '4px 0 24px rgba(30,111,255,0.03)',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflowX: 'hidden',
        },
      }}
      open={variant === 'temporary' ? open : undefined}
      onClose={variant === 'temporary' ? onClose : undefined}
      ModalProps={{ keepMounted: true }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            px: collapsed ? 1 : 2,
            height: 64,
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`,
            flexShrink: 0,
          }}
        >
          {!collapsed && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
              <Logo size="sm" variant="icon" animated />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  letterSpacing: '-0.02em',
                  background: 'linear-gradient(135deg, #1e6fff, #0d9e6e)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  whiteSpace: 'nowrap',
                }}
              >
                Bharat Bhoomi
              </Typography>
            </Box>
          )}
          {collapsed && <Logo size="sm" variant="icon" animated />}
          {!collapsed && (
            <IconButton
              onClick={onToggle}
              size="small"
              sx={{
                color: 'text.secondary',
                '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(30,111,255,0.06)' },
              }}
            >
              <ChevronLeft size={18} />
            </IconButton>
          )}
        </Box>

        {collapsed && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
            <IconButton
              onClick={onToggle}
              size="small"
              sx={{
                color: 'text.secondary',
                '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(30,111,255,0.06)' },
              }}
            >
              <ChevronRight size={16} />
            </IconButton>
          </Box>
        )}

        <List sx={{ flex: 1, overflowY: 'auto', py: 2, px: 0 }}>
          {filteredTop.map(renderNavItem)}
        </List>

        <Divider sx={{ mx: 2 }} />
        <List sx={{ py: 1.5, px: 0 }}>
          {bottomNav.map(renderNavItem)}
        </List>
      </Box>
    </Drawer>
  )
}

export default Sidebar
