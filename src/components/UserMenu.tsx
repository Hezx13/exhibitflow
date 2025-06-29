import { memo, useState, useEffect, useMemo } from 'react';
import { Menu, MenuItem, IconButton, Box, Stack, Typography, Switch, Divider, ListItemIcon, ListItemText } from '@mui/material';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import { logout, useGetUserDataQuery, usePatchUserMutation, /* usePatchUserMutation */ } from '../store/api/userApi'; // Comment out patchUser
import DepartmentSelector from './DepartmentSelector';
import { useAppDispatch, useAppSelector } from '../store';
import { clearCredentials } from '../store/slices/authSlice';
import { StyledLink } from '../styles/styles'; // Assuming StyledLink is appropriately defined

export const UserMenu = memo(() => {
  const { token } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const open = Boolean(menuAnchor);

  const { data: userData } = useGetUserDataQuery(undefined, { skip: !token });
  const [patchUser] = usePatchUserMutation();
  const canBeAdmin = useMemo(() => userData?.role === 'Admin', [userData?.role]);
  const openMenu = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
  };

  const handleLogOut = async () => {
    dispatch(clearCredentials());
    closeMenu();
  };

  const handleAdminToggle = async (event: React.ChangeEvent<HTMLInputElement>) => { // Comment out admin toggle handler
    const newAdminState = event.target.checked;
    try {
       if (userData?._id) {
         await patchUser({ _id: userData._id, adminAccess: newAdminState }).unwrap();
       }
    } catch (error) {
      console.error('Failed to update admin status:', error);
    }
  };


  return (
    <>
      <IconButton
        aria-label="account"
        onClick={openMenu}
        aria-controls={open ? 'account-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        {token ? <PersonIcon /> : <PermIdentityIcon />}
      </IconButton>
      <Menu
        anchorEl={menuAnchor}
        id="account-menu"
        open={open}
        onClose={closeMenu}
        onClick={closeMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {token && userData ? (
          <Box sx={{ px: 2, py: 1 }}>
             <Typography variant="body1" fontWeight="bold">{userData.username || 'User'}</Typography>
             <Typography variant="body2" color="text.secondary">{userData.email}</Typography>
          </Box>
        ) : null}
        {token && <Divider />}
        {token ? (
          [
            canBeAdmin && ( 
                <Stack key="admin-toggle" direction="row" alignItems="center" justifyContent="space-between" p={1}>
                  <ListItemIcon>
                    <AdminPanelSettingsRoundedIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Admin Access</ListItemText>
                  <Switch
                    checked={userData.adminAccess}
                    onChange={handleAdminToggle}
                    size="small"
                    onClick={(e) => e.stopPropagation()} 
                  />
                </Stack>
             ),
              canBeAdmin && <Divider key="divider-admin"/>, 
            <DepartmentSelector key="dept-selector" />,
            <Divider key="divider-1"/>,
            <MenuItem key="logout" onClick={handleLogOut}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Log Out
            </MenuItem>
          ]
        ) : (
          [ // Use array for keys
            <StyledLink key="login" to="/login" style={{ textDecoration: 'none', color: 'inherit' }}>
              <MenuItem>
                <ListItemIcon>
                  <LoginIcon fontSize="small" />
                </ListItemIcon>
                Log in
              </MenuItem>
            </StyledLink>,
            <StyledLink key="register" to="/register" style={{ textDecoration: 'none', color: 'inherit' }}>
              <MenuItem>
                <ListItemIcon>
                  <AppRegistrationIcon fontSize="small" />
                </ListItemIcon>
                 Register
              </MenuItem>
            </StyledLink>
          ]
        )}
      </Menu>
    </>
  );
});

export default UserMenu; 