import { useState } from 'react';
import { useGenerateReportMutation } from '../store/api/reportsApi';
import {
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import SummarizeRoundedIcon from '@mui/icons-material/SummarizeRounded';
import dayjs from 'dayjs';

const ReportGenerationDialog = () => {
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [payment, setPayment] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateReport] = useGenerateReportMutation();
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

  function getFirstAndLastDay(selectedMonth: string, selectedYear: string) {
    const monthIndex = months.indexOf(selectedMonth);
    if (monthIndex < 0) {
      throw new Error('Selected month is not valid');
    }

    const periodStart = dayjs(new Date(Number(selectedYear), monthIndex, 1)).format('YYYY-MM-DD');
    const periodEnd = dayjs(new Date(Number(selectedYear), monthIndex + 1, 0)).format('YYYY-MM-DD');

    return { periodStart, periodEnd };
  }
  async function handleGenerateReport() {
    if (!month || !year || !payment) {
      return;
    }

    setIsGenerating(true);

    try {
      const { periodStart, periodEnd } = getFirstAndLastDay(month, year);
      await generateReport({ periodStart, periodEnd, payment });
    } catch (err) {
      console.error('An error occurred:', err);
    } finally {
      setIsGenerating(false);
    }
  }

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 4 }, (_, i) => currentYear - i);
  const isActionDisabled = !month || !year || !payment || isGenerating;

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack gap={3} justifyContent="center">
          <Stack spacing={0.5}>
            <Typography variant="h6">
              {isGenerating ? 'Generating report…' : 'Monthly report'}
            </Typography>
          </Stack>

          <Stack direction="row" gap={2} flexWrap="wrap" useFlexGap alignItems="center">
            <FormControl variant="outlined" size="small" sx={{ width: 140 }}>
              <InputLabel>Month</InputLabel>
              <Select
                value={month}
                onChange={(e) => setMonth(e.target.value as string)}
                label="Month"
              >
                {months.map((m) => (
                  <MenuItem key={m} value={m}>
                    {m}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl variant="outlined" size="small" sx={{ width: 140 }}>
              <InputLabel>Year</InputLabel>
              <Select
                value={year}
                onChange={(e) => setYear(e.target.value as string)}
                label="Year"
              >
                {years.map((y) => (
                  <MenuItem key={y} value={String(y)}>
                    {y}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl variant="outlined" size="small" sx={{ width: 140 }}>
              <InputLabel>Payment</InputLabel>
              <Select
                value={payment}
                onChange={(e) => setPayment(e.target.value as string)}
                label="Payment"
              >
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="card">Card</MenuItem>
                <MenuItem value="credit">Credit</MenuItem>
                <MenuItem value="bank transfer">Bank Transfer</MenuItem>
                <MenuItem value="pemo card">Pemo Card</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              disabled={isActionDisabled}
              onClick={handleGenerateReport}
              startIcon={<SummarizeRoundedIcon />}
              sx={{ width: 140 }}
            >
              {isGenerating ? 'Generating…' : 'Generate'}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ReportGenerationDialog;
