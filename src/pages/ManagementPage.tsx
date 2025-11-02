import { Alert, Grid } from '@mui/material';
import React from 'react';
import { Navigate } from 'react-router-dom';
import UserManagementTable from '../components/UserManagementTable';
import DepartmentsTable from '../components/DepartmentsTable';

const ManagementPage = () => {
  const [alert, setAlert] = React.useState<string | null>(null);

  return (
    <Grid container justifyContent="center" gap={2}>
      {alert && (
        <Grid size={12}>
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
      <Grid size={12}>
        <UserManagementTable onAlert={(arg) => setAlert(arg)} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <DepartmentsTable />
      </Grid>
    </Grid>
  );
};

export default ManagementPage;
