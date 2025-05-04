// @ts-expect-error
import { DefaultThreadStoreAuth, RESTYjsThreadStore } from '@blocknote/core/comments';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { useEffect, useMemo } from 'react';

interface UseEditorProps {
  documentId: string;
}

const USER_ID = 'user123';
const USER_ROLE: 'COMMENT-ONLY' | 'READ-WRITE' = 'READ-WRITE';

const TOKEN = `${USER_ID}__${USER_ROLE}`;


export const useEditor = ({ documentId }: UseEditorProps) => {
  const provider = useMemo(() => {
    return new HocuspocusProvider({
      url: 'ws://localhost:4500/hocuspocus',
      token: TOKEN,
      name: documentId,
      connect: false
    });
  }, [documentId]);

  useEffect(() => {
    if (!provider) return;
    provider.connect();

    return () => {
      provider.disconnect();
    };
  }, [provider, documentId]);

  const threadStoreAuth = useMemo(() => new DefaultThreadStoreAuth(
    USER_ID,
    USER_ROLE === 'READ-WRITE' ? 'editor' : 'comment'
  ), []);

  const threadStore = useMemo(() => {
    if (!provider) return null;
    return new RESTYjsThreadStore(
      `http://localhost:4500/documents/${documentId}/threads`,
      {
        Authorization: `Bearer ${TOKEN}`,
      },
      provider.document.getMap('threads'),
      threadStoreAuth
    );
  }, [documentId, provider, threadStoreAuth]);

  return {
    provider,
    threadStore,
  };
};
