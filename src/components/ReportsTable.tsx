import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  MenuItem,
} from '@mui/material';
import {
  StyledTableCell,
  SyledListButton,
  StyledSelectDark,
  StyledTableContainer,
} from '../styles/styles';
import { downloadReport } from '../api';
import DownloadIcon from '@mui/icons-material/Download';

const ReportTable = ({ data, updateCall }) => {
  const navigate = useNavigate();
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

  const handleExpandToTable = (month, pay) => {
    navigate('/report', { state: { reports: data, period: month, payment: pay } });
  };

  const handleDownloadReport = (per, payment) => {
    downloadReport(per, payment);
  };

  return (
    <StyledTableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Month</TableCell>
            <TableCell>Debit</TableCell>
            <TableCell>Credit</TableCell>
            <TableCell>Active Projects Count</TableCell>
            <TableCell>Materials Count</TableCell>
            <TableCell>
              <FormControl variant="filled" style={{ margin: '0 10px', width: '120px' }}>
                <InputLabel sx={{ color: 'orange' }}>Payment</InputLabel>
                <StyledSelectDark
                  value={payment}
                  onChange={(e) => setPayment(e.target.value as string)}
                  label="Month"
                  size="small"
                  margin="dense"
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="card">Card</MenuItem>
                  <MenuItem value="credit">Credit</MenuItem>
                  <MenuItem value="bank transfer">Bank Transfer</MenuItem>
                  <MenuItem value="pemo card">Pemo card</MenuItem>
                  <MenuItem value="">SHOW ALL</MenuItem>
                </StyledSelectDark>
              </FormControl>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredData.map((data, index) => (
            <TableRow key={index}>
              <StyledTableCell>
                <SyledListButton
                  onClick={() => {
                    handleExpandToTable(data.month, data.payment);
                  }}
                >
                  {months[Number(data.month.start.split('-')[1][1]) - 1] +
                    ' ' +
                    data.month.start.split('-')[2] +
                    ' ' +
                    data.payment}
                </SyledListButton>
              </StyledTableCell>

              <TableCell>
                <Typography variant="body2" color="green">
                  {data.debit
                    .reduce((a, b) => {
                      return a.amount || a + b.amount || 0 || 0;
                    }, 0)
                    .toFixed(2)}
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant="body2" color="red">
                  {data.credit.toFixed(2)}
                </Typography>
              </TableCell>

              <TableCell>{data.activeProjects.length}</TableCell>

              <TableCell>{data.materials.length}</TableCell>

              <TableCell>
                <IconButton onClick={() => handleDownloadReport(data.month.start, data.payment)}>
                  <DownloadIcon htmlColor="#008000" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
          {/* Add more rows as needed */}
        </TableBody>
      </Table>
    </StyledTableContainer>
  );
};

export default ReportTable;
