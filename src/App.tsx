import { useAppState } from './state/AppStateContext';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ReportProvider } from './state/reportsContext';
import { ThemeProvider } from '@mui/material';
import AppRouter from './AppRouter';
import { SocketProvider } from './state/socketContext';
import { UserProvider } from './state/userContext';

const App = () => {
  return (
    <UserProvider>
      <SocketProvider>
        <ReportProvider>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <AppRouter />
          </LocalizationProvider>
        </ReportProvider>
      </SocketProvider>
    </UserProvider>
  );
};

export default App;
