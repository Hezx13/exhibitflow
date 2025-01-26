import { createTheme } from '@mui/material/styles';
import MuiIconButton from './components/MuiIconButton';
import MuiButtonBase from './components/MuiButtonBase';
import MuiListItemIcon from './components/MuiListItemIcon';
import MuiListItemButton from './components/MuiListItemButton';
import MuiListItemText from './components/MuiListItemText';
import MuiMenuItem from './components/MuiMenuItem';
import MuiMenu from './components/MuiMenu';
import MuiPaper from './components/MuiPaper';
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#F29C22',
    },
    secondary: {
      main: '#EBEBEB',
    },
    background: {
      default: '#050505',
      paper: '#000000',
    },
    text: {
      primary: '#EBEBEB',
      secondary: '#A0A0A0',
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: 'Roboto',
    fontSize: 14,
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    subtitle1: {
      fontSize: '1.1rem',
    },
    subtitle2: {
      fontSize: '0.9rem',
    },
    body1: {
      fontSize: '0.875rem',
    },
    body2: {
      fontSize: '0.875rem',
    },
    button: {
      fontSize: '0.875rem',
      textTransform: 'none',
    },
    caption: {
      fontSize: '0.75rem',
    },
    overline: {
      fontSize: '0.75rem',
      textTransform: 'uppercase',
    },
  },
  components: {
    MuiIconButton,
    MuiButtonBase,
    MuiListItemIcon,
    MuiListItemButton,
    MuiListItemText,
    MuiMenuItem,
    MuiMenu,
    MuiPaper,
  },
});

export default theme;
