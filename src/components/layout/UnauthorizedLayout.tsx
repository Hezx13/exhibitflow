import { Box } from '@mui/material';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../../store';

export default function UnauthorizedLayout() {
  const token = useAppSelector((state) => state.auth.token);
  if (token) {
    return <Navigate to="/" />;
  }
  return (
    <Box>
      <Outlet />
    </Box>
  );
}
