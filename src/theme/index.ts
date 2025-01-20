import { createTheme } from '@mui/material/styles';
import MuiIconButton from './components/MuiIconButton';
import MuiButtonBase from './components/MuiButtonBase';
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
      paper: '#1E1E1E',
    },
    text: {
      primary: '#EBEBEB',
      secondary: '#A0A0A0',
    },
  },
  typography: {
    fontFamily: 'Archivo',
  },
  components: {
    MuiIconButton,
    MuiButtonBase
  }
});

export default theme;
