import { useEffect, useState } from 'react';
import { Grid } from '@mui/material';
import CardComponent from '../components/cardComponent';
import ReportGenerationDialog from '../components/ReportGenerationDialog';
import ReportTable from '../components/ReportsTable';
import { useReport } from '../state/reportsContext'; // Adjust the import to your file structure
import { Navigate } from 'react-router-dom';
import { Report } from '../store/api/reportsApi';

const ReportsPage = () => {
  const { reports } = useReport();
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (reports)
    calculateTotalReports(reports);
  }, [reports]);

  function calculateTotalReports(reports: Report[]) {
    if (!reports) return 0;
    let total = 0;
    for (let report of reports) {
      total +=
        report.debit.reduce((a, b) => {
          return a + b.debit || 0;
        }, 0) - report.credit;
    }
    setBalance(total);
  }

  return (
    <>
      <Grid container>
        <Grid item xs={12} sx={{ marginBottom: '15px' }}>
          <Grid container justifyContent="center" spacing={8}>
            <Grid item xl={2}>
              {reports?.length ? (
                <CardComponent
                  textColor={balance >= 0 ? 'green' : 'red'}
                  text="Start of month balance"
                  amount={balance.toFixed(2)}
                />
              ) : null}
            </Grid>
            <Grid item xl={2}>
              <ReportGenerationDialog />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} sx={{ marginBottom: '15px' }}>
          {reports?.length ? <ReportTable data={reports} /> : null}
        </Grid>
      </Grid>
    </>
  );
};

export default ReportsPage;
