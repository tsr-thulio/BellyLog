import { SxProps, Theme, keyframes } from '@mui/material'

// Keyframe animations
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

const slideInFromRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`

const slideInFromLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-30px);
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

export const profileSetupModalStyles = {
  // Dialog Paper - adds rounded corners and shadow with animation
  dialogPaper: {
    borderRadius: 3,
    overflow: 'hidden',
    animation: `${fadeIn} 0.4s ease-out`,
  } as SxProps<Theme>,

  // Dialog Title - with gradient background
  dialogTitle: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    py: 3,
    px: 3,
  } as SxProps<Theme>,

  // Title text with animation
  titleText: {
    fontWeight: 700,
    fontSize: '1.75rem',
    animation: `${slideInFromLeft} 0.6s ease-out`,
  } as SxProps<Theme>,

  // Dialog subtitle - lighter color for contrast with animation
  dialogSubtitle: {
    mt: 1,
    opacity: 0.95,
    fontSize: '0.95rem',
    animation: `${slideInFromRight} 0.6s ease-out`,
  } as SxProps<Theme>,

  // Dialog Content - with padding
  dialogContent: {
    pt: 3,
    pb: 2,
    px: 3,
  } as SxProps<Theme>,

  // Stepper - custom styling with animations
  stepper: {
    mb: 4,
    mt: 2,
    '& .MuiStepLabel-label': {
      fontSize: '0.875rem',
      fontWeight: 500,
      transition: 'all 0.3s ease',
    },
    '& .MuiStepLabel-label.Mui-active': {
      fontWeight: 700,
      color: 'primary.main',
    },
    '& .MuiStepLabel-label.Mui-completed': {
      color: 'success.main',
    },
    '& .MuiStepIcon-root': {
      transition: 'all 0.3s ease',
    },
    '& .MuiStepIcon-root.Mui-active': {
      transform: 'scale(1.05)',
    },
    '& .MuiStepIcon-root.Mui-completed': {
      animation: `${pulse} 0.5s ease-out`,
    },
  } as SxProps<Theme>,

  // Content box - with animated background
  contentBox: {
    minHeight: '420px',
    p: 3,
    borderRadius: 2,
    backgroundColor: 'background.default',
    border: '1px solid',
    borderColor: 'divider',
    transition: 'all 0.4s ease-in-out',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent)',
      animation: `${slideInFromLeft} 3s ease-in-out infinite`,
    },
    '&:hover': {
      borderColor: 'primary.main',
      boxShadow: '0 4px 20px rgba(102, 126, 234, 0.15)',
    },
  } as SxProps<Theme>,

  // Step description typography - more playful
  stepDescription: {
    mb: 3,
    fontSize: '1rem',
    fontWeight: 500,
    color: 'text.primary',
  } as SxProps<Theme>,

  stepDescriptionShort: {
    mb: 3,
    fontSize: '1rem',
    fontWeight: 500,
    color: 'text.primary',
  } as SxProps<Theme>,

  // Form grid layout - with better spacing
  formGrid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
    gap: 3,
  } as SxProps<Theme>,

  // Dialog actions - elevated with shadow
  dialogActions: {
    px: 3,
    py: 2.5,
    backgroundColor: 'background.paper',
    borderTop: '1px solid',
    borderColor: 'divider',
  } as SxProps<Theme>,

  // Previous button with hover effects
  previousButton: {
    borderRadius: 2,
    textTransform: 'none',
    fontWeight: 600,
    px: 3,
    py: 1,
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateX(-4px)',
      boxShadow: 1,
    },
    '&:active': {
      transform: 'translateX(-2px)',
    },
  } as SxProps<Theme>,

  // Next/Save button - more prominent with enhanced hover
  nextButton: {
    borderRadius: 2,
    textTransform: 'none',
    fontWeight: 700,
    px: 4,
    py: 1,
    boxShadow: 2,
    transition: 'all 0.3s ease',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    '&:hover': {
      boxShadow: 6,
      transform: 'translateY(-3px) scale(1.02)',
      background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
    },
    '&:active': {
      transform: 'translateY(-1px) scale(1)',
      boxShadow: 2,
    },
  } as SxProps<Theme>,

  // Spacer
  spacer: {
    flex: 1,
  } as SxProps<Theme>,

  // Step content wrapper with slide animation
  stepContent: {
    animation: `${slideInFromRight} 0.5s ease-out`,
  } as SxProps<Theme>,

  // Form fields with staggered entrance
  formField: {
    animation: `${slideInFromLeft} 0.4s ease-out`,
    '&:nth-of-type(1)': {
      animationDelay: '0.1s',
    },
    '&:nth-of-type(2)': {
      animationDelay: '0.2s',
    },
    '&:nth-of-type(3)': {
      animationDelay: '0.3s',
    },
    '&:nth-of-type(4)': {
      animationDelay: '0.4s',
    },
  } as SxProps<Theme>,
}
