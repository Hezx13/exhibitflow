import Box from '@mui/material/Box';
import { useAppState } from '../state/AppStateContext';
import useMediaQuery from '@mui/material/useMediaQuery';
import FullFeaturedCrudGrid from '../components/data-display/DataGridComponent';
import { useUser } from '../state/userContext';
import { useState, useEffect } from 'react';
import { useLoadListsQuery } from '../store/api/listsApi';
import { useNavigate, useParams } from 'react-router-dom';
import { TopBar } from '../components/data-display/TopBar';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export default function ProjectsPage() {
  const { id } = useParams();
  const matches = useMediaQuery('(max-width:1280px)');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {!matches && (
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            height: 'calc(100vh - 65px)',
            borderRadius: '12px',
            width: '100%',
          }}
        >
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <TopBar listId={id as string} />
            <FullFeaturedCrudGrid tableId={id as string} />
          </Box>
        </Box>
      )}
    </Box>
  );
}
