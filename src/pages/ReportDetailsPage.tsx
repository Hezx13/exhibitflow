import { useParams } from 'react-router-dom';
import { useGetReportDetailsQuery } from '../store/api/reportsApi';
import { Box, Chip, Divider, FormControl, InputLabel, MenuItem, Select, Stack, Typography } from '@mui/material';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { useMemo, useState } from 'react';

import dayjs from 'dayjs';
import exhibitflowTheme from '../theme/grid';

const ReportDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useGetReportDetailsQuery(id!, {
    skip: !id,
  });
  
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [showAllProjects, setShowAllProjects] = useState<boolean>(false);

  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        headerName: 'Name',
        field: 'name',
        flex: 2,
      },
      {
        headerName: 'Article',
        field: 'article',
        flex: 1,
      },
      {
        headerName: 'Price',
        field: 'price',
        flex: 0.8,
        cellRenderer: (params) => (
          <Typography variant="body2" color="primary">
            {parseFloat(params.value).toFixed(2)}
          </Typography>
        ),
      },
      {
        headerName: 'Quantity',
        field: 'quantity',
        flex: 0.8,
      },
      {
        headerName: 'Unit',
        field: 'unit',
        flex: 0.8,
      },
      {
        headerName: 'Total',
        field: 'total',
        flex: 0.8,
        cellRenderer: (params) => (
          <Typography variant="body2" fontWeight={600}>
            {params.value}
          </Typography>
        ),
      },
      {
        headerName: 'Date',
        field: 'date',
        flex: 1,
      },
      {
        headerName: 'Status',
        field: 'status',
        flex: 0.8,
        cellRenderer: (params) => (
          <Chip
            label={params.value}
            color={params.value === 'done' ? 'success' : 'default'}
            size="small"
          />
        ),
      },
      {
        headerName: 'Project',
        field: 'listParent.name',
        flex: 1.5,
      },
      {
        headerName: 'Ordered By',
        field: 'orderedBy',
        flex: 1.5,
      },
    ],
    []
  );

  const rowData = useMemo(() => {
    if (!data?.materials) return [];
    
    let filtered = data.materials;
    
    if (selectedProject !== 'all') {
      filtered = filtered.filter(m => m.listParent?.id === selectedProject);
    }
    
    return filtered.map((material) => ({
      ...material,
      date: dayjs(material.date).format('DD/MM/YYYY'),
      total: (parseFloat(material.price) * material.quantity).toFixed(2),
    }));
  }, [data, selectedProject]);

  const totalAmount = useMemo(() => {
    if (!data?.materials) return 0;
    let filtered = data.materials;
    if (selectedProject !== 'all') {
      filtered = filtered.filter(m => m.listParent?.id === selectedProject);
    }
    return filtered.reduce(
      (sum, material) => sum + parseFloat(material.price) * material.quantity,
      0
    );
  }, [data, selectedProject]);

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography color="error">Error loading report details</Typography>;
  }

  if (!data) {
    return <Typography>No data available</Typography>;
  }

  const displayedProjects = showAllProjects 
    ? data.activeProjects 
    : data.activeProjects.slice(0, 8);
  
  const hasMoreProjects = data.activeProjects.length > 8;

  return (
    <Box display="flex" flexDirection="column" height="100vh">
      {/* Fixed Header Section */}
      <Box padding={3} paddingBottom={2}>
        <Stack spacing={3}>
          {/* Header and Summary */}
          <Box>
            <Typography variant="h4" gutterBottom>
              Report - {data.month.start} to {data.month.end}
            </Typography>
            
            <Stack direction="row" spacing={4} paddingY={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Payment
                </Typography>
                <Typography variant="h6">{data.payment}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Materials
                </Typography>
                <Typography variant="h6">{rowData.length}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Total
                </Typography>
                <Typography variant="h6" color="primary">
                  {totalAmount.toFixed(2)} AED
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Credit
                </Typography>
                <Typography variant="h6" color="error">
                  {data.credit.toFixed(2)} AED
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Projects
                </Typography>
                <Typography variant="h6">{data.activeProjects.length}</Typography>
              </Box>
            </Stack>
            
            <Divider />
          </Box>

          {/* Project Filter Chips */}
          <Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap maxHeight={showAllProjects ? 'none' : '80px'} overflow="hidden">
              {displayedProjects.map((project) => (
                <Chip
                  key={project.id}
                  label={project.name}
                  variant={selectedProject === project.id ? 'filled' : 'outlined'}
                  onClick={() => setSelectedProject(project.id)}
                  color={selectedProject === project.id ? 'primary' : 'default'}
                />
              ))}
              {selectedProject !== 'all' && (
                <Chip
                  label="Clear Filter"
                  variant="outlined"
                  color="error"
                  onDelete={() => setSelectedProject('all')}
                />
              )}
            </Stack>
            {hasMoreProjects && (
              <Box marginTop={1}>
                <Chip
                  label={showAllProjects ? 'Show Less' : `Show ${data.activeProjects.length - 8} More`}
                  variant="outlined"
                  size="small"
                  onClick={() => setShowAllProjects(!showAllProjects)}
                />
              </Box>
            )}
          </Box>
        </Stack>
      </Box>

      {/* Scrollable Table Section */}
      <Box flex={1} paddingX={3} paddingBottom={3} overflow="auto">
        <Box className="ag-theme-alpine-dark" height="100%">
          <AgGridReact
            columnDefs={columnDefs}
            rowData={rowData}
            theme={exhibitflowTheme}
            defaultColDef={{
              sortable: true,
              filter: false,
              resizable: true,
            }}
            animateRows={true}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default ReportDetailsPage;