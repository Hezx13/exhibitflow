import { Components, Theme } from '@mui/material';
const scaleStyles = {
    transition: 'transform 0.2s ease-in-out',
    '&:active': {
      transform: 'scale(0.95)',
    },
  };
const MuiButtonBase: Components<Theme>['MuiButtonBase'] = {
  defaultProps: {
    disableRipple: true
  },
  styleOverrides: {
    root: scaleStyles,
  },
};

export default MuiButtonBase;