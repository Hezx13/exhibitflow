import { createRoot } from 'react-dom/client';
import App from './App';
import './App.css';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import {
  ExcelExportModule,
  MasterDetailModule,
  RichSelectModule,
} from '@bresatec/smarttrade-frontend-package';
import { StrictMode } from 'react';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

ModuleRegistry.registerModules([
  AllCommunityModule,
  ExcelExportModule,
  MasterDetailModule,
  RichSelectModule,
]);
