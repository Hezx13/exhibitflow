import { AgGridReact } from 'ag-grid-react';
import { useMemo, useState, useRef } from 'react';
import { useLoadListsQuery, usePatchListMutation } from '../store/api/listsApi';
import { Stack, Typography, Tabs, Tab, Box, Button } from '@mui/material';
import exhibitflowTheme from '../theme/grid';
import { useNavigate } from 'react-router-dom';
import { useGetLibraryQuery, ResourseType } from '../store/api/libraryApi';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import NotesRoundedIcon from '@mui/icons-material/NotesRounded';
import { ColDef } from 'ag-grid-community';
import { useAppSelector } from '../store';
import { FileIcon } from '../components/FileIcon';
import { useUploadFileMutation } from '../store/api/filesApi';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FileViewerDialog from '../components/dialogs/FileViewerDialog';

export default function Library() {
  const { isAdmin } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState(0);
  
  const { data: libraryData = [] } = useGetLibraryQuery({ type: ResourseType.ALL });
  
  const { data: filesData = [], refetch: refetchFiles } = useGetLibraryQuery({ type: ResourseType.FILE });
  
  const [patchList] = usePatchListMutation();
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File Viewer State
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ id: string; name: string; type: string } | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        await uploadFile(formData).unwrap();
        refetchFiles();
      } catch (error) {
        console.error('Upload failed:', error);
      }
      // Reset input
      event.target.value = '';
    }
  };

  const handleFileClick = (file: any) => {
    setSelectedFile({
      id: file._id,
      name: file.name,
      type: file.fileType || '',
    });
    setViewerOpen(true);
  };

  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        flex: 1,
        cellRenderer: (params) => {
          return (
            <Stack direction="row" alignItems="center" gap={1} sx={{ cursor: 'pointer' }}>
              {params.data.resourceType === ResourseType.DOCUMENT && <DescriptionRoundedIcon />}
              {params.data.resourceType === ResourseType.TABLE && <NotesRoundedIcon />}
              <Typography>{params.data.name || `Unnamed ${params.data.resourceType}`}</Typography>
            </Stack>
          );
        },
        onCellClicked: (event) => {
          navigate(
            `/${event.data.resourceType === 'document' ? 'documents' : 'projects'}/${event.data._id}`
          );
        },
      },
      { field: 'count', headerName: 'Materials', minWidth: 100, flex: 0.25 },
      { field: 'newOrders', headerName: 'New Orders', minWidth: 100, flex: 0.25 },
      {
        field: 'createdAt',
        headerName: 'Created',
        minWidth: 100,
        flex: 0.5,
        valueGetter: (params) => {
          return params.data.createdAt ? new Date(params.data.createdAt).toLocaleString() : '';
        },
      },
      {
        field: 'updatedAt',
        headerName: 'Updated',
        minWidth: 100,
        flex: 0.5,
        valueGetter: (params) => {
          return params.data.updatedAt ? new Date(params.data.updatedAt).toLocaleString() : '';
        },
      },
      {
        field: 'isActive',
        headerName: 'Active',
        width: 65,
        editable: isAdmin,
        cellEditor: 'agCheckboxCellEditor',
        onCellValueChanged: (event) => {
          // Update the server with the new value
          patchList({
            listId: event.data._id,
            payload: { isActive: event.newValue },
          });
        },
      },
    ],
    [navigate, patchList, isAdmin]
  );

  const fileColumnDefs: ColDef[] = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'File Name',
        flex: 1,
        cellRenderer: (params) => {
          return (
            <Stack direction="row" alignItems="center" gap={1} sx={{ cursor: 'pointer' }}>
              <FileIcon fileName={params.data.name} />
              <Typography>{params.data.name}</Typography>
            </Stack>
          );
        },
        onCellClicked: (params) => handleFileClick(params.data),
      },
      { field: 'fileType', headerName: 'Type', width: 150 },
      { 
        field: 'fileSize', 
        headerName: 'Size', 
        width: 120,
        valueFormatter: (params) => {
          if (!params.value) return '';
          const sizeInMB = params.value / (1024 * 1024);
          return `${sizeInMB.toFixed(2)} MB`;
        }
      },
      { field: 'ocrStatus', headerName: 'OCR Status', width: 120 },
      {
        field: 'createdAt',
        headerName: 'Uploaded At',
        width: 200,
        valueGetter: (params) => {
          return params.data.createdAt ? new Date(params.data.createdAt).toLocaleString() : '';
        },
      },
    ],
    []
  );

  return (
    <Stack height="100%" width="100%" flexGrow={1}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="library tabs">
          <Tab label="Documents" />
          <Tab label="Files" />
        </Tabs>
        {activeTab === 1 && (
          <Box pr={2}>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <Button
              variant="contained"
              startIcon={<CloudUploadIcon />}
              onClick={handleUploadClick}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload File'}
            </Button>
          </Box>
        )}
      </Box>
      
      <Stack flexGrow={1} pb={1}>
        {activeTab === 0 && (
          <AgGridReact rowData={libraryData} theme={exhibitflowTheme} columnDefs={columnDefs} />
        )}
        {activeTab === 1 && (
          <AgGridReact rowData={filesData} theme={exhibitflowTheme} columnDefs={fileColumnDefs} />
        )}
      </Stack>

      <FileViewerDialog
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        fileId={selectedFile?.id || null}
        fileName={selectedFile?.name || ''}
        fileType={selectedFile?.type || ''}
      />
    </Stack>
  );
}
