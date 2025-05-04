import { BlockNoteView } from '@blocknote/mantine';
import { BlockNoteEditor } from '@blocknote/core';
import { useEditor } from '../hooks/useEditor';
import { useParams } from 'react-router-dom';
import { Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import { TopBar } from '../components/data-display/TopBar';
import { SelectionProvider } from '../components/data-display/GridSelection.context';

export default function Editor() {
  const { id } = useParams();
  const documentId = id || ''; 
  const { provider, threadStore } = useEditor({ documentId });

  const [editor, setEditor] = useState<BlockNoteEditor | null>(null);

  useEffect(() => {
    if (!provider || !threadStore) {
      setEditor(null);
      return;
    }

    const newEditor = BlockNoteEditor.create({
      collaboration: {
        provider,
        fragment: provider.document.getXmlFragment('doc'),
        user: {
          name: 'John Doe',
          color: '#ff0000',
        },
      },
      resolveUsers: async (userIds) => {
        return userIds.map((userId) => ({
          id: userId,
          username: 'John Doe',
          avatarUrl: 'https://placehold.co/100x100',
        }));
      },
      comments: {
        threadStore,
      },
    });

    setEditor(newEditor);

    // Cleanup function: Check if BlockNoteEditor has a destroy method
    return () => {
      if (typeof (newEditor as any).destroy === 'function') {
        (newEditor as any).destroy();
      }
      setEditor(null);
    };
  }, [provider, threadStore, documentId]);

  return (
    <Stack height="100%" width="100%" borderRadius={1} zIndex={1000}>
      <SelectionProvider>
        <TopBar documentId={documentId} type="document" />
      </SelectionProvider>
      {/* Render BlockNoteView only when editor is ready */}
      {editor ? <BlockNoteView editor={editor} /> : <div>Loading Editor...</div>}
    </Stack>
  );
}
