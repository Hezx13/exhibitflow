import { NextFunction, Request, Response } from 'express';
import { Server } from '@hocuspocus/server';

const documentMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
  hocuspocusServer: typeof Server
) => {
  const documentId = req.params.documentId;
  const document = hocuspocusServer.documents.get(documentId as string);
  console.log('🔍 Document:', documentId);
  if (!document) {
    return res.status(404).json({ error: 'Document not found' });
  }

  // Append document to the request object
  (req as any).document = document;

  next();
};

export default documentMiddleware;
