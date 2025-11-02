import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Grid,
  Chip,
  Box,
  IconButton,
  LinearProgress,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { ListStats } from '../../store/api/listsApi';
import dayjs from 'dayjs';

interface StatsDialogProps {
  open: boolean;
  onClose: () => void;
  data: ListStats | undefined;
  loading: boolean;
}

export const StatsDialog = ({ open, onClose, data, loading }: StatsDialogProps) => {
  if (!data && !loading) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Typography variant="h6">Project Statistics</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {loading ? (
          <LinearProgress />
        ) : (
          data && (
            <Grid container spacing={3}>
              {/* Project Info Section */}
              <Grid size={12}>
                <Typography variant="h6" gutterBottom color="primary">
                  {data.listInfo.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Department: {data.listInfo.department}
                </Typography>
                <Chip
                  label={data.listInfo.isActive ? 'Active' : 'Inactive'}
                  color={data.listInfo.isActive ? 'success' : 'default'}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Grid>

              {/* Task Statistics Section */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  Task Statistics
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography>Total Tasks: {data.taskStats.total}</Typography>
                  <Typography>Total Value: ${data.taskStats.totalValue}</Typography>
                  <Typography>Average Price: ${data.taskStats.averagePrice.toFixed(2)}</Typography>
                  <Typography>Pending Deliveries: {data.taskStats.pendingDeliveries}</Typography>
                  <Typography color="error">
                    Overdue Tasks: {data.taskStats.overdueTasks}
                  </Typography>
                </Box>
              </Grid>

              {/* Status Breakdown Section */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  Status Breakdown
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {Object.entries(data.taskStats.byStatus).map(([status, count]) => (
                    <Box key={status} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ textTransform: 'capitalize' }}>{status}:</Typography>
                      <Typography>{count}</Typography>
                    </Box>
                  ))}
                </Box>
              </Grid>

              {/* Unique Values Section */}
              <Grid size={12}>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  Unique Values
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Ordered By
                    </Typography>
                    {data.uniqueValues.orderedBy.map((value, index) => (
                      <Chip
                        key={index}
                        label={value || 'Not specified'}
                        size="small"
                        sx={{ m: 0.5 }}
                      />
                    ))}
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Units
                    </Typography>
                    {data.uniqueValues.units.map((value, index) => (
                      <Chip
                        key={index}
                        label={value || 'Not specified'}
                        size="small"
                        sx={{ m: 0.5 }}
                      />
                    ))}
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Payment Methods
                    </Typography>
                    {data.uniqueValues.paymentMethods.map((value, index) => (
                      <Chip
                        key={index}
                        label={value || 'Not specified'}
                        size="small"
                        sx={{ m: 0.5 }}
                      />
                    ))}
                  </Grid>
                </Grid>
              </Grid>

              {/* Last Updated Section */}
              <Grid size={12}>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Last Updated: {dayjs(data.lastUpdated).format('MM/DD/YYYY hh:mm A')}
                </Typography>
              </Grid>
            </Grid>
          )
        )}
      </DialogContent>
    </Dialog>
  );
};
