import { Components, Theme } from '@mui/material';

const MuiPaper: Components<Theme>['MuiPaper'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      '--Paper-overlay': 'linear-gradient(rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.065)) !important',
      borderRadius: theme.shape.borderRadius,
    }),
  },
};

export default MuiPaper;
