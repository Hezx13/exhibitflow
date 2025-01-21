import { Components, Theme } from '@mui/material';

const MuiListItemButton: Components<Theme>['MuiListItemButton'] = {
  defaultProps: {
    disableRipple: true,
  },
  styleOverrides: {
    root: ({ theme }) => ({
      borderRadius: theme.shape.borderRadius,
    }),
  },
};

export default MuiListItemButton;
