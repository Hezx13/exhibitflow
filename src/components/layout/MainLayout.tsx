import { Box } from '@mui/material';

import { Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    <Box sx={{ height: 'calc(100vh)', overflow: 'hidden', width: '100%', px: 2 }}>
      <Outlet />
    </Box>
  );
}
