import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Typography,
  IconButton,
  Stack,
} from '@mui/material';
import dayjs from 'dayjs';
import { AgGridReact } from 'ag-grid-react';
import myTheme from '../../theme/grid';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SaveAsRoundedIcon from '@mui/icons-material/SaveAsRounded';

interface Task {
  text: string;
  article: string | number;
  price: number | null;
  quantity: number;
  date: string;
  unit: string;
  comment?: string;
  deliveryDate: string | null;
  orderedBy: string;
  status: string;
  payment?: string;
}

interface TaskGroup {
  department: string;
  text: string;
  tasks: Task[];
}

interface TasksDialogProps {
  open: boolean;
  onClose: () => void;
  data: TaskGroup[];
}

export const UploadPreviewTable: React.FC<TasksDialogProps> = ({ open, onClose, data }) => {
  const [selectedPage, setSelectedPage] = useState<number>(0);

  const columnDefs = [
    { field: 'text', headerName: 'Description' },
    { field: 'article', headerName: 'Article' },
    { field: 'price', headerName: 'Price' },
    { field: 'quantity', headerName: 'Quantity' },
    { field: 'unit', headerName: 'Unit' },
    { 
      field: 'date', 
      headerName: 'Date',
      valueFormatter: (params: any) => dayjs(params.value).format('DD-MM-YYYY')
    },
    { 
      field: 'deliveryDate', 
      headerName: 'Delivery Date',
      valueFormatter: (params: any) => params.value ? dayjs(params.value).format('DD-MM-YYYY') : '-'
    },
    { field: 'comment', headerName: 'Comment' },
    { field: 'status', headerName: 'Status' },
    { field: 'payment', headerName: 'Payment' }
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: { height: '90vh' }
      }}
    >
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">Tasks Overview</Typography>
          <Stack direction="row" gap={1}>
            <IconButton>
              <SaveAsRoundedIcon />
            </IconButton>
            <IconButton onClick={onClose}>
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', overflow: 'hidden', gap: 2 }}>
        {/* Sidebar */}
        <Paper
          variant="outlined"
          sx={{ 
            width: '25%',
            overflow: 'auto',
            flexShrink: 0,
            px: 0.5,
          }}
        >
          <List>
            {data?.map((group, index) => (
              <ListItem key={index} disablePadding>
                <ListItemButton
                  selected={selectedPage === index}
                  onClick={() => setSelectedPage(index)}
                >
                  <ListItemText 
                    primary={group.text}
                    secondary={`${group.tasks.length} items`}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>

        <div 
          style={{ 
            flexGrow: 1,
            height: '100%',
            minWidth: 0
          }}
        >
          <AgGridReact
            columnDefs={columnDefs as any}
            theme={myTheme}
            rowData={data?.[selectedPage]?.tasks || []}
            suppressCellFocus={true}
            defaultColDef={{
              sortable: true,
              filter: true,
              resizable: true,
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};