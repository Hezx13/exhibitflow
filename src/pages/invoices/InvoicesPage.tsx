import { useState } from 'react';
import { Grid, Button, Stack, CircularProgress, Alert, Card, CardContent, Typography, Box, Tabs } from '@mui/material';
import FileUploadRoundedIcon from '@mui/icons-material/FileUploadRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import { useProcessOCRMutation, useOcrJobsQuery, useTestOCRMutation } from '../../store/api/ocrApi';
import JobsDisplay from './components/JobsDisplay';
import { useSnackbar } from 'notistack';

const InvoicesPage = () => {
  const [processResult, setProcessResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { enqueueSnackbar } = useSnackbar();
  // Test OCR endpoint
  const [testOcr, {isLoading, error: testError}] = useTestOCRMutation();

  // Process OCR mutation
  const [processOCR, { isLoading: processLoading, error: processError }] = useProcessOCRMutation();

  const handleTestOCR = async () => {
    setError(null);
    setProcessResult(null);
    
    await testOcr();
    enqueueSnackbar('The processing job has been requested', {
          variant: 'success',
          autoHideDuration: 5000,
        });
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
      <Grid size={12}>
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
                  startIcon={isLoading ? <CircularProgress size={20} /> : <AutoFixHighRoundedIcon />}
                  onClick={handleTestOCR}
                  disabled={isLoading || processLoading}
                  fullWidth
                >
                  Test OCR (GET)
                </Button>

                <Button
                  variant="contained"
                  color="success"
                  startIcon={processLoading ? <CircularProgress size={20} /> : <FileUploadRoundedIcon />}
                  onClick={handleProcessOCR}
                  disabled={isLoading || processLoading}
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
