import { Grid } from '@mui/material';
import ProjectsPage from './projectsPage';
const ListsPage = () => {
  return (
    <Grid container>
      <Grid item xs={12}>
        <ProjectsPage />
      </Grid>
    </Grid>
  );
};

export default ListsPage;
