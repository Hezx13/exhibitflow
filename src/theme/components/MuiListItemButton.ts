import { Components, Theme } from '@mui/material';

const MuiListItemButton: Components<Theme>['MuiListItemButton'] = {
  defaultProps: {
    disableRipple: true,
  },
  styleOverrides: {
    root: ({ theme }) => ({
      borderRadius: theme.shape.borderRadius,
      padding: theme.spacing(0.5),
    }),
  },
};

export default MuiListItemButton;
