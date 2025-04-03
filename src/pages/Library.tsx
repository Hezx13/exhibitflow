import { AgGridReact } from 'ag-grid-react';
import { useMemo, useState } from 'react';
import { useLoadListsQuery, usePatchListMutation } from '../store/api/listsApi';
import { Stack } from '@mui/material';
import myTheme from '../theme/grid';
import { useNavigate } from 'react-router-dom';

export default function Library() {
  const { data: listsData = [] } = useLoadListsQuery();
  const [patchList] = usePatchListMutation();
  const navigate = useNavigate();

  const lists = useMemo(() => {
    return listsData.map((list) => {
      return Object.assign({}, list);
    });
  }, [listsData]);

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
      {
        field: 'isActive',
        headerName: 'Active',
        width: 65,
        editable: true,
        cellEditor: 'agCheckboxCellEditor',
        onCellValueChanged: (event) => {
          // Update the server with the new value
          patchList({
            listId: event.data._id,
            payload: { isActive: event.newValue },
          });
        },
      },
    ],
    [navigate, patchList]
  );

  return (
    <Stack height="100%" width="100%" flexGrow={1}>
      <Stack flexGrow={1} pb={1}>
        <AgGridReact rowData={lists} theme={myTheme} columnDefs={columnDefs} />
      </Stack>
    </Stack>
  );
}
