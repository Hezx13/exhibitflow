import { useState } from 'react';
import { useAppState } from '../state/AppStateContext';
import { Grid } from '@mui/material';
import NavBar from '../components/navBar';
import VerticalTabs from './projectsPage';
import { Navigate } from 'react-router-dom';
const ListsPage = () => {
  const { lists, dispatch } = useAppState();
  const [isLoggedIn] = useState(!!localStorage.getItem('token'));

  return (
    <Grid container>
      {!isLoggedIn && <Navigate to="/login" />}

      <Grid item xs={12}>
        <NavBar />
      </Grid>
      <Grid item xs={12}>
        <VerticalTabs />
      </Grid>
    </Grid>
  );
};

export default ListsPage;
