import React, { useEffect, useState, useMemo, Component, ErrorInfo } from 'react';
import { useParams } from 'react-router-dom';
import '@blocknote/mantine/style.css';
import { useCreateBlockNote } from '@blocknote/react';
import type { BlockNoteEditor } from '@blocknote/core';
import { Stack, Typography, CircularProgress, Alert, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import '@blocknote/core/style.css';
import '@blocknote/core/fonts/inter.css';
import { BlockNoteView } from '@blocknote/mantine';
import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';

// Define the fragment name as a constant for consistency
const DOCUMENT_FRAGMENT_NAME = 'blocknote';

// Define error boundary for the document page
class DocumentErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ERROR] Document page error:', error);
    console.error('[ERROR] Error stack:', errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Stack spacing={2} sx={{ height: '100%', padding: 2 }}>
          <Alert severity="error">
            <Typography variant="h6">Error Loading Document</Typography>
            <Typography>
              An error occurred while loading the document editor. This might be due to connection 
              issues or incompatible browser features.
            </Typography>
            <Button 
              variant="outlined" 
              sx={{ mt: 2 }}
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
          </Alert>
        </Stack>
      );
    }

    return this.props.children;
  }
}

const DocumentPage: React.FC = () => {
  const { id: documentId = 'default' } = useParams<{ id: string }>();
  return (
    <Stack spacing={2} sx={{ height: '100%', padding: 2 }}>
      <BlockNoteView 
        editor={blockNoteEditor} 
      />
    </Stack>
  );
};

// Modify the export to wrap the component with the error boundary
export default function DocumentPageWithErrorBoundary() {
  return (
    <DocumentErrorBoundary>
      <DocumentPage />
    </DocumentErrorBoundary>
  );
};
