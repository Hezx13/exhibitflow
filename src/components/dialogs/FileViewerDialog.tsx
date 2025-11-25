import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, CircularProgress, Typography } from '@mui/material';
import { useEffect, useState, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import exhibitflowTheme from '../../theme/grid';

interface FileViewerDialogProps {
  open: boolean;
  onClose: () => void;
  fileId: string | null;
  fileName: string;
  fileType: string; // MIME type or extension
}

export default function FileViewerDialog({ open, onClose, fileId, fileName, fileType }: FileViewerDialogProps) {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<string | null>(null);
  const [gridData, setGridData] = useState<any[]>([]);
  const [gridCols, setGridCols] = useState<ColDef[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Helper to determine how to handle the file
  const viewerType = useMemo(() => {
    const lowerName = fileName.toLowerCase();
    if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls')) return 'excel';
    if (lowerName.endsWith('.csv')) return 'csv';
    if (lowerName.endsWith('.pdf')) return 'pdf';
    if (lowerName.match(/\.(jpg|jpeg|png|gif|webp)$/)) return 'image';
    if (lowerName.match(/\.(txt|json|md|xml)$/)) return 'text';
    return 'unknown';
  }, [fileName]);

  useEffect(() => {
    if (!open || !fileId) {
      // Reset state when closed
      setContent(null);
      setGridData([]);
      setGridCols([]);
      setError(null);
      return;
    }

    const fetchFile = async () => {
      setLoading(true);
      setError(null);
      try {
        // TODO: Use env var or constant for base URL
        const response = await fetch(`http://localhost:4501/api/files/${fileId}`);
        if (!response.ok) throw new Error('Failed to fetch file');

        const blob = await response.blob();

        if (viewerType === 'excel') {
          const arrayBuffer = await blob.arrayBuffer();
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length > 0) {
            const headers = jsonData[0] as string[];
            const rows = jsonData.slice(1).map((row: any) => {
              const rowData: any = {};
              headers.forEach((header, index) => {
                rowData[header] = row[index];
              });
              return rowData;
            });

            setGridCols(headers.map(h => ({ field: h, headerName: h, filter: true, sortable: true })));
            setGridData(rows);
          }
        } else if (viewerType === 'csv') {
          const text = await blob.text();
          Papa.parse(text, {
            header: true,
            complete: (results) => {
              if (results.data && results.data.length > 0) {
                const firstRow = results.data[0] as object;
                const headers = Object.keys(firstRow);
                setGridCols(headers.map(h => ({ field: h, headerName: h, filter: true, sortable: true })));
                setGridData(results.data);
              }
            },
            error: (err: any) => setError(err.message)
          });
        } else if (viewerType === 'image' || viewerType === 'pdf') {
          const url = URL.createObjectURL(blob);
          setContent(url);
        } else if (viewerType === 'text') {
          const text = await blob.text();
          setContent(text);
        } else {
            // Fallback for unknown types - try to show as text or just download link
            setError('Preview not available for this file type');
        }

      } catch (err) {
        console.error(err);
        setError('Error loading file');
      } finally {
        setLoading(false);
      }
    };

    fetchFile();

    // Cleanup object URLs
    return () => {
      if (content && (viewerType === 'image' || viewerType === 'pdf')) {
        URL.revokeObjectURL(content);
      }
    };
  }, [open, fileId, viewerType]);

  const renderContent = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <Typography color="error">{error}</Typography>
        </Box>
      );
    }

    switch (viewerType) {
      case 'excel':
      case 'csv':
        return (
          <Box className="ag-theme-alpine" sx={{ height: '60vh', width: '100%' }}>
            <AgGridReact
              rowData={gridData}
              columnDefs={gridCols}
              theme={exhibitflowTheme}
              pagination={true}
            />
          </Box>
        );
      case 'image':
        return (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <img src={content!} alt={fileName} style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain' }} />
          </Box>
        );
      case 'pdf':
        return (
          <Box sx={{ height: '60vh', width: '100%' }}>
            <iframe src={content!} width="100%" height="100%" style={{ border: 'none' }} title={fileName} />
          </Box>
        );
      case 'text':
        return (
          <Box sx={{ height: '60vh', width: '100%', overflow: 'auto', p: 2, bgcolor: '#f5f5f5' }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{content}</pre>
          </Box>
        );
      default:
        return <Typography>Preview not supported</Typography>;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>{fileName}</DialogTitle>
      <DialogContent dividers>
        {renderContent()}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
