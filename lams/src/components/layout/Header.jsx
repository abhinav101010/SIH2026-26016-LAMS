import { useState, useEffect } from 'react'
import { Bell, Search, User, Sun, Moon, Settings } from 'lucide-react'
import Breadcrumb from '../common/Breadcrumb'
import { useAuth } from '../../auth/AuthContext'
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  InputBase,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Tooltip,
} from '@mui/material'
import { useAppTheme } from '../../styles/ThemeProvider'

const Header = ({ onSearch, user }) => {
  const { hasPermission } = useAuth()
  const { mode, toggleTheme } = useAppTheme()
  const isDark = mode === 'dark'
  const [searchValue, setSearchValue] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(null)
  const [showNotifications, setShowNotifications] = useState(null)

  const unreadCount = 3

  const handleSearch = (e) => {
    const val = e.target.value
    setSearchValue(val)
    onSearch?.(val)
  }

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: isDark ? 'rgba(17, 24, 39, 0.85)' : 'rgba(255, 255, 255, 0.85)',
        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`,
        color: 'text.primary',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: 64, px: { xs: 2, md: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Breadcrumb />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box
            sx={{
              position: 'relative',
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
              borderRadius: 3,
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'}`,
              px: 1,
              py: 0.5,
              transition: 'all 0.2s ease',
              '&:focus-within': {
                borderColor: 'primary.main',
                bgcolor: isDark ? 'rgba(96,165,250,0.06)' : 'rgba(30,111,255,0.03)',
              },
            }}
          >
            <Search size={16} style={{ color: 'inherit', opacity: 0.5 }} />
            <InputBase
              placeholder="Search..."
              value={searchValue}
              onChange={handleSearch}
              sx={{
                ml: 1,
                fontSize: '0.875rem',
                width: 200,
                '& input::placeholder': { opacity: 0.6 },
              }}
            />
          </Box>

          <Tooltip title="Toggle theme">
            <IconButton
              onClick={toggleTheme}
              size="small"
              sx={{
                color: 'text.secondary',
                '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(30,111,255,0.06)' },
              }}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </IconButton>
          </Tooltip>

          {hasPermission('NOTIFICATIONS_VIEW') && (
            <>
              <Tooltip title="Notifications">
                <IconButton
                  onClick={(e) => setShowNotifications(e.currentTarget)}
                  size="small"
                  sx={{
                    color: 'text.secondary',
                    '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(30,111,255,0.06)' },
                  }}
                >
                  <Badge badgeContent={unreadCount} color="primary" sx={{ '& .MuiBadge-badge': { borderRadius: 2, fontWeight: 700 } }}>
                    <Bell size={18} />
                  </Badge>
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={showNotifications}
                open={Boolean(showNotifications)}
                onClose={() => setShowNotifications(null)}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    minWidth: 320,
                    borderRadius: 4,
                    boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(30,111,255,0.08)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'}`,
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Box sx={{ px: 2.5, py: 2 }}>
                  <Typography variant="subtitle1" fontWeight={700}>Notifications</Typography>
                  <Typography variant="caption" color="text.secondary">3 unread</Typography>
                </Box>
                <Divider />
                <MenuItem onClick={() => setShowNotifications(null)} sx={{ py: 1.5, px: 2.5 }}>
                  <ListItemIcon><Bell size={18} /></ListItemIcon>
                  <ListItemText primary="New proposal requires review" secondary="2 hours ago" />
                </MenuItem>
                <MenuItem onClick={() => setShowNotifications(null)} sx={{ py: 1.5, px: 2.5 }}>
                  <ListItemIcon><Bell size={18} /></ListItemIcon>
                  <ListItemText primary="Document verification pending" secondary="1 day ago" />
                </MenuItem>
              </Menu>
            </>
          )}

          <Tooltip title="Account">
            <IconButton
              onClick={(e) => setShowUserMenu(e.currentTarget)}
              size="small"
              sx={{
                ml: 0.5,
                width: 36,
                height: 36,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': { bgcolor: 'primary.dark' },
              }}
            >
              <User size={18} />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={showUserMenu}
            open={Boolean(showUserMenu)}
            onClose={() => setShowUserMenu(null)}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 220,
                borderRadius: 4,
                boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(30,111,255,0.08)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'}`,
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 2.5, py: 2 }}>
              <Typography variant="subtitle2" fontWeight={700}>{user?.name || 'User'}</Typography>
              <Typography variant="caption" color="text.secondary">{user?.role || 'Role'}</Typography>
            </Box>
            <Divider />
            <MenuItem onClick={() => setShowUserMenu(null)} component="a" href="/settings">
              <ListItemIcon><Settings size={18} /></ListItemIcon>
              <ListItemText>Settings</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => setShowUserMenu(null)} component="a" href="/login">
              <ListItemIcon><User size={18} /></ListItemIcon>
              <ListItemText>Sign Out</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Header
