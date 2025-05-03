import Box from '@mui/material/Box';
import { AgGridReact } from 'ag-grid-react';
import { RightClickMenu } from '../actions/RigtClickMenu';
import myTheme from '../../theme/grid';
import { Skeleton } from '@mui/material';
import useDatagrid from './hooks/useDatagrid';
import { useAddTaskMutation } from '../../store/api/listsApi';
import { motion } from 'motion/react';
import { useSelection } from './GridSelection.context';

function FullFeaturedCrudGrid({ tableId }: { tableId: string }) {
  const { rows, columnDefs, onCellValueChanged, processRowDrag, isLoading } = useDatagrid(tableId);
  const [addTask] = useAddTaskMutation();
  const { setSelectedIds } = useSelection();

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

  const onSelectionChanged = (event: any) => {
    const selectedRows = event.api.getSelectedRows();
    setSelectedIds(selectedRows.map((row: any) => row._id));
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
              addTask({ listId: tableId });
            },
          },
        ]}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{ width: '100%', height: '100%' }}
        >
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
              headerComponentParams: {
              }
            }}
            onCellEditRequest={onCellValueChanged}
            onRowDragEnd={processRowDrag}
            onRowDragLeave={processRowDrag}
            animateRows={true}
            cellSelection={true}
            rowSelection={{
              mode: 'multiRow',
              headerCheckbox: true,
            }}
            readOnlyEdit={true}
            onSelectionChanged={onSelectionChanged}
          />
        </motion.div>
      </RightClickMenu>
    </Box>
  );
}

export default FullFeaturedCrudGrid;
