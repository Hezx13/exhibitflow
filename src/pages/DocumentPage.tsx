// @ts-ignore
import { BlockNoteView } from '@blocknote/mantine';
import { useCreateBlockNote } from '@blocknote/react';
import { useEditor } from '../hooks/useEditor';
import { useParams } from 'react-router-dom';
import { Box, Stack } from '@mui/material';
import { useEffect } from 'react';
import { TopBar } from '../components/data-display/TopBar';
import { SelectionProvider } from '../components/data-display/GridSelection.context';

export default function Editor() {
  const { id } = useParams();
  const { provider, threadStore, disconnect } = useEditor({ documentId: id || '' });

  const editor = useCreateBlockNote({
    collaboration: {
      provider,
      fragment: provider.document.getXmlFragment('doc'),
      user: {
        name: 'John Doe',
        color: '#ff0000',
      },
    },
    resolveUsers: async (userIds) => {
      // sample implementation, replace this with a call to your own user database for example
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

  // Cleanup when component unmounts or document ID changes
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [id, disconnect]);

  return (
    <Stack height="100%" width="100%" borderRadius={1} zIndex={1000}>
      <SelectionProvider>
        <TopBar documentId={id as string} type="document" />
      </SelectionProvider>
      <BlockNoteView editor={editor} />
    </Stack>
  );
}
