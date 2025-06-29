import { BlockNoteView } from '@blocknote/mantine';
import { BlockNoteEditor } from '@blocknote/core';
import { useEditor } from '../hooks/useEditor';
import { useParams } from 'react-router-dom';
import { Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import { TopBar } from '../components/data-display/TopBar';
import { SelectionProvider } from '../components/data-display/GridSelection.context';
import { useAppSelector } from '../store';
import { generateUserColorHex } from '../utils/colorUtils';
import { useCreateBlockNote } from '@blocknote/react';

export default function Editor() {
  const { id } = useParams();
  const username = useAppSelector((state) => state.auth.userName);
  const userRole = useAppSelector((state) => state.auth.role); // Assuming you have user role in auth state
  
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
          name: username || 'Anonymous',
          color: generateUserColorHex(username || 'Anonymous'),
        },
      },
      resolveUsers: async (userIds) => {
        return userIds.map((userId) => ({
          id: userId,
          username: userId,
          avatarUrl: 'https://picsum.photos/50/50'
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
      {editor ? <BlockNoteView editor={editor}  editable={userRole !== 'User'}/> : <div>Loading Editor...</div>}
    </Stack>
  );
}
