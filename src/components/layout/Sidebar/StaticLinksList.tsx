import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import ManageAccountsRoundedIcon from '@mui/icons-material/ManageAccountsRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import LocalLibraryRoundedIcon from '@mui/icons-material/LocalLibraryRounded';
import DocumentScannerRoundedIcon from '@mui/icons-material/DocumentScannerRounded';
export const StaticLinksList = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const links = [
    {
      path: '/management',
      label: 'Management',
      icon: <ManageAccountsRoundedIcon fontSize="small" />,
    },
    {
      path: '/',
      label: 'Dashboard',
      icon: <DashboardRoundedIcon fontSize="small" />,
    },
    {
      path: '/reports',
      label: 'Reports',
      icon: <AssessmentRoundedIcon fontSize="small" />,
    },
    {
      path: '/library',
      label: 'Library',
      icon: <LocalLibraryRoundedIcon fontSize="small" />,
    },
    {
      path: '/document/:id',
      label: 'Document',
      icon: <DocumentScannerRoundedIcon fontSize="small" />,
    },
  ];

  return (
    <List component="nav" sx={{ width: '100%' }}>
      {links.map(({ path, label, icon }) => (
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
