import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Redux ecosystem  
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux', 'redux-persist'],
          
          // Material-UI core
          'mui-core': [
            '@mui/material', 
            '@mui/icons-material', 
            '@emotion/react', 
            '@emotion/styled',
            '@mui/styled-engine-sc'
          ],
          
          // Material-UI data components
          'mui-data': [
            '@mui/x-data-grid',
            '@mui/x-data-grid-generator', 
            '@mui/x-date-pickers',
            '@mui/x-tree-view',
            '@mui/x-tree-view-pro'
          ],
          
          // Charts and visualization
          'charts': ['recharts'],
          
          // Grid components
          'grid': ['ag-grid-community', 'ag-grid-react'],          
          // Utilities and smaller libraries
          'utils': [
            'axios',
            'dayjs',
            'js-cookie',
            'nanoid',
            'object-hash',
            'throttle-debounce-ts'
          ],
                    
          // Styling
          'styling': ['styled-components'],
          
          // Other vendor libraries
          'vendor-misc': [
            'material-ui-popup-state',
            'excel-date-to-js',
            'fractional-indexing-jittered',
            '@bresatec/smarttrade-frontend-package'
          ]
        }
      }
    }
  }
})
