// @ts-ignore
import { DefaultThreadStoreAuth, RESTYjsThreadStore } from '@blocknote/core/comments';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { HocuspocusProvider } from '@hocuspocus/provider';

interface UseEditorProps {
  documentId: string;
}

// Hardcoded settings for demo purposes
const USER_ID = 'user123';
const USER_ROLE: 'COMMENT-ONLY' | 'READ-WRITE' = 'READ-WRITE';
const DOCUMENT_ID = 'mydoc123';
const TOKEN = `${USER_ID}__${USER_ROLE}`;

// Setup Hocuspocus provider

// Instead of using the REST API, you could also use a YjsThreadStore
// however, this lacks good authentication on comment operations
//
// const threadStore = new YjsThreadStore(
//   USER_ID,
//   provider.document.getMap("threads"),
//   threadStoreAuth
// );

// Our <Editor> component we can reuse later

export const useEditor = ({ documentId }: UseEditorProps) => {
  const provider = new HocuspocusProvider({
    url: 'ws://localhost:4500/hocuspocus',
    token: TOKEN,
    name: documentId,
  });

  // The thread store auth is used by the BlockNote interface to determine which actions are allowed
  // (and which elements should be shown)
  const threadStoreAuth = new DefaultThreadStoreAuth(
    USER_ID,
    USER_ROLE === 'READ-WRITE' ? 'editor' : 'comment'
  );

  // set up the thread store using the REST API
  const threadStore = new RESTYjsThreadStore(
    `http://localhost:4500/documents/${documentId}/threads`,
    {
      Authorization: `Bearer ${TOKEN}`,
    },
    provider.document.getMap('threads'),
    threadStoreAuth
  );

  const disconnect = () => {
    provider.disconnect();
  };

  return {
    provider,
    threadStore,
    disconnect,
  };
};
