import { useState } from 'react';
import { Grid, Button, Stack, CircularProgress, Alert, Card, CardContent, Typography, Box } from '@mui/material';
import CardComponent from '../../components/cardComponent';
import FileUploadRoundedIcon from '@mui/icons-material/FileUploadRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import { useTestOCRQuery, useProcessOCRMutation, useOcrJobsQuery } from '../../store/api/ocrApi';
import JobsDisplay from './components/JobsDisplay';

const InvoicesPage = () => {
  const [testTrigger, setTestTrigger] = useState(false);
  const [processResult, setProcessResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Test OCR endpoint
  const { data: testData, isLoading: testLoading, error: testError, refetch: refetchTest } = useTestOCRQuery(
    undefined,
    { skip: !testTrigger }
  );

  // Process OCR mutation
  const [processOCR, { isLoading: processLoading, error: processError }] = useProcessOCRMutation();

  const handleTestOCR = async () => {
    setTestTrigger(true);
    setError(null);
    setProcessResult(null);
    await refetchTest();
  };

  const handleProcessOCR = async () => {
    setError(null);
    setProcessResult(null);
    try {
      const result = await processOCR({ imagePath: '/test-image.jpg' }).unwrap();
      setProcessResult(result.result);
    } catch (err: any) {
      setError(err?.data?.error || 'Failed to process OCR');
    }
  };

  return (
    <Grid container spacing={3}>
      {/* Header Card */}
      <Grid size={12}>
        <CardComponent
          text="Invoice OCR Processing"
          secondaryText="Test and process invoices with OCR"
          icon={<FileUploadRoundedIcon fontSize="large" />}
        />
      </Grid>
      
      <Grid size={12}>
        <JobsDisplay />
      </Grid>
      {/* Test Buttons */}
      <Grid size={12}>
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight="600">
                Test Endpoints
              </Typography>

              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  startIcon={testLoading ? <CircularProgress size={20} /> : <AutoFixHighRoundedIcon />}
                  onClick={handleTestOCR}
                  disabled={testLoading || processLoading}
                  fullWidth
                >
                  Test OCR (GET)
                </Button>

                <Button
                  variant="contained"
                  color="success"
                  startIcon={processLoading ? <CircularProgress size={20} /> : <FileUploadRoundedIcon />}
                  onClick={handleProcessOCR}
                  disabled={testLoading || processLoading}
                  fullWidth
                >
                  Process OCR (POST)
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Error Display */}
      {(error || testError || processError) && (
        <Grid size={12}>
          <Alert severity="error">
            {error || (testError as any)?.data?.error || (processError as any)?.data?.error || 'An error occurred'}
          </Alert>
        </Grid>
      )}

      {/* Test Results */}
      {testData && (
        <Grid size={12}>
          <Card sx={{ backgroundColor: 'success.light' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" mb={2}>
                Test Results ✓
              </Typography>
              <Box
                component="pre"
                sx={{
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  p: 2,
                  borderRadius: 1,
                  overflow: 'auto',
                  fontSize: '0.875rem',
                  fontFamily: 'monospace',
                  maxHeight: '400px',
                }}
              >
                {JSON.stringify(testData, null, 2)}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Process Results */}
      {processResult && (
        <Grid size={12}>
          <Card sx={{ backgroundColor: 'info.light' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" mb={2}>
                Processing Results ✓
              </Typography>
              <Box
                component="pre"
                sx={{
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  p: 2,
                  borderRadius: 1,
                  overflow: 'auto',
                  fontSize: '0.875rem',
                  fontFamily: 'monospace',
                  maxHeight: '400px',
                }}
              >
                {processResult}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );
};

export default InvoicesPage;
