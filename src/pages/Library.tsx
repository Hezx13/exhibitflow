import { AgGridReact } from 'ag-grid-react';
import { useMemo } from 'react';
import { useLoadListsQuery, usePatchListMutation } from '../store/api/listsApi';
import { Stack, Typography } from '@mui/material';
import myTheme from '../theme/grid';
import { useNavigate } from 'react-router-dom';
import { useGetLibraryQuery, ResourseType } from '../store/api/libraryApi';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import NotesRoundedIcon from '@mui/icons-material/NotesRounded';
import { ColDef } from 'ag-grid-community';
import { useAppSelector } from '../store';
export default function Library() {
  const { isAdmin } = useAppSelector((state) => state.auth);
  const { data: libraryData = [] } = useGetLibraryQuery({ type: ResourseType.ALL });
  const [patchList] = usePatchListMutation();
  const navigate = useNavigate();

  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        flex: 1,
        cellRenderer: (params) => {
          return (
            <Stack direction="row" alignItems="center" gap={1} sx={{ cursor: 'pointer' }}>
              {params.data.resourceType === ResourseType.DOCUMENT && <DescriptionRoundedIcon />}
              {params.data.resourceType === ResourseType.TABLE && <NotesRoundedIcon />}
              <Typography>{params.data.name || `Unnamed ${params.data.resourceType}`}</Typography>
            </Stack>
          );
        },
        onCellClicked: (event) => {
          navigate(
            `/${event.data.resourceType === 'document' ? 'documents' : 'projects'}/${event.data._id}`
          );
        },
      },
      { field: 'count', headerName: 'Materials', minWidth: 100, flex: 0.25 },
      { field: 'newOrders', headerName: 'New Orders', minWidth: 100, flex: 0.25 },
      {
        field: 'createdAt',
        headerName: 'Created',
        minWidth: 100,
        flex: 0.5,
        valueGetter: (params) => {
          return params.data.createdAt ? new Date(params.data.createdAt).toLocaleString() : '';
        },
      },
      {
        field: 'updatedAt',
        headerName: 'Updated',
        minWidth: 100,
        flex: 0.5,
        valueGetter: (params) => {
          return params.data.updatedAt ? new Date(params.data.updatedAt).toLocaleString() : '';
        },
      },
      {
        field: 'isActive',
        headerName: 'Active',
        width: 65,
        editable: isAdmin,
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
    [navigate, patchList, isAdmin]
  );

  return (
    <Stack height="100%" width="100%" flexGrow={1}>
      <Stack flexGrow={1} pb={1}>
        <AgGridReact rowData={libraryData} theme={myTheme} columnDefs={columnDefs} />
      </Stack>
    </Stack>
  );
}
