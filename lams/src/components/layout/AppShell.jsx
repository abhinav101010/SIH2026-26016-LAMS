import { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import { Box, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'

const AppShell = ({ children }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const sidebarWidth = collapsed ? 72 : 260

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        variant={isMobile ? 'temporary' : 'permanent'}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onNavigate={() => setMobileOpen(false)}
      />
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          transition: 'margin 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Header onMenuClick={() => setMobileOpen(true)} />
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            p: { xs: 2, sm: 3, md: 4 },
            width: '100%',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  )
}

export default AppShell
