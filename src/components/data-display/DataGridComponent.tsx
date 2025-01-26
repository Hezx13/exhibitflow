import { useEffect } from 'react';
import Box from '@mui/material/Box';
import { useSocket } from '../../state/socketContext';
import { AgGridReact } from 'ag-grid-react';
import { RightClickMenu } from '../actions/RigtClickMenu';
import myTheme from '../../theme/grid';
import { Skeleton } from '@mui/material';
import useDatagrid from './hooks/useDatagrid';
import { useAddTaskMutation } from '../../store/api/listsApi';
// to use myTheme in an application, pass it to the theme grid option

function FullFeaturedCrudGrid({ tableId }: { tableId: string }) {
  const { rows, columnDefs, onCellValueChanged, processRowDrag, isLoading } = useDatagrid(tableId);
  const [addTask] = useAddTaskMutation();

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', height: 400 }}>
        <Skeleton variant="rectangular" height={50} sx={{ mb: 1 }} /> {/* Header */}
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={40} sx={{ mb: 0.5 }} /> /* Rows */
        ))}
      </Box>
    );
  }

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
              addTask({ listId: tableId });
            },
          },
        ]}
      >
        {' '}
        <AgGridReact
          singleClickEdit
          rowData={rows}
          theme={myTheme}
          rowDragManaged={true}
          columnDefs={columnDefs as any}
          getRowId={(params) => params.data._id}
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
      </RightClickMenu>
    </Box>
  );
}

export default FullFeaturedCrudGrid;
