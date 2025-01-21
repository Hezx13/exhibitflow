import { Components, Theme } from '@mui/material';

const MuiIconButton: Components<Theme>['MuiIconButton'] = {
  defaultProps: {
    disableRipple: true,
    size: 'small',
  },
};

export default MuiIconButton;
