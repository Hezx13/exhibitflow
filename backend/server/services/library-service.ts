import { Router, Request, Response } from 'express';
import Document from '../models/Document/Document.model';
import List from '../models/List/list.model';
import { Model } from 'mongoose';
import verifyDepartment from 'server/middleware/department';

enum ResourseType {
  DOCUMENT = 'document',
  TABLE = 'table',
  ALL = 'all',
}

const resourceTypeMap = {
  [ResourseType.DOCUMENT]: [Document],
  [ResourseType.TABLE]: [List],
  [ResourseType.ALL]: [Document, List],
};

class LibraryService {
  public router = Router();

  constructor() {
    this.initializeRoutes();
    this.router.use(verifyDepartment);
  }

  private initializeRoutes() {
    this.router.get('/', this.getLibraryResouces.bind(this));
  }

  private async getLibraryResouces(req: Request, res: Response) {
    try {
      const { type = ResourseType.ALL } = req.query as { type?: ResourseType };
      const department = req.headers?.department;

      let resources = [];

      const docProjection = {
        _id: 1,
        name: '$documentName',
        parentId: 1,
        positionKey: 1,
        isActive: 1,
        createdAt: 1,
        updatedAt: 1,
        resourceType: { $literal: ResourseType.DOCUMENT },
      };
      const listProjection = {
        _id: 1,
        name: 1,
        parentId: 1,
        positionKey: 1,
        isActive: 1,
        createdAt: 1,
        updatedAt: 1,
        resourceType: { $literal: ResourseType.TABLE },
      };

      console.log(`Fetching library resources for department: ${department}, type: ${type}`);

      if (type === ResourseType.DOCUMENT) {
        console.time('document-aggregation');
        resources = await Document.aggregate([
          { $match: { department } },
          { $project: docProjection },
        ]);
        console.timeEnd('document-aggregation');
      } else if (type === ResourseType.TABLE) {
        console.time('list-aggregation');
        resources = await List.aggregate([
          { $match: { department } },
          { $project: listProjection },
        ]);
        console.timeEnd('list-aggregation');
      } else {
        console.time('union-aggregation');
        resources = await Document.aggregate([
          { $match: { department } },
          { $project: docProjection },
          {
            $unionWith: {
              coll: List.collection.name,
              pipeline: [{ $match: { department } }, { $project: listProjection }],
            },
          },
        ]);
        console.timeEnd('union-aggregation');
      }

      console.log(`Found ${resources.length} resources.`);
      res.status(200).json(resources); // Result is already a flat array
    } catch (error: any) {
      console.error('Error fetching library resources:', error);
      res.status(500).json({ message: error.message });
    }
  }
}

const router = new LibraryService().router;

export default router;
