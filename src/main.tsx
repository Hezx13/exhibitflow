import { createRoot } from 'react-dom/client';
import App from './App';
import './App.css';
import {
  ExcelExportModule,
  MasterDetailModule,
  RichSelectModule,
  RowGroupingModule,
  SetFilterModule,
  StatusBarModule,
  TreeDataModule,
  CellSelectionModule,
} from 'ag-grid-enterprise';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { StrictMode } from 'react';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

ModuleRegistry.registerModules([
  AllCommunityModule,
  // ExcelExportModule,
  // MasterDetailModule,
  // RichSelectModule,
  // RowGroupingModule,
  // SetFilterModule,
  // StatusBarModule,
  // TreeDataModule,
  // CellSelectionModule,
]);
