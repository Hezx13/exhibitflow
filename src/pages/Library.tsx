import { AgGridReact } from 'ag-grid-react';
import { useMemo, useState } from 'react';
import { useLoadListsQuery } from '../store/api/listsApi';
import { Stack } from '@mui/material';
import myTheme from '../theme/grid';
import { useNavigate } from 'react-router-dom';

export default function Library() {
  const { data: lists = [] } = useLoadListsQuery();
  const navigate = useNavigate();

  const columnDefs = useMemo(
    () => [
      {
        field: 'text',
        headerName: 'Name',
        flex: 1,
        onCellClicked: (event) => {
          navigate(`/projects/${event.data._id}`);
        },
      },
      { field: 'count', headerName: 'Materials', width: 100 },
      { field: 'newOrders', headerName: 'New Orders', width: 100 },
      { field: 'isActive', headerName: 'Active', width: 65 },
    ],
    []
  );

  return (
    <Stack height="100%" width="100%" flexGrow={1}>
      <Stack flexGrow={1} pb={1}>
        <AgGridReact rowData={lists} theme={myTheme} columnDefs={columnDefs} />
      </Stack>
    </Stack>
  );
}
