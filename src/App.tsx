import { AppStateProvider, useAppState } from './state/AppStateContext';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ReportProvider } from './state/reportsContext';
import { CssBaseline, ThemeProvider } from '@mui/material';
import AppRouter from './AppRouter';
import { HTML5Backend as Backend } from 'react-dnd-html5-backend';
import { SocketProvider } from './state/socketContext';
import { UserProvider } from './state/userContext';
import { DndProvider } from 'react-dnd';
import theme from './theme';
import { store } from './store';
import { Provider } from 'react-redux';

const App = () => {
  return (
    <SocketProvider>
    <Provider store={store}>
      <DndProvider backend={Backend}>
          <AppStateProvider>
            <UserProvider>
              <ReportProvider>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <AppRouter />
                  </ThemeProvider>
                </LocalizationProvider>
              </ReportProvider>
            </UserProvider>
          </AppStateProvider>
      </DndProvider>
    </Provider>
        </SocketProvider>
  );
};

export default App;
