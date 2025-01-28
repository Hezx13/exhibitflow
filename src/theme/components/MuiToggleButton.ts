import { Components, Theme } from '@mui/material';

declare module '@mui/material/ToggleButton' {
  interface ToggleButtonOwnProps {
    disableActiveShrink?: boolean;
  }
}

const scaleStyles = {
  transition: 'transform 0.2s ease-in',
  '&:active': {
    transform: 'scale(0.95)',
  },
};

const MuiToggleButton: Components<Theme>['MuiToggleButton'] = {
  defaultProps: {
    disableRipple: true,
  },
  styleOverrides: {
    root: ({ ownerState }) => ({
      border: 'none !important',
      textTransform: 'unset',
      ...(!ownerState.disableActiveShrink && scaleStyles),
    }),
  },
  variants: [
    {
      props: { size: 'small' },
      style: ({ theme }) => ({
        padding: theme.spacing(0.5),
      }),
    },
    {
      props: { size: 'medium' },
      style: ({ theme }) => ({
        padding: theme.spacing(0.75),
      }),
    },
    {
      props: { size: 'large' },
      style: ({ theme }) => ({
        padding: theme.spacing(0.75),
      }),
    },
  ],
};

export default MuiToggleButton;
