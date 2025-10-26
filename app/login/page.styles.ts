import { SxProps, Theme } from '@mui/material'

export const loginStyles = {
  containerBox: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as SxProps<Theme>,

  card: {
    width: '100%',
    boxShadow: 3,
  } as SxProps<Theme>,

  cardContent: {
    p: 4,
    '&:last-child': { pb: 4 },
  } as SxProps<Theme>,

  logoBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    mb: 4,
  } as SxProps<Theme>,

  pregnantIcon: {
    fontSize: 64,
    color: 'primary.main',
    mb: 2,
  } as SxProps<Theme>,

  divider: {
    mb: 4,
  } as SxProps<Theme>,

  googleButton: {
    py: 1.5,
    textTransform: 'none',
    fontSize: '1rem',
    fontWeight: 500,
  } as SxProps<Theme>,
} as const
