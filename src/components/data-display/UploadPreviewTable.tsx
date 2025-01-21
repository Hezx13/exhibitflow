import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid2 as Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';

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
  const [selectedDepartment, setSelectedDepartment] = useState<number>(0);
  console.log(data);
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
        <Typography variant="h5">Tasks Overview</Typography>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          {/* Sidebar */}
          <Grid size={3}>
            <Paper elevation={2} sx={{ height: '100%' }}>
              <List>
                {data?.map((group, index) => (
                  <ListItem key={index} disablePadding>
                    <ListItemButton
                      selected={selectedDepartment === index}
                      onClick={() => setSelectedDepartment(index)}
                    >
                      <ListItemText 
                        primary={group.department}
                        secondary={group.text}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Table */}
          <Grid size={9}>
            <TableContainer component={Paper} sx={{ height: '100%' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Description</TableCell>
                    <TableCell>Article</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Delivery Date</TableCell>
                    <TableCell>Comment</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Payment</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data?.[selectedDepartment]?.tasks.map((task, index) => (
                    <TableRow key={index}>
                      <TableCell>{task.text}</TableCell>
                      <TableCell>{task.article || '-'}</TableCell>
                      <TableCell>{task.price || '-'}</TableCell>
                      <TableCell>{task.quantity}</TableCell>
                      <TableCell>{task.unit}</TableCell>
                      <TableCell>{dayjs(task.date).format('DD-MM-YYYY')}</TableCell>
                      <TableCell>{dayjs(task.deliveryDate).format('DD-MM-YYYY')}</TableCell>
                      <TableCell>{task.comment || '-'}</TableCell>
                      <TableCell>{task.status}</TableCell>
                      <TableCell>{task.payment || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};