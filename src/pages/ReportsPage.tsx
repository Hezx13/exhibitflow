import { useEffectEvent, useEffect, useState } from 'react';
import { Grid } from '@mui/material';
import CardComponent from '../components/cardComponent';
import ReportGenerationDialog from '../components/ReportGenerationDialog';
import ReportTable from '../components/ReportsTable';
import { useReport } from '../state/reportsContext'; // Adjust the import to your file structure
import { Report } from '../store/api/reportsApi';
import { useReportNotifications } from '../hooks/useReportNotifications';

const ReportsPage = () => {
  const { reports, refetch } = useReport();
  const [balance, setBalance] = useState(0);
  
  useReportNotifications();

  useEffect(() => {
    if (reports)
    calculateTotalReports(reports);
  }, [reports]);
  
  const handleReportGenerated = useEffectEvent(() => {
    refetch();
  });


  useEffect(() => {
    
    window.addEventListener('report-generated', handleReportGenerated);
    
    return () => {
      window.removeEventListener('report-generated', handleReportGenerated);
    };
  }, []);

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
    <Grid container spacing={2}>
      <Grid container size={12} justifyContent="center" spacing={3}>
        {reports?.length ? (
          <Grid>
            <CardComponent
              textColor={balance >= 0 ? 'green' : 'red'}
              text="Start of month balance"
              amount={balance.toFixed(2)}
            />
          </Grid>
        ) : null}
        <Grid>
          <ReportGenerationDialog />
        </Grid>
      </Grid>
      {reports?.length ? (
        <Grid size={12}>
          <ReportTable data={reports} />
        </Grid>
      ) : null}
    </Grid>
  );
};

export default ReportsPage;
