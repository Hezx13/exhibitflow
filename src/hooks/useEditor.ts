// @ts-expect-error
import { DefaultThreadStoreAuth, RESTYjsThreadStore } from '@blocknote/core/comments';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAppSelector } from '../store';

interface UseEditorProps {
  documentId: string;
}

export const useEditor = ({ documentId }: UseEditorProps) => {
  const token = useAppSelector((state) => state.auth.token);
  const role = useAppSelector((state) => state.auth.role);
  const username = useAppSelector((state) => state.auth.userName);
  const providerRef = useRef<HocuspocusProvider | null>(null);
  const [connected, setConnected] = useState(false);
  useEffect(() => {
    console.log('creating provider');
    const provider = new HocuspocusProvider({
      url: 'ws://localhost:4500/hocuspocus',
      token: token,
      name: documentId,
      onConnect: () => {
        setConnected(true);
      },
      onDisconnect: () => {
        setConnected(false);
      }
    });
    providerRef.current = provider;
    return () => {
      providerRef.current?.disconnect();
      providerRef.current?.destroy();
    };
  }, [documentId]);

  const threadStoreAuth = useMemo(() => {
    return new DefaultThreadStoreAuth(
      username,
      role === 'User' ? 'comment' : 'editor'
    );
  }, []);

  const threadStore = useMemo(() => {
    if (!providerRef.current) return null;
    return new RESTYjsThreadStore(
      `http://localhost:4500/api/documents/${documentId}/threads`,
      {
        Authorization: `Bearer ${token}`,
      },
      providerRef.current.document.getMap('threads'),
      threadStoreAuth
    );
  }, [documentId, threadStoreAuth, token, connected]);

  return {
    provider: providerRef.current,
    threadStore,
  };
};
