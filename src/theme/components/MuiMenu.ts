import { Components, Theme } from '@mui/material';

const MuiMenu: Components<Theme>['MuiMenu'] = {
  styleOverrides: {
    paper: ({ theme }) => ({
      borderRadius: theme.shape.borderRadius,
    }),
    list: {
      padding: 4,
    },
  },
};

export default MuiMenu;
