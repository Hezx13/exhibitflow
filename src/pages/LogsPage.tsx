import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Toolbar,
  InputAdornment,
  Skeleton,
} from '@mui/material';
import {
  Search,
  FilterList,
  Refresh,
} from '@mui/icons-material';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridReadyEvent, GridApi } from 'ag-grid-community';
import { motion } from 'motion/react';
import { 
  useGetLogsQuery, 
  LogEntry,
  LogsQueryParams 
} from '../store/api/logsApi';
import myTheme from '../theme/grid';

export default function LogsPage() {
  const [queryParams, setQueryParams] = useState<LogsQueryParams>({
    page: 1,
    limit: 100,
    sortBy: 'timestamp',
    sortOrder: 'desc'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data: logsData, isLoading, error, refetch } = useGetLogsQuery({
    ...queryParams,
    endpoint: searchTerm || undefined,
    method: methodFilter || undefined,
    status: statusFilter || undefined,
  });

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const columnDefs: ColDef[] = useMemo(() => [
    {
      headerName: 'Timestamp',
      field: 'timestamp',
      flex: 1,
      minWidth: 180,
      valueFormatter: (params) => new Date(params.value).toLocaleString(),
      sort: 'desc',
    },
    {
      headerName: 'Body',
      field: 'requestBody',
      flex: 1,
      minWidth: 150,
      valueFormatter: (params) => JSON.stringify(params.value),
    },
    {
      headerName: 'Method',
      field: 'method',
      flex: 1,
      minWidth: 100,
    },
    {
      headerName: 'Endpoint',
      field: 'endpoint',
      flex: 2,
      minWidth: 200,
      cellStyle: { fontFamily: 'monospace', fontSize: '0.875rem' },
    },
    {
      headerName: 'Status',
      field: 'responseStatus',
      flex: 1,
      minWidth: 100,
    },
    {
      headerName: 'Duration',
      field: 'executionTime',
      flex: 1,
      minWidth: 120,
      valueFormatter: (params) => `${params.value}ms`,
    },
    {
      headerName: 'User',
      field: 'userId',
      flex: 1,
      minWidth: 150,
      valueFormatter: (params) => params.value?.username || 'Anonymous',
    },
    {
      headerName: 'IP Address',
      field: 'ip',
      flex: 1,
      minWidth: 140,
    },
  ], []);

  const onGridReady = useCallback((params: GridReadyEvent) => {
    setGridApi(params.api);
  }, []);

  const onSelectionChanged = useCallback((event: any) => {
    const selectedRows = event.api.getSelectedRows();
    setSelectedIds(selectedRows.map((row: LogEntry) => row._id));
  }, []);

  const handleFilterChange = useCallback((filters: Partial<LogsQueryParams>) => {
    setQueryParams(prev => ({
      ...prev,
      ...filters,
      page: 1, // Reset to first page when filtering
    }));
  }, []);

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          API Request Logs
        </Typography>
        
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Skeleton variant="rectangular" height={80} />
          </CardContent>
        </Card>

        <Card>
          <Box sx={{ p: 2 }}>
            <Skeleton variant="rectangular" height={50} sx={{ mb: 1 }} />
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={40} sx={{ mb: 0.5 }} />
            ))}
          </Box>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        API Request Logs
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Toolbar sx={{ pl: 0, pr: 0 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search by endpoint..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleFilterChange({ endpoint: searchTerm || undefined });
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Method</InputLabel>
                  <Select
                    value={methodFilter}
                    label="Method"
                    onChange={(e) => {
                      setMethodFilter(e.target.value);
                      handleFilterChange({ method: e.target.value || undefined });
                    }}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="GET">GET</MenuItem>
                    <MenuItem value="POST">POST</MenuItem>
                    <MenuItem value="PUT">PUT</MenuItem>
                    <MenuItem value="DELETE">DELETE</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      handleFilterChange({ status: e.target.value || undefined });
                    }}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="2xx">Success (2xx)</MenuItem>
                    <MenuItem value="4xx">Client Error (4xx)</MenuItem>
                    <MenuItem value="5xx">Server Error (5xx)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <IconButton onClick={() => handleFilterChange({})}>
                    <FilterList />
                  </IconButton>
                  <IconButton onClick={handleRefresh}>
                    <Refresh />
                  </IconButton>
                </Box>
              </Grid>
            </Grid>
          </Toolbar>
        </CardContent>
      </Card>

      <Box
        sx={{
          borderRadius: '10px',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          width: '100%',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{ width: '100%', height: '600px' }}
        >
          <AgGridReact
            rowData={logsData?.logs || []}
            columnDefs={columnDefs}
            theme={myTheme}
            getRowId={(params) => params.data._id}
            defaultColDef={{
              sortable: true,
              filter: true,
              headerComponentParams: {}
            }}
            onGridReady={onGridReady}
            animateRows={true}
            cellSelection={true}
            rowSelection={{
              mode: 'multiRow',
              headerCheckbox: true,
            }}
            onSelectionChanged={onSelectionChanged}
          />
        </motion.div>
      </Box>
        
      {logsData?.pagination && (
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Total: {logsData.pagination.totalLogs} logs
            {selectedIds.length > 0 && ` | Selected: ${selectedIds.length}`}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Page {logsData.pagination.currentPage} of {logsData.pagination.totalPages}
          </Typography>
        </Box>
      )}
    </Box>
  );
}