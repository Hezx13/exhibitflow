import { FC, useEffect, useState } from 'react';
import { Grid } from '@mui/material';
import FullFeaturedCrudGrid from './data-display/DataGridComponent';
import { useUser } from '../state/userContext';
import { useLocation } from 'react-router-dom';

const TablesPage: FC = () => {
  const location = useLocation();
  const { currentUser, users } = useUser();

  const receivedData = location.state?.myData || 0;
  return (
    <Grid container>
      <Grid item xs={12}>
        <FullFeaturedCrudGrid tableId={receivedData} userData={currentUser} users={users} />
      </Grid>
    </Grid>
  );
};

export default TablesPage;
