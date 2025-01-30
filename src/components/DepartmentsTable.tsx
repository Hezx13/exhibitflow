import { AgGridReact } from 'ag-grid-react';
import { useGetUsersQuery } from '../store/api/userApi';
import { Box, Typography } from '@mui/material';
import myTheme from '../theme/grid';

const DepartmentsTable = () => {
  const { data: users } = useGetUsersQuery();

  // Process users data to get department statistics
  const getDepartmentStats = () => {
    if (!users) return [];

    const stats = users.reduce((acc: any, user: any) => {
      if (!acc[user.department]) {
        acc[user.department] = { department: user.department, count: 0 };
      }
      acc[user.department].count++;
      return acc;
    }, {});

    return Object.values(stats);
  };

  const columnDefs = [
    { field: 'department', headerName: 'Department', flex: 1 },
    { field: 'count', headerName: 'Number of Users', flex: 1 },
  ];

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Departments
      </Typography>
      <div className="ag-theme-material" style={{ height: 350, width: '100%' }}>
        <AgGridReact
          rowData={getDepartmentStats()}
          theme={myTheme}
          columnDefs={columnDefs as any}
        />
      </div>
    </Box>
  );
};

export default DepartmentsTable;
