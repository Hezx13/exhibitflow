import { memo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Stack, IconButton } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import logo from '../assets/logo192.png';
import ViewSidebarRoundedIcon from '@mui/icons-material/ViewSidebarRounded';
import { motion } from 'motion/react';
import { opacityZoomIn } from '../animations/opacityZoomIn';
import UserMenu from './UserMenu';

export const NavBar = ({
  isSidebarOpen,
  setSidebarOpen,
}: {
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}) => {
  const location = useLocation();
  document.title =
    'ExhibitFlow - ' +
    (location.pathname.split('/')[1] ? location.pathname.split('/')[1] : 'projects');
  const isMobile = useMediaQuery('(max-width:600px)');

  return (
    <Box
      sx={{
        height: '32px',
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '2rem',
        margin: '10px auto',
        borderBottom: 1,
        borderColor: 'divider',
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
      <Stack direction="row" gap={1}></Stack>
      <UserMenu />
    </Box>
  );
};

export default memo(NavBar);
