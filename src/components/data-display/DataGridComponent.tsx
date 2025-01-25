import { useEffect } from 'react';
import Box from '@mui/material/Box';
import { useSocket } from '../../state/socketContext';
import { AgGridReact } from 'ag-grid-react';
import { RightClickMenu } from '../actions/RigtClickMenu';
import myTheme from '../../theme/grid';
import { Skeleton } from '@mui/material';
import useDatagrid from './hooks/useDatagrid';

// to use myTheme in an application, pass it to the theme grid option

function FullFeaturedCrudGrid({ tableId }) {
  const socket = useSocket();
  const { rows, columnDefs, onCellValueChanged, processRowDrag } = useDatagrid(tableId);

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
            defaultColDef={{
              sortable: true,
              filter: true,
            }}
            onCellEditRequest={onCellValueChanged}
            onRowDragEnd={processRowDrag}
            onRowDragLeave={processRowDrag}
            animateRows={true}
            rowSelection={{
              mode: 'multiRow',
              headerCheckbox: true,
            }}
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
