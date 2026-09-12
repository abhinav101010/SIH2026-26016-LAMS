import { createTheme, alpha } from '@mui/material'

const claymorphismTokens = {
  light: {
    bg: '#f4f6fa',
    surface: '#ffffff',
    card: '#ffffff',
    text: '#0f172a',
    textSecondary: '#475569',
    textTertiary: '#64748b',
    border: 'rgba(226, 232, 240, 0.8)',
    borderStrong: 'rgba(203, 213, 225, 0.9)',
    primary: '#1e6fff',
    primaryHover: '#1552d6',
    primaryFg: '#ffffff',
    secondary: '#0d9e6e',
    secondaryHover: '#0a7d58',
    accent: '#d97706',
    accentHover: '#b45309',
    status: {
      pending: '#d97706',
      approved: '#0d9e6e',
      rejected: '#dc2626',
      review: '#2563eb',
      possession: '#0d9488',
      notification: '#7c3aed',
    },
    shadow: {
      clay: '8px 12px 32px rgba(30, 111, 255, 0.06), 4px 6px 14px rgba(15, 23, 42, 0.04)',
      clayHover: '14px 20px 44px rgba(30, 111, 255, 0.09), 6px 10px 22px rgba(15, 23, 42, 0.05)',
      clayInner: 'inset 6px 6px 14px rgba(30, 111, 255, 0.03), inset -6px -6px 14px rgba(255, 255, 255, 0.85)',
      clayBtn: '4px 8px 18px rgba(30, 111, 255, 0.07)',
      clayBtnHover: '8px 14px 28px rgba(30, 111, 255, 0.11)',
    },
  },
  dark: {
    bg: '#0b0f1a',
    surface: '#111827',
    card: '#1a1f2e',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    textTertiary: '#64748b',
    border: 'rgba(148, 163, 184, 0.12)',
    borderStrong: 'rgba(148, 163, 184, 0.18)',
    primary: '#60a5fa',
    primaryHover: '#3b82f6',
    primaryFg: '#0b0f1a',
    secondary: '#34d399',
    secondaryHover: '#10b981',
    accent: '#fbbf24',
    accentHover: '#f59e0b',
    status: {
      pending: '#fbbf24',
      approved: '#34d399',
      rejected: '#f87171',
      review: '#60a5fa',
      possession: '#2dd4bf',
      notification: '#a78bfa',
    },
    shadow: {
      clay: '8px 12px 32px rgba(0, 0, 0, 0.35), 4px 6px 14px rgba(0, 0, 0, 0.25)',
      clayHover: '14px 20px 44px rgba(0, 0, 0, 0.45), 6px 10px 22px rgba(0, 0, 0, 0.3)',
      clayInner: 'inset 6px 6px 14px rgba(0, 0, 0, 0.45), inset -6px -6px 14px rgba(96, 165, 250, 0.03)',
      clayBtn: '4px 8px 18px rgba(0, 0, 0, 0.35)',
      clayBtnHover: '8px 14px 28px rgba(0, 0, 0, 0.45)',
    },
  },
}

export function getDesignTokens(mode) {
  return claymorphismTokens[mode] || claymorphismTokens.light
}

export function buildTheme(mode = 'light') {
  const tokens = getDesignTokens(mode)

  return createTheme({
    palette: {
      mode,
      primary: { main: tokens.primary, contrastText: tokens.primaryFg },
      secondary: { main: tokens.secondary, contrastText: '#ffffff' },
      accent: { main: tokens.accent, contrastText: '#ffffff' },
      background: {
        default: tokens.bg,
        paper: tokens.card,
      },
      text: {
        primary: tokens.text,
        secondary: tokens.textSecondary,
      },
      error: { main: tokens.status.rejected },
      warning: { main: tokens.status.pending },
      info: { main: tokens.status.review },
      success: { main: tokens.status.approved },
    },
    shape: {
      borderRadius: 14,
    },
    typography: {
      fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
      h1: { fontWeight: 700, letterSpacing: '-0.03em' },
      h2: { fontWeight: 700, letterSpacing: '-0.02em' },
      h3: { fontWeight: 600, letterSpacing: '-0.01em' },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: { fontWeight: 600, textTransform: 'none' },
    },
    shadows: [
      'none',
      tokens.shadow.clay,
      tokens.shadow.clay,
      tokens.shadow.clayHover,
      tokens.shadow.clayHover,
      tokens.shadow.clayHover,
      tokens.shadow.clayHover,
      tokens.shadow.clayHover,
      tokens.shadow.clayHover,
      tokens.shadow.clayHover,
      tokens.shadow.clayHover,
      tokens.shadow.clayHover,
      tokens.shadow.clayHover,
      tokens.shadow.clayHover,
      tokens.shadow.clayHover,
      tokens.shadow.clayHover,
      tokens.shadow.clayHover,
      tokens.shadow.clayHover,
      tokens.shadow.clayHover,
      tokens.shadow.clayHover,
      tokens.shadow.clayHover,
      tokens.shadow.clayHover,
      tokens.shadow.clayHover,
      tokens.shadow.clayHover,
      tokens.shadow.clayHover,
    ],
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: tokens.bg,
            color: tokens.text,
            transition: 'background-color 0.3s ease, color 0.3s ease',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: tokens.shadow.clayBtn,
            textTransform: 'none',
            fontWeight: 600,
            padding: '10px 20px',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              boxShadow: tokens.shadow.clayBtnHover,
              transform: 'translateY(-1px)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
          },
          contained: {
            background: `linear-gradient(145deg, ${tokens.primary}, ${tokens.primaryHover})`,
            '&:hover': {
              background: `linear-gradient(145deg, ${tokens.primaryHover}, ${tokens.primary})`,
            },
          },
          outlined: {
            borderColor: tokens.borderStrong,
            backgroundColor: tokens.surface,
            boxShadow: 'none',
            '&:hover': {
              borderColor: tokens.primary,
              backgroundColor: alpha(tokens.primary, 0.04),
              boxShadow: tokens.shadow.clayBtn,
            },
          },
          text: {
            '&:hover': {
              backgroundColor: alpha(tokens.primary, 0.06),
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: tokens.card,
            border: `1px solid ${tokens.border}`,
            borderRadius: 20,
            boxShadow: tokens.shadow.clay,
            transition: 'box-shadow 0.3s ease, transform 0.3s ease',
            '&:hover': {
              boxShadow: tokens.shadow.clayHover,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: tokens.card,
            border: `1px solid ${tokens.border}`,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
              backgroundColor: tokens.surface,
              boxShadow: `inset 2px 2px 6px rgba(15, 23, 42, 0.03), inset -2px -2px 6px rgba(255, 255, 255, 0.8)`,
              '& fieldset': {
                borderColor: tokens.border,
              },
              '&:hover fieldset': {
                borderColor: tokens.primary,
              },
              '&.Mui-focused fieldset': {
                borderColor: tokens.primary,
                boxShadow: `0 0 0 3px ${alpha(tokens.primary, 0.1)}`,
              },
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 20,
            boxShadow: tokens.shadow.clayHover,
            border: `1px solid ${tokens.border}`,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: tokens.surface,
            borderRight: `1px solid ${tokens.border}`,
            boxShadow: tokens.shadow.clay,
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${tokens.border}`,
          },
          indicator: {
            height: 3,
            borderRadius: 3,
            backgroundColor: tokens.primary,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            '&.Mui-selected': {
              color: tokens.primary,
              fontWeight: 600,
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            fontWeight: 500,
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            height: 8,
            backgroundColor: alpha(tokens.primary, 0.1),
          },
          bar: {
            borderRadius: 8,
            background: `linear-gradient(90deg, ${tokens.primary}, ${tokens.secondary})`,
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            border: `2px solid ${tokens.border}`,
          },
        },
      },
      MuiTable: {
        styleOverrides: {
          root: {
            borderCollapse: 'separate',
            borderSpacing: 0,
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:last-child td': {
              borderBottom: 'none',
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${tokens.border}`,
            padding: '14px 16px',
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: tokens.card,
            color: tokens.text,
            border: `1px solid ${tokens.border}`,
            borderRadius: 10,
            boxShadow: tokens.shadow.clay,
            fontSize: '0.8125rem',
          },
          arrow: {
            color: tokens.card,
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            margin: '4px 8px',
            '&.Mui-selected': {
              backgroundColor: alpha(tokens.primary, 0.08),
            },
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          switchBase: {
            '&.Mui-checked': {
              color: tokens.primary,
            },
          },
          track: {
            borderRadius: 12,
          },
        },
      },
      MuiCheckbox: {
        styleOverrides: {
          root: {
            borderRadius: 6,
          },
        },
      },
      MuiRadio: {
        styleOverrides: {
          root: {
            '&.Mui-checked': {
              color: tokens.primary,
            },
          },
        },
      },
      MuiBadge: {
        styleOverrides: {
          badge: {
            borderRadius: 10,
            fontWeight: 700,
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            border: `1px solid ${tokens.border}`,
          },
        },
      },
    },
  })
}
