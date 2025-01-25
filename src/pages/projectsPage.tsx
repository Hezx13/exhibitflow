import Box from '@mui/material/Box';
import { useAppState } from '../state/AppStateContext';
import useMediaQuery from '@mui/material/useMediaQuery';
import FullFeaturedCrudGrid from '../components/data-display/DataGridComponent';
import { useUser } from '../state/userContext';
import { useState, useEffect } from 'react';
import { useLoadListsQuery } from '../store/api/listsApi';
import { useNavigate, useParams } from 'react-router-dom';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export default function ProjectsPage() {
  const { getTasksByListId, getTasksByArchiveId, dispatch } = useAppState();
  const navigate = useNavigate();
  const { data: lists, isLoading } = useLoadListsQuery();
  const { id } = useParams();
  const matches = useMediaQuery('(max-width:1280px)');
  const [value, setValue] = useState<number>(0);
  const [selected, setSelected] = useState<string | null>(null);
  const { currentUser, users } = useUser();

  useEffect(() => {
    try {
      if (selected && lists) {
        setValue(lists.findIndex((list) => list.text === selected));
      } else {
        setSelected(lists?.[0]?.text ?? null);
        setValue(0);
      }
    } catch (err) {
      setSelected(lists?.[0]?.text ?? null);
      setValue(0);
    }
  }, [lists, selected]);

  const handleChange = (event: any, newValue: number) => {
    navigate(`/projects/${lists?.[newValue]._id}`);
  };

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
            <FullFeaturedCrudGrid userData={currentUser} users={users} tableId={id} />
          </Box>
        </Box>
      )}
    </Box>
  );
}
