import {
  DefaultThreadStoreAuth,
  YjsThreadStore,
  // @ts-ignore
} from '@blocknote/core/comments';

const threadStoreMiddleware = (options: { threadsMapKey: string }) => {
  return async (req: any, res: any, next: any) => {
    const threadStore = new YjsThreadStore(
      req.userId,
      req.document.getMap(options.threadsMapKey),
      new DefaultThreadStoreAuth(req.userId, req.role === 'COMMENT-ONLY' ? 'comment' : 'editor')
    );

    req.threadStore = threadStore;

    next();
  };
};

export default threadStoreMiddleware;
