// @ts-expect-error
import { DefaultThreadStoreAuth, RESTYjsThreadStore } from '@blocknote/core/comments';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAppSelector } from '../store';
import { EXHIBITFLOW_API_URL, EXHIBITFLOW_WS_URL } from '../api/http';

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
    const provider = new HocuspocusProvider({
      url: `${EXHIBITFLOW_WS_URL}/hocuspocus`,
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
  }, [documentId, token]);

  const threadStoreAuth = useMemo(() => {
    return new DefaultThreadStoreAuth(
      username,
      role === 'User' ? 'comment' : 'editor'
    );
  }, []);

  const threadStore = useMemo(() => {
    if (!providerRef.current) return null;
    return new RESTYjsThreadStore(
      `${EXHIBITFLOW_API_URL}/documents/${documentId}/threads`,
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
