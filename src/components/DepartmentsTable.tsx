import { AgGridReact } from 'ag-grid-react';
import {
  useGetDepartmentsQuery,
  useAddDepartmentMutation,
  usePatchDepartmentMutation,
} from '../store/api/departmentsApi';
import { Box, Button, Stack, Typography } from '@mui/material';
import myTheme from '../theme/grid';
import { ColDef } from 'ag-grid-community';

const DepartmentsTable = () => {
  const { data: departments } = useGetDepartmentsQuery(undefined, {
    selectFromResult: ({ data }) => {
      return {
        data: data?.map((department) => ({
          ...department,
        })),
      };
    },
  });
  const [addDepartment] = useAddDepartmentMutation();
  const [patchDepartment] = usePatchDepartmentMutation();
  const columnDefs: ColDef[] = [
    {
      field: 'name',
      headerName: 'Department',
      flex: 1,
      editable: true,
      onCellValueChanged: async (event) => {
        console.log(event);
        await patchDepartment({ id: event.data._id, name: event.newValue });
      },
    },
    { field: 'count', headerName: 'Number of Users', flex: 1 },
  ];

  const handleAddDepartment = () => {
    addDepartment({ name: 'New Department' });
  };

  return (
    <Stack sx={{ width: '100%', height: '100%' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Departments</Typography>
        <Button variant="contained" color="primary" size="small" onClick={handleAddDepartment}>
          Add Department
        </Button>
      </Stack>
      <div className="ag-theme-material" style={{ height: 350, width: '100%' }}>
        <AgGridReact rowData={departments} theme={myTheme} columnDefs={columnDefs as any} />
      </div>
    </Stack>
  );
};

export default DepartmentsTable;
