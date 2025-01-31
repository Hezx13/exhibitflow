import { Components, Theme } from '@mui/material';

const MuiListItemText: Components<Theme>['MuiListItemText'] = {
  styleOverrides: {
    root: {
      marginTop: 0,
      marginBottom: 0,
    },
  },
};

export default MuiListItemText;
