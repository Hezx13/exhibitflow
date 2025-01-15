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

export default function VerticalTabs() {
  const { lists, getTasksByListId, getTasksByArchiveId, dispatch } = useAppState();
  const matches = useMediaQuery('(max-width:1280px)');

  const [value, setValue] = useState<number>(0);
  const [selected, setSelected] = useState<string | null>(null);
  const { currentUser, users } = useUser();

  useEffect(() => {
    try {
      if (selected && lists) {
        setValue(lists.findIndex((list) => list.text === selected));
      } else {
        setSelected(lists[0]?.text);
        setValue(0);
      }
    } catch (err) {
      setSelected(lists[0]?.text);
      setValue(0);
    }
  }, [lists, selected]);

  const handleChange = (event: any, newValue: number) => {
    setSelected(event.target.childNodes[0].data);
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
          <Tabs
            orientation="vertical"
            variant="scrollable"
            value={value}
            onChange={handleChange}
            aria-label="Vertical tabs example"
            sx={{ borderRight: 1, borderColor: 'divider', width: '250px', pb: 2 }}
          >
            {lists.map((list, index) =>
              list.tasks.some(
                (task) => task.status === 'Pending' || task.status === '' || !task.status
              ) ? (
                <StyledTab key={index} label={list.text} {...a11yProps(index)} />
              ) : (
                <Tab key={index} label={list.text} {...a11yProps(index)} />
              )
            )}
          </Tabs>
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            {lists.map((list, index) => (
              <TabPanel key={index} value={value} index={index}>
                <FullFeaturedCrudGrid userData={currentUser} users={users} tableId={list.id} />
              </TabPanel>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
