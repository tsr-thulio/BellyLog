import { SxProps, Theme, keyframes } from '@mui/material'

// Animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`

export const dashboardStyles = {
  rootBox: {
    flexGrow: 1,
    minHeight: '100vh',
    background: 'linear-gradient(to bottom, #f8f9ff 0%, #ffffff 100%)',
  } as SxProps<Theme>,

  appBar: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
  } as SxProps<Theme>,

  pregnantIcon: {
    mr: 2,
    animation: `${pulse} 2s ease-in-out infinite`,
  } as SxProps<Theme>,

  title: {
    flexGrow: 1,
    fontWeight: 700,
    fontSize: '1.5rem',
    letterSpacing: '-0.5px',
  } as SxProps<Theme>,

  userBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'scale(1.05)',
    },
  } as SxProps<Theme>,

  avatar: {
    width: 40,
    height: 40,
    border: '2px solid rgba(255, 255, 255, 0.5)',
    transition: 'all 0.3s ease',
    '&:hover': {
      border: '2px solid rgba(255, 255, 255, 1)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    },
  } as SxProps<Theme>,

  userButton: {
    borderRadius: 3,
    px: 2,
    py: 1,
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
  } as SxProps<Theme>,

  menuAnchorOrigin: {
    vertical: 'bottom' as const,
    horizontal: 'right' as const,
  },

  menuTransformOrigin: {
    vertical: 'top' as const,
    horizontal: 'right' as const,
  },

  container: {
    mt: 5,
    mb: 5,
    animation: `${fadeIn} 0.6s ease-out`,
  } as SxProps<Theme>,

  welcomeCard: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    p: 4,
    borderRadius: 4,
    mb: 4,
    boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)',
    animation: `${slideIn} 0.8s ease-out`,
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      background: 'radial-gradient(circle at top right, rgba(255, 255, 255, 0.2), transparent)',
    },
  } as SxProps<Theme>,

  welcomeContent: {
    position: 'relative',
    zIndex: 1,
  } as SxProps<Theme>,

  contentBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 3,
  } as SxProps<Theme>,

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
    gap: 3,
    width: '100%',
    animation: `${fadeIn} 1s ease-out`,
  } as SxProps<Theme>,

  statCard: {
    p: 3,
    borderRadius: 3,
    background: 'white',
    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.1)',
    transition: 'all 0.3s ease',
    border: '1px solid rgba(102, 126, 234, 0.1)',
    '&:hover': {
      transform: 'translateY(-8px)',
      boxShadow: '0 12px 40px rgba(102, 126, 234, 0.2)',
      borderColor: '#667eea',
    },
  } as SxProps<Theme>,

  statIcon: {
    fontSize: 48,
    mb: 2,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  } as SxProps<Theme>,

  statValue: {
    fontWeight: 800,
    fontSize: '2rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    mb: 1,
  } as SxProps<Theme>,

  statLabel: {
    color: 'text.secondary',
    fontWeight: 600,
    fontSize: '0.95rem',
  } as SxProps<Theme>,

  largeAvatar: {
    width: 120,
    height: 120,
    border: '4px solid white',
    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
  } as SxProps<Theme>,

  placeholderBox: {
    mt: 4,
    p: 5,
    border: '3px dashed',
    borderColor: 'rgba(102, 126, 234, 0.3)',
    borderRadius: 4,
    textAlign: 'center',
    width: '100%',
    maxWidth: 800,
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))',
    transition: 'all 0.3s ease',
    '&:hover': {
      borderColor: '#667eea',
      transform: 'scale(1.02)',
    },
  } as SxProps<Theme>,

  comingSoonText: {
    fontWeight: 700,
    fontSize: '1.5rem',
    mb: 2,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  } as SxProps<Theme>,
} as const
