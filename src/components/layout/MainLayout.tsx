import { Box } from '@mui/material';
import { Grid2 as Grid } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar/Sidebar';
import { useState } from 'react';
import { NavBar } from '../navBar';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Grid container sx={{ height: '100vh', overflow: 'hidden' }}>
      <Grid size="auto" sx={{ height: '100vh', overflow: 'hidden' }}>
        <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      </Grid>
      <Grid size="grow" container direction="column">
        <Grid size="auto">
          <Box width="100%" px={1}>
            <NavBar isSidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          </Box>
        </Grid>
        <Grid
          size="grow"
          component="main"
          sx={{
            px: 2,
            overflow: 'auto',
            transition: 'width 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms',
          }}
        >
          <Outlet />
        </Grid>
      </Grid>
    </Grid>
  );
}
