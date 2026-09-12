import { forwardRef } from 'react'
import { Paper, Box, Typography } from '@mui/material'

const ChartCard = forwardRef(({
  children,
  title,
  subtitle,
  icon: Icon,
  action,
  className = '',
  height = 'h-80',
  ...props
}, ref) => {
  return (
    <Paper
      ref={ref}
      elevation={0}
      {...props}
      sx={{
        borderRadius: 4,
        border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`,
        boxShadow: (theme) => theme.palette.mode === 'dark'
          ? '0 4px 24px rgba(0,0,0,0.25)'
          : '0 4px 24px rgba(30,111,255,0.04)',
        overflow: 'hidden',
        transition: 'box-shadow 0.3s ease, transform 0.3s ease',
        '&:hover': {
          boxShadow: (theme) => theme.palette.mode === 'dark'
            ? '0 8px 32px rgba(0,0,0,0.35)'
            : '8px 12px 32px rgba(30,111,255,0.06), 4px 6px 14px rgba(15,23,42,0.03)',
        },
        ...props.sx,
      }}
    >
      {(title || subtitle || Icon || action) && (
        <Box sx={{ p: 3, pb: 2, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {Icon && (
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2.5,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={18} />
              </Box>
            )}
            <Box>
              {title && (
                <Typography variant="subtitle1" fontWeight={700} sx={{ letterSpacing: '-0.01em', lineHeight: 1.3 }}>
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.3, display: 'block' }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>
          {action && <Box>{action}</Box>}
        </Box>
      )}
      <Box sx={{ px: 3, pb: 3, height: height ? height.replace('h-', '') : 'auto', ...(className ? { className } : {}) }}>
        {children}
      </Box>
    </Paper>
  )
})

ChartCard.displayName = 'ChartCard'
export default ChartCard
