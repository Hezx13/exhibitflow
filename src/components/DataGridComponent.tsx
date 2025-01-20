import React, { useEffect, useState, useRef, memo, useCallback, useMemo } from 'react';
import Box from '@mui/material/Box';
import { findItemIndexById } from '../utils/arrayUtils';
import { addTask, editTask, moveFromArchive, removeTask } from '../state/actions';
import { getCurrentDateAndTime } from '../utils/timeUtils';
import { AddNewItem } from './AddNewItem';
import { useAppState } from '../state/AppStateContext';
import NoDataPlaceholder from './DataGridComponents/NoDataPlaceholder';
import { useSocket } from '../state/socketContext';
import { AgGridReact } from 'ag-grid-react';
import { themeQuartz } from 'ag-grid-community';
import { RightClickMenu } from './actions/RigtClickMenu';
import { useLoadSingleListQuery } from '../store/api/listsApi';

// to use myTheme in an application, pass it to the theme grid option
const myTheme = themeQuartz.withParams({
  accentColor: '#D17E08',
  backgroundColor: '#14141460',
  borderColor: '#1F1F1F',
  borderRadius: 2,
  browserColorScheme: 'dark',
  cellHorizontalPaddingScale: 0.5,
  chromeBackgroundColor: {
    ref: 'backgroundColor',
  },
  columnBorder: true,
  fontFamily: {
    googleFont: 'Archivo',
  },
  fontSize: 15,
  foregroundColor: '#CECECE',
  headerBackgroundColor: '#141414',
  headerFontFamily: 'inherit',
  headerFontSize: 13,
  headerFontWeight: 400,
  headerTextColor: '#CECECE',
  rowBorder: true,
  rowVerticalPaddingScale: 0.6,
  sidePanelBorder: true,
  spacing: 6,
  wrapperBorder: true,
  wrapperBorderRadius: 8,
});

function FullFeaturedCrudGrid({ tableId, userData, users }) {
  const [rows, setRows] = React.useState<Task[]>([]);
  const { archive, role, dispatch } = useAppState();
  const fileInput = useRef<HTMLInputElement>(null);
  const socket = useSocket();
  const { data: list } = useLoadSingleListQuery(tableId);

  useEffect(() => {
    if (!list) return;
    setRows(list?.tasks || []);
  }, [list]);

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

  const onCellValueChanged = (params) => {
    const newRow = params.data;
    dispatch(
      editTask(
        newRow.id,
        tableId,
        newRow.text,
        newRow.article,
        newRow.price,
        newRow.quantity,
        new Date(newRow.date),
        newRow.unit,
        newRow.comment,
        new Date(newRow.deliveryDate),
        newRow.orderedBy,
        newRow.status,
        newRow.payment
      )
    );

    socket?.emit('send_updated_materials', { projectId: tableId, material: newRow });
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
            rowData={rows}
            theme={myTheme}
            rowDragManaged={true}
            columnDefs={columnDefs as any}
            defaultColDef={defaultColDef}
            onCellValueChanged={onCellValueChanged}
            rowSelection="multiple"
            animateRows={true}
            cellSelection
          />
        ) : (
          <NoDataPlaceholder>
            <AddNewItem
              toggleButtonText="+ Add another material"
              onAdd={(text, article, price, quantity, unit, comment, deliveryDate, orderedBy) => {
                dispatch(moveFromArchive(tableId));
                dispatch(
                  addTask(
                    text,
                    tableId,
                    article || '',
                    price || '0',
                    quantity || 1,
                    getCurrentDateAndTime(),
                    unit || 'pcs',
                    comment || '',
                    deliveryDate ? new Date(deliveryDate) : getCurrentDateAndTime(),
                    userData?.username || 'Anonymus',
                    'Pending',
                    ''
                  )
                );
              }}
            />
            {/* <AddItemButton onClick={handleUploadClick} dark excel>
              Excel import
          </AddItemButton>
          <input
              type="file"
              ref={fileInput}
              style={{ display: 'none' }}
              onChange={handleFileChange}
          /> */}
          </NoDataPlaceholder>
        )}
      </RightClickMenu>
    </Box>
  );
}

export default FullFeaturedCrudGrid;
