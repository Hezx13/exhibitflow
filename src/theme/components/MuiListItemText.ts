import { Components, Theme } from '@mui/material';

const MuiListItemText: Components<Theme>['MuiListItemText'] = {
  styleOverrides: {
    root: {
      marginTop: 2,
      marginBottom: 2,
    },
  },
};

export default MuiListItemText;
