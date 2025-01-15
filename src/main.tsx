import { createRoot } from 'react-dom/client';
import App from './App';
import { DndProvider } from 'react-dnd';
import { HTML5Backend as Backend } from 'react-dnd-html5-backend';
import { AppStateProvider } from './state/AppStateContext';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { StrictMode } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DndProvider backend={Backend}>
        <AppStateProvider>
          <App />
        </AppStateProvider>
      </DndProvider>
    </ThemeProvider>
  </StrictMode>
);

ModuleRegistry.registerModules([AllCommunityModule]);
