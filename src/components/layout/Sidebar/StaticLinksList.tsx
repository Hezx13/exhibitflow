import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import ManageAccountsRoundedIcon from '@mui/icons-material/ManageAccountsRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import LocalLibraryRoundedIcon from '@mui/icons-material/LocalLibraryRounded';
import DocumentScannerRoundedIcon from '@mui/icons-material/DocumentScannerRounded';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import ReceiptRoundedIcon from '@mui/icons-material/ReceiptRounded';
import { useAppSelector } from '../../../store';
import { useMemo } from 'react';
export const StaticLinksList = () => {
  const { isAdmin, isUser } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();

  const links = useMemo(() => [
    isAdmin ? ({
      path: '/management',
      label: 'Management',
      icon: <ManageAccountsRoundedIcon fontSize="small" />,
    }):null,
    isAdmin ? ({
      path: '/',
      label: 'Dashboard',
      icon: <DashboardRoundedIcon fontSize="small" />,
    }):null,
    isAdmin ? ({
      path: '/reports',
      label: 'Reports',
      icon: <AssessmentRoundedIcon fontSize="small" />,
    }):null,
    isAdmin ? ({
      path: '/invoices',
      label: 'Invoices',
      icon: <ReceiptRoundedIcon fontSize="small" />,
    }):null,
    {
      path: '/library',
      label: 'Library',
      icon: <LocalLibraryRoundedIcon fontSize="small" />,
    },
    isAdmin ? ({
      path: '/logs',
      label: 'Logs',
      icon: <EventNoteRoundedIcon fontSize="small" />,
    }):null,
  ], [isAdmin, isUser]);

  return (  
    <List component="nav" sx={{ width: '100%' }}>
      {links.filter(link => link !== null).map(({ path, label, icon }) => (
        <ListItemButton
          key={path}
          dense
          selected={location.pathname === path}
          onClick={() => navigate(path)}
        >
          <ListItemIcon>{icon}</ListItemIcon>
          <ListItemText primary={label} />
        </ListItemButton>
      ))}
    </List>
  );
};

export default StaticLinksList;