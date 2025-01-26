import { FC } from 'react';
import { Grid } from '@mui/material';
import FullFeaturedCrudGrid from './data-display/DataGridComponent';
import { useLocation } from 'react-router-dom';

const TablesPage: FC = () => {
  const location = useLocation();

  const receivedData = location.state?.myData || 0;
  return (
    <Grid container>
      <Grid item xs={12}>
        <FullFeaturedCrudGrid tableId={receivedData} />
      </Grid>
    </Grid>
  );
};

export default TablesPage;
