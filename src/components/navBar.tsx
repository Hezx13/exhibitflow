import { memo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { StyledNavBarItem, StyledLink } from '../styles/styles';
import { Menu, MenuItem, IconButton, Drawer, Box, Stack } from '@mui/material';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import PersonIcon from '@mui/icons-material/Person';
import { logout } from '../store/api/userApi';
import useMediaQuery from '@mui/material/useMediaQuery';
import logo from '../assets/logo192.png';
import DepartmentSelector from './DepartmentSelector';
import ViewSidebarRoundedIcon from '@mui/icons-material/ViewSidebarRounded';
import { motion } from 'motion/react';
import { opacityZoomIn } from '../animations/opacityZoomIn';


export const NavBar = ({
  isSidebarOpen,
  setSidebarOpen,
}: {
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}) => {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [menuAnchor, setMenuAnchor] = useState(null);
  document.title =
    'ExhibitFlow - ' +
    (location.pathname.split('/')[1] ? location.pathname.split('/')[1] : 'projects');
  const isMobile = useMediaQuery('(max-width:600px)');

  const openMenu = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
  };

  const handleLogOut = async () => {
    await logout();
    setIsLoggedIn(!!localStorage.getItem('token'));
    closeMenu();
  };

  const validateLogin = (event) => {
    setIsLoggedIn(!!localStorage.getItem('token'));
    if (!isLoggedIn) event?.preventDefault();
  };

  return (
    <Box
      sx={{
        height: '40px',
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '2rem',
        margin: '10px auto',
        borderBottom: 1,
        borderColor: 'divider',
        py: 0.5,
      }}
    >
      {!isSidebarOpen ? (
        <motion.div {...opacityZoomIn}>
          <IconButton onClick={() => setSidebarOpen(!isSidebarOpen)}>
            <ViewSidebarRoundedIcon />
          </IconButton>
        </motion.div>
      ) : (
        <motion.img
          {...opacityZoomIn}
          src={logo}
          alt="logo"
          style={{ width: 34, height: 34, padding: 4 }}
        />
      )}
      <Stack direction="row" gap={1}>
      
      </Stack>
      <span>
        <StyledNavBarItem>
          <IconButton aria-label="account" onClick={openMenu}>
            {isLoggedIn ? (
              <>
                <PersonIcon />
              </>
            ) : (
              <PermIdentityIcon />
            )}
          </IconButton>
          <Menu anchorEl={menuAnchor} keepMounted open={Boolean(menuAnchor)} onClose={closeMenu}>
            {isLoggedIn ? (
              <div>
                <MenuItem onClick={handleLogOut}>Log Out</MenuItem>
              </div>
            ) : (
              <div>
                <StyledLink to="/login" color="#e3f2fd">
                  <MenuItem>Log in</MenuItem>
                </StyledLink>
                <StyledLink to="/register" color="#e3f2fd">
                  <MenuItem>Register</MenuItem>
                </StyledLink>
              </div>
            )}
            {isLoggedIn && menuAnchor && <DepartmentSelector />}
          </Menu>
        </StyledNavBarItem>
      </span>
    </Box>
  );
};

export default memo(NavBar);
