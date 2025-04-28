import { AgGridReact } from 'ag-grid-react';
import { useMemo } from 'react';
import { useLoadListsQuery, usePatchListMutation } from '../store/api/listsApi';
import { Stack } from '@mui/material';
import myTheme from '../theme/grid';
import { useNavigate } from 'react-router-dom';
import { useGetLibraryQuery, ResourseType } from '../store/api/libraryApi';
export default function Library() {
  const { data: listsData = [] } = useLoadListsQuery();
  const { data: libraryData = [] } = useGetLibraryQuery({ type: ResourseType.ALL });
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
        field: 'name',
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
