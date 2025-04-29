import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  useGetUsersQuery,
  useDeleteUserMutation,
  usePromoteUserMutation,
  useDemoteUserMutation,
  useApproveUserMutation,
  useDisapproveUserMutation,
  usePatchUserMutation,
  Roles,
} from '../store/api/userApi';
import { Button, Box, Typography, Checkbox } from '@mui/material';
import myTheme from '../theme/grid';
import { useGetDepartmentsQuery } from '../store/api/departmentsApi';
interface UserManagementTableProps {
  onAlert: (message: string) => void;
}

const UserManagementTable: React.FC<UserManagementTableProps> = ({ onAlert }) => {
  const { data: departments } = useGetDepartmentsQuery();
  const { data: users } = useGetUsersQuery();
  const [deleteUser] = useDeleteUserMutation();
  const [promoteUser] = usePromoteUserMutation();
  const [demoteUser] = useDemoteUserMutation();
  const [patchUser] = usePatchUserMutation();
  const [approveUser] = useApproveUserMutation();
  const [disapproveUser] = useDisapproveUserMutation();
  const columnDefs = [
    { field: 'username', headerName: 'Username', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    {
      field: 'department',
      headerName: 'Department',
      flex: 1,
      cellEditor: 'agRichSelectCellEditor',
      editable: true,
      cellEditorParams: {
        values: departments,
        multiSelect: true,
        formatValue: (v) => v.name,
        parseValue: (v) => v.name,
      },
    },
    {
      field: 'isApproved',
      headerName: 'Approved',
      flex: 1,
      editable: true,
      onCellValueChanged: (params: any) => {
        console.log(params);
      },
    },
    {
      field: 'role',
      headerName: 'Role',
      flex: 1,
      editable: true,
      onCellValueChanged: (params: any) => {
        console.log(params);
      },
      cellEditor: 'agRichSelectCellEditor',
      cellEditorParams: {
        values: Object.values(Roles),
      },
    },
    {
      headerName: 'Actions',
      flex: 1,
      cellRenderer: (params: any) => (
        <Box>
          <Button
            size="small"
            onClick={() => handlePromote(params.data.username)}
            disabled={params.data.role === 'ADMIN'}
          >
            Promote
          </Button>
          <Button
            size="small"
            onClick={() => handleDemote(params.data.username)}
            disabled={params.data.role === 'USER'}
          >
            Demote
          </Button>
          <Button size="small" color="error" onClick={() => handleDelete(params.data.username)}>
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  const handleDelete = async (username: string) => {
    try {
      await deleteUser(username).unwrap();
    } catch (error) {
      onAlert('Failed to delete user');
    }
  };

  const handlePromote = async (username: string) => {
    try {
      await promoteUser(username).unwrap();
    } catch (error) {
      onAlert('Failed to promote user');
    }
  };

  const handleDemote = async (username: string) => {
    try {
      await demoteUser(username).unwrap();
    } catch (error) {
      onAlert('Failed to demote user');
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        User Management
      </Typography>
      <div className="ag-theme-material" style={{ height: 400, width: '100%' }}>
        <AgGridReact rowData={users} columnDefs={columnDefs as any} theme={myTheme} />
      </div>
    </Box>
  );
};

export default UserManagementTable;
