import { SxProps, Theme } from '@mui/material'

export const dashboardStyles = {
  rootBox: {
    flexGrow: 1,
  } as SxProps<Theme>,

  pregnantIcon: {
    mr: 2,
  } as SxProps<Theme>,

  title: {
    flexGrow: 1,
  } as SxProps<Theme>,

  userBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
  } as SxProps<Theme>,

  avatar: {
    width: 32,
    height: 32,
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
    mt: 4,
    mb: 4,
  } as SxProps<Theme>,

  contentBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 3,
  } as SxProps<Theme>,

  largeAvatar: {
    width: 100,
    height: 100,
  } as SxProps<Theme>,

  placeholderBox: {
    mt: 4,
    p: 4,
    border: '2px dashed',
    borderColor: 'divider',
    borderRadius: 2,
    textAlign: 'center',
    width: '100%',
    maxWidth: 600,
  } as SxProps<Theme>,
} as const
