import { SxProps, Theme, keyframes } from '@mui/material'

// Animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
`

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`

export const loginStyles = {
  containerBox: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `
        radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)
      `,
      animation: `${shimmer} 20s linear infinite`,
    },
  } as SxProps<Theme>,

  card: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 4,
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    animation: `${fadeIn} 0.6s ease-out`,
    position: 'relative',
    zIndex: 1,
    backdropFilter: 'blur(10px)',
    background: 'rgba(255, 255, 255, 0.95)',
  } as SxProps<Theme>,

  cardContent: {
    p: 5,
    '&:last-child': { pb: 5 },
  } as SxProps<Theme>,

  logoBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    mb: 4,
    animation: `${slideUp} 0.8s ease-out`,
  } as SxProps<Theme>,

  pregnantIcon: {
    fontSize: 80,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    mb: 2,
    animation: `${float} 3s ease-in-out infinite`,
  } as SxProps<Theme>,

  title: {
    fontWeight: 800,
    fontSize: '2.5rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    mb: 1,
  } as SxProps<Theme>,

  subtitle: {
    color: 'text.secondary',
    fontSize: '1.1rem',
    fontWeight: 500,
  } as SxProps<Theme>,

  divider: {
    mb: 4,
    mt: 2,
  } as SxProps<Theme>,

  welcomeText: {
    mb: 3,
    fontWeight: 600,
    fontSize: '1.3rem',
    textAlign: 'center',
    color: 'text.primary',
  } as SxProps<Theme>,

  googleButton: {
    py: 1.8,
    textTransform: 'none',
    fontSize: '1.1rem',
    fontWeight: 600,
    borderRadius: 3,
    boxShadow: '0 4px 14px rgba(102, 126, 234, 0.3)',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
      transform: 'translateY(-3px) scale(1.02)',
      background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
    },
    '&:active': {
      transform: 'translateY(-1px) scale(1)',
    },
  } as SxProps<Theme>,

  termsText: {
    mt: 4,
    textAlign: 'center',
    fontSize: '0.875rem',
    color: 'text.secondary',
    animation: `${slideUp} 1s ease-out`,
  } as SxProps<Theme>,

  decorativeCircle: {
    position: 'absolute',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.1)',
    pointerEvents: 'none',
  } as SxProps<Theme>,
} as const
