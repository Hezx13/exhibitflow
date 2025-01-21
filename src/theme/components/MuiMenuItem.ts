import { Components, Theme } from '@mui/material';

const MuiMenuItem: Components<Theme>['MuiMenuItem'] = {
  defaultProps: {
    disableRipple: true,
  },
  styleOverrides: {
    root: ({ theme }) => ({
      borderRadius: theme.shape.borderRadius,
      padding: '4px 8px',
    }),
  },
};

export default MuiMenuItem;
