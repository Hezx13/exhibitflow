import React, { useEffect, useRef, useMemo } from 'react';
import Box from '@mui/material/Box';
import { addTask, moveFromArchive, removeTask } from '../state/actions';
import { getCurrentDateAndTime } from '../utils/timeUtils';
import { AddNewItem } from './AddNewItem';
import { useAppState } from '../state/AppStateContext';
import NoDataPlaceholder from './DataGridComponents/NoDataPlaceholder';
import { useSocket } from '../state/socketContext';
import { AgGridReact } from 'ag-grid-react';
import { CellEditRequestEvent, themeQuartz } from 'ag-grid-community';
import { RightClickMenu } from './actions/RigtClickMenu';
import { useLoadSingleListQuery, usePatchTaskMutation } from '../store/api/listsApi';
import myTheme from '../theme/grid';
import { Skeleton } from '@mui/material';

// to use myTheme in an application, pass it to the theme grid option

function FullFeaturedCrudGrid({ tableId, userData, users }) {
  const [rows, setRows] = React.useState<Task[]>([]);
  const { archive, role, dispatch } = useAppState();
  const fileInput = useRef<HTMLInputElement>(null);
  const [patchTask] = usePatchTaskMutation();
  const socket = useSocket();
  const { data: list, isLoading, isFetching} = useLoadSingleListQuery(tableId);

  useEffect(() => {
    if (!list || isLoading || isFetching) return;
    setRows(list?.tasks || []);
  }, [list, isLoading, isFetching]);

  // const handleUserInProject = useCallback((data) => {
  //     const list = data;
  //     console.log(list)
  //     Object.keys(list).forEach(key => {
  //       if (key === userData._id){
  //         delete list[key];
  //       }
  //     })
  //     console.log(list)
  //     // setIsOccupied(Object.values(list).includes(tableId));
  //   }, [])

  useEffect(() => {
    if (socket) {
      socket?.emit('selected_project', {
        id: tableId,
        user: localStorage.getItem('token'),
      });
      socket?.emit('send_users_in_project');
      // socket.on('user_in_project', handleUserInProject);

      // Return a cleanup function
      return () => {
        // socket.off('user_in_project', handleUserInProject);
      };
    }

    // If no socket is provided, return an empty cleanup function
    return () => {};
  }, [socket]);

  const columnDefs = useMemo(
    () => [
      {
        rowDrag: true,
        field: 'text' as keyof Task,
        headerName: 'Material',
        editable: true,
        flex: 1,
      },
      {
        field: 'article',
        headerName: 'Article №',
        editable: true,
        flex: 1,
      },
      {
        field: 'price',
        headerName: 'Price',
        editable: true,
        flex: 1,
      },
      {
        field: 'quantity',
        headerName: 'Quantity',
        editable: true,
        flex: 1,
      },
      {
        field: 'date',
        headerName: 'Date',
        editable: false,
        flex: 1,
        cellRenderer: (params) => {
          return params.value ? new Date(params.value).toLocaleString() : '';
        },
      },
      {
        field: 'unit',
        headerName: 'Unit',
        editable: true,
        flex: 1,
      },
      {
        field: 'comment',
        headerName: 'Comment',
        editable: true,
        flex: 1,
      },
      {
        field: 'deliveryDate',
        headerName: 'Delivery Date',
        editable: true,
        flex: 1,
        cellEditor: 'agDateCellEditor',
        cellEditorPopup: true,
        valueFormatter: (params) => {
          return params.value ? new Date(params.value).toLocaleDateString() : '';
        },
        filter: 'agDateColumnFilter',
        filterParams: {
          comparator: (filterLocalDateAtMidnight, cellValue) => {
            const dateAsString = cellValue;
            if (dateAsString == null) return -1;
            const dateParts = dateAsString.split('/');
            const cellDate = new Date(
              Number(dateParts[2]),
              Number(dateParts[1]) - 1,
              Number(dateParts[0])
            );
            if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
              return 0;
            }
            if (cellDate < filterLocalDateAtMidnight) {
              return -1;
            }
            if (cellDate > filterLocalDateAtMidnight) {
              return 1;
            }
            return 0;
          },
        },
      },
      {
        field: 'orderedBy',
        headerName: 'Ordered By',
        editable: true,
        flex: 1,
      },
      {
        field: 'status',
        headerName: 'Status',
        cellEditor: 'agSelectCellEditor',
        editable: true,
        flex: 1,
        resizable: false,
        cellEditorParams: {
          values: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
        },
      },
    ],
    []
  );

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
    }),
    []
  );

  const onCellValueChanged = (newRow: CellEditRequestEvent<Task>) => {
    const editedIndex = newRow.rowIndex as number;
    const column = newRow.colDef.field as string;
    const newRowData = newRow.newValue;
    const id = newRow.data._id;

    setRows(currentRows => {
      const newRows = [...currentRows];
      newRows[editedIndex] = {
        ...newRows[editedIndex],
        [column]: newRowData
      };
      return newRows;
    });

    patchTask({
      listId: tableId, 
      taskId: id as string,
      payload: {[column]: newRowData}
    });
  };

  return (
    <Box
      sx={{
        borderRadius: '10px',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        width: '100%',
      }}
    >
      <RightClickMenu
        options={[
          {
            name: 'Add new material',
            action: () => {
              console.log('add new material');
            },
          },
        ]}
      >
        {rows.length > 0 ? (
          <AgGridReact
          singleClickEdit
            rowData={rows}
            theme={myTheme}
            rowDragManaged={true}
            columnDefs={columnDefs as any}
            defaultColDef={defaultColDef}
            onCellEditRequest={onCellValueChanged}
            animateRows={true}
            readOnlyEdit={true}
          />
        ) : (
          <Box sx={{ width: '100%', height: 400 }}>
            <Skeleton variant="rectangular" height={50} sx={{ mb: 1 }} /> {/* Header */}
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={40} sx={{ mb: 0.5 }} /> /* Rows */
            ))}
          </Box>
        )}
      </RightClickMenu>
    </Box>
  );
}

export default FullFeaturedCrudGrid;
