import { Alert, Chip, Divider, Grid } from '@mui/material';
import React from 'react';
import { Navigate } from 'react-router-dom';
import NavBar from '../components/navBar';
import { getUsers } from '../api/user-api';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import UserManagementTable from '../components/UserManagementTable';
import DepartmentsTable from '../components/DepartmentsTable';

const ManagementPage = () => {
  const [isLoggedIn] = React.useState(!!localStorage.getItem('token'));
  const [alert, setAlert] = React.useState<string | null>(null);

  return (
    <Grid container justifyContent="center">
      {!isLoggedIn && <Navigate to="/login" />}
      {alert && (
        <Grid item xs={12}>
          <Alert
            severity="error"
            onClose={() => {
              setAlert(null);
            }}
          >
            You cannot edit yourself!
          </Alert>
        </Grid>
      )}
      <Grid item xs={12}>
        {/* <UserManagementTable onAlert={(arg) => setAlert(arg)} /> */}
      </Grid>
      <Grid item xs={12} md={6} sx={{ marginTop: '20px', padding: '0 1rem 0 0' }}>
        <DepartmentsTable />
      </Grid>
      <Grid item xs={12} md={6} sx={{ marginTop: '20px', padding: '0 0 0 1rem' }}>
        {/* <DepartmentsTable/> */}
      </Grid>
    </Grid>
  );
};

export default ManagementPage;
