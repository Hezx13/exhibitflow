import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import exhibitflowTheme from '../theme/grid';

import {
  Box,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  MenuItem,
  Stack,
  Select,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import { useGenerateReportMutation, useLazyDownloadReportQuery } from '../store/api/reportsApi';

const ReportTable = ({ data }) => {
  const navigate = useNavigate();
  const [downloadReport] = useLazyDownloadReportQuery();
  const [generateReport] = useGenerateReportMutation();
  const [payment, setPayment] = useState('');
  const [filteredData, setFilteredData] = useState(data);
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  useEffect(() => {
    if (payment) {
      let extractedData = data.filter((report) => report.payment === payment);
      setFilteredData(extractedData);
    } else {
      setFilteredData(data);
    }
  }, [payment, data]);

  const handleExpandToTable = async (month, pay, id) => {
   navigate(`/reports/${id}`);
  };
  const handleRegenerateReport = async (params) => {
    await generateReport({ periodStart: params.data.month.start, periodEnd: params.data.month.end, payment:params.data.payment })
  }

  const handleDownloadReport = async (id) => {
  const res = await downloadReport({id});
    if (!res.data) return;
    const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');  };

  const columnDefs: ColDef[] = useMemo(() => [
    {
      headerName: 'Month',
      field: 'monthDisplay',
      cellRenderer: (params) => {
        return (
          <Typography
            variant="body2"
            sx={{ cursor: 'pointer', color: 'primary.main', textDecoration: 'underline' }}
            onClick={() => handleExpandToTable(params.data.month, params.data.payment, params.data._id)}
          >
            {params.value}
          </Typography>
        );
      },
      flex: 1,
    },
    {
      headerName: 'Debit',
      field: 'debit',
      cellRenderer: (params) => {
        const value = params.value.reduce((a, b) => {
          return a + b.debit || 0;
        },0).toFixed(2);
       return ( <Typography variant="body2" color="green">
        {value}
        </Typography>
      )
      },
      flex: 1,
    },
    {
      headerName: 'Credit',
      field: 'creditAmount',
      cellRenderer: (params) => (
        <Typography variant="body2" color="red">
          {params.value}
        </Typography>
      ),
      flex: 1,
    },
    {
      headerName: 'Active Projects Count',
      field: 'activeProjectsCount',
      flex: 1,
    },
    {
      headerName: 'Materials Count',
      field: 'materials',
      flex: 1,
    },
    {
      headerName: 'Actions',
      field: 'actions',
      cellRenderer: (params) => (
        <>
        <IconButton onClick={() => handleDownloadReport(params.data._id)} size="small">
          <DownloadIcon htmlColor="#008000" />
        </IconButton>
        <IconButton onClick={()=>handleRegenerateReport(params)} size="small">
          <ReplayRoundedIcon htmlColor="#008000" />
        </IconButton>
        </>
      ),
      flex: 0.5,
      sortable: false,
      filter: false,
    },
  ], []);

  const rowData = useMemo(() => {
    return filteredData.map((data) => ({
      ...data,
      monthDisplay: months[Number(data.month.start.split('-')[1][1]) - 1] +
        ' ' +
        data.month.start.split('-')[2] +
        ' ' +
        data.payment,
      debitAmount: data.debit
        .reduce((a, b) => {
          return a.amount || a + b.amount || 0 || 0;
        }, 0)
        .toFixed(2),
      creditAmount: data.credit.toFixed(2),
      activeProjectsCount: data.activeProjects.length,
    }));
  }, [filteredData, months]);

  return (
    <Box>
      <Stack direction="row" spacing={2} alignItems="center" marginBottom={2}>
        <FormControl variant="standard" size="small" style={{ minWidth: 160 }}>
          <InputLabel>Payment</InputLabel>
          <Select
            value={payment}
            onChange={(e) => setPayment(e.target.value as string)}
            label="Payment"
            size="small"
          >
            <MenuItem value="cash">Cash</MenuItem>
            <MenuItem value="card">Card</MenuItem>
            <MenuItem value="credit">Credit</MenuItem>
            <MenuItem value="bank transfer">Bank Transfer</MenuItem>
            <MenuItem value="pemo card">Pemo card</MenuItem>
            <MenuItem value="">SHOW ALL</MenuItem>
          </Select>
        </FormControl>
      </Stack>
      
      <Box className="ag-theme-alpine-dark" style={{ height: 600, width: '100%' }}>
        <AgGridReact
          columnDefs={columnDefs}
          rowData={rowData}
          domLayout="autoHeight"
          theme={exhibitflowTheme}
          defaultColDef={{
            sortable: true,
            filter: true,
            resizable: true,
          }}
          pagination={true}
          paginationPageSize={20}
        />
      </Box>
    </Box>
  );
};

export default ReportTable;
