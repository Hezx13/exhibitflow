import { YjsThreadStore } from '@blocknote/core/types/src/comments';
import { Router, Request, Response } from 'express';
import threadStoreMiddleware from 'server/middleware/threadStore';
import { setMark } from 'server/utils/setMark';
import { Document } from '@hocuspocus/server';
import DocumentModel from 'server/models/Document/Document.model';
import { generateJitteredKeyBetween } from 'fractional-indexing-jittered';
import buildTree from 'server/utils/tree';
import verifyDepartment from 'server/middleware/department';

type DocumentRequest = Request & {
  document?: Document;
  threadStore?: YjsThreadStore;
};

class DocumentService {
  public router = Router();

  constructor() {
    this.initializeRoutes();
    this.router.use(threadStoreMiddleware({ threadsMapKey: 'threads' }));
    this.router.use(verifyDepartment);
  }

  private initializeRoutes() {
    this.router.post('/', this.createDocument.bind(this));
    this.router.get('/', this.getDocuments.bind(this));
    this.router.get('/sidebar', this.getSidebarDocuments.bind(this));
    this.router.get('/:id', this.getDocument.bind(this));
    this.router.patch('/:id', this.updateDocument.bind(this));
    this.router.patch('/:id/position', this.updatePosition.bind(this));
    this.router.delete('/:id', this.deleteDocument.bind(this));
    this.router.post('/:id/threads', this.createThread.bind(this));
    // Add to document
    this.router.post('/:id/:threadId/addToDocument', this.addToDocument.bind(this));

    // Add comment
    this.router.post('/:id/:threadId/comments', this.addComment.bind(this));

    // Update comment
    this.router.put('/:id/:threadId/comments/:commentId', this.updateComment.bind(this));

    // Delete comment
    this.router.delete('/:id/:threadId/comments/:commentId', this.deleteComment.bind(this));

    // Delete thread
    this.router.delete('/:id/:threadId', this.deleteThread.bind(this));

    // Resolve thread
    this.router.post('/:id/:threadId/resolve', this.resolveThread.bind(this));

    // Unresolve thread
    this.router.post('/:id/:threadId/unresolve', this.unresolveThread.bind(this));

    // Add reaction
    this.router.post('/:id/:threadId/comments/:commentId/reactions', this.addReaction.bind(this));

    // Delete reaction
    this.router.delete(
      '/:id/:threadId/comments/:commentId/reactions/:emoji',
      this.deleteReaction.bind(this)
    );
  }

  private async getDocuments(req: DocumentRequest, res: Response) {
    const documents = await DocumentModel.find({ isActive: true })
      .sort({ positionKey: 1 })
      .select('_id documentName isActive positionKey path parentId');
    res.json(documents);
  }

  private async getSidebarDocuments(req: DocumentRequest, res: Response) {
    try {
      const documents = await DocumentModel.find({
        department: req.headers.department,
        isActive: true,
      })
        .select('_id documentName isActive positionKey path parentId')
        .sort({ positionKey: 1 })
        .lean();
      const treeStructure = buildTree(documents);
      res.json(treeStructure);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
  
  private async updatePosition(req: DocumentRequest, res: Response) {
    const documentId = req.params.id;
    if (!documentId) {
      return res.status(400).json({ error: 'Document ID is required' });
    }
    const { parentId, index } = req.body;
    const document = await DocumentModel.updatePosition(documentId, parentId, index);
    res.json(document);
  }

  private async createDocument(req: DocumentRequest, res: Response) {
    const { department } = req.headers;
    const lastItem = await DocumentModel.findOne({ parentId: null, isActive: true }).sort({
      positionKey: -1,
    });
    const document = await DocumentModel.create({
      documentName: req.body?.documentName || '',
      department,
      positionKey: generateJitteredKeyBetween(lastItem?.positionKey || null, null),
    });
    res.json(document);
  }

  private async getDocument(req: DocumentRequest, res: Response) {
    const documentId = req.params.id;
    console.log(documentId);
    try {
      const document = await DocumentModel.findById(documentId).select(
        '_id documentName isActive positionKey path parentId department'
      );
      return res.status(200).json(document);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get document' });
    }
  }

  private async updateDocument(req: DocumentRequest, res: Response) {
    const documentId = req.params.id;
    try {
      const document = await DocumentModel.findByIdAndUpdate(documentId, req.body);
      res.json(document);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update document' });
    }
  }

  private async deleteDocument(req: DocumentRequest, res: Response) {
    const documentId = req.params.id;
    try {
      await DocumentModel.findByIdAndDelete(documentId);
      res.status(204).json({ message: 'Document deleted' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete document' });
    }
  }

  private async createThread(req: DocumentRequest, res: Response) {
    try {
      const thread = await req.threadStore?.createThread(req.body);
      res.json(thread);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create thread' });
    }
  }

  private async addToDocument(req: DocumentRequest, res: Response) {
    try {
      const doc = req.document;
      if (!doc) {
        return res.status(404).json({ error: 'Document not found' });
      }

      const fragment = doc.getXmlFragment('doc');

      setMark(doc, fragment, req.body.selection.yjs, 'comment', {
        orphan: false,
        threadId: req.params.threadId,
      });

      res.json({ message: 'Thread added to document' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to add thread to document' });
    }
  }

  private async addComment(req: DocumentRequest, res: Response) {
    try {
      const comment = await req.threadStore?.addComment({
        threadId: req.params.threadId,
        ...req.body,
      });
      res.json(comment);
    } catch (error) {
      res.status(500).json({ error: 'Failed to add comment' });
    }
  }

  private async updateComment(req: DocumentRequest, res: Response) {
    try {
      await req.threadStore?.updateComment({
        threadId: req.params.threadId,
        commentId: req.params.commentId,
        ...req.body,
      });
      res.json({ message: 'Comment updated' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update comment' });
    }
  }

  private async deleteComment(req: DocumentRequest, res: Response) {
    try {
      const threadId = req.params.threadId;
      const commentId = req.params.commentId;
      if (!threadId || !commentId) {
        return res.status(400).json({ error: 'Thread ID and comment ID are required' });
      }
      await req.threadStore?.deleteComment({
        threadId: threadId,
        commentId: commentId,
        softDelete: req.query.softDelete === 'true',
      });
      res.json({ message: 'Comment deleted' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete comment' });
    }
  }

  private async deleteThread(req: DocumentRequest, res: Response) {
    try {
      const threadId = req.params.threadId;
      if (!threadId) {
        return res.status(400).json({ error: 'Thread ID is required' });
      }
      await req.threadStore?.deleteThread({
        threadId: threadId,
      });
      return res.json({ message: 'Thread deleted' });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete thread' });
    }
  }

  private async resolveThread(req: DocumentRequest, res: Response) {
    try {
      const threadId = req.params.threadId;
      if (!threadId) {
        return res.status(400).json({ error: 'Thread ID is required' });
      }
      await req.threadStore?.resolveThread({
        threadId: threadId,
      });
      res.json({ message: 'Thread resolved' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to resolve thread' });
    }
  }

  private async unresolveThread(req: DocumentRequest, res: Response) {
    try {
      const threadId = req.params.threadId;
      if (!threadId) {
        return res.status(400).json({ error: 'Thread ID is required' });
      }
      await req.threadStore?.unresolveThread({
        threadId: threadId,
      });
      res.json({ message: 'Thread un-resolved' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to unresolve thread' });
    }
  }

  private async addReaction(req: DocumentRequest, res: Response) {
    try {
      const threadId = req.params.threadId;
      const commentId = req.params.commentId;
      if (!threadId || !commentId) {
        return res.status(400).json({ error: 'Thread ID and comment ID are required' });
      }
      await req.threadStore?.addReaction({
        threadId: threadId,
        commentId: commentId,
        emoji: req.body.emoji,
      });
      res.json({ message: 'Reaction added' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to add reaction' });
    }
  }

  private async deleteReaction(req: DocumentRequest, res: Response) {
    try {
      const threadId = req.params.threadId;
      const commentId = req.params.commentId;
      const emoji = req.body.emoji;
      if (!threadId || !commentId) {
        return res.status(400).json({ error: 'Thread ID and comment ID are required' });
      }
      await req.threadStore?.deleteReaction({
        threadId: threadId,
        commentId: commentId,
        emoji: emoji,
      });
      res.json({ message: 'Reaction deleted' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete reaction' });
    }
  }
}
const router = new DocumentService().router;
export default router;
