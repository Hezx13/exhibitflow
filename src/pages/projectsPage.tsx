import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useAppState } from '../state/AppStateContext';
import TableComponent from '../components/tableComponent';
import NavBar from '../components/navBar';
import { addList } from '../state/actions';
import { AddNewItem } from '../components/AddNewItem';
import { StyledTab } from '../styles/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import FullFeaturedCrudGrid from '../components/DataGridComponent';
import { useUser } from '../state/userContext';
import { useState, useEffect } from 'react';
import { useLoadListsQuery } from '../store/api/listsApi';
import { useNavigate, useParams } from 'react-router-dom';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
      style={{ flexGrow: 1 }}
    >
      {value === index && (
        <Box
          sx={{
            px: 1,
            width: '100%',
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
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
