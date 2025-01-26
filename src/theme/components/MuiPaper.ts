import { Components, Theme } from '@mui/material';

const MuiPaper: Components<Theme>['MuiPaper'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      '--Paper-overlay':
        'linear-gradient(rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.065)) !important',
      borderRadius: theme.shape.borderRadius,
      backgroundImage: 'none',
      boxShadow: theme.palette.mode === 'dark' 
        ? '0px 4px 12px rgba(0, 0, 0, 0.5), 0px 2px 4px rgba(0, 0, 0, 0.4)'
        : 'none',
      backgroundColor: theme.palette.background.default,
      border: `1px solid ${theme.palette.divider}`,
    }),
  },
};

export default MuiPaper;
