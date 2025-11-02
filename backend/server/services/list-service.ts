import { Request, Response, Router } from 'express';
import List, { Status } from '../models/List/list.model';
import { generateJitteredKeyBetween } from 'fractional-indexing-jittered';
import buildTree from 'server/utils/tree';
import { authenticateToken } from 'server/middleware/authenticate';
import { permit } from 'server/middleware/permit';
import { Roles } from 'server/middleware/permit';
import verifyDepartment from 'server/middleware/department';

class ListService {
  public router = Router();

  constructor() {
    this.initializeRoutes();
    this.router.use(verifyDepartment);
  }

  private initializeRoutes() {
    this.router.post('/', authenticateToken, permit(Roles.MANAGER), this.createList.bind(this));
    this.router.get('/', authenticateToken, permit(Roles.USER), this.getLists.bind(this));
    this.router.get(
      '/sidebar',
      authenticateToken,
      permit(Roles.USER),
      this.getSidebarLists.bind(this)
    );
    this.router.get('/:id', authenticateToken, permit(Roles.USER), this.getListById.bind(this));
    this.router.get(
      '/:id/stats',
      authenticateToken,
      permit(Roles.USER),
      this.getListStats.bind(this)
    );
    this.router.delete('/:id', authenticateToken, permit(Roles.ADMIN), this.deleteList.bind(this));
    this.router.patch('/:id', authenticateToken, permit(Roles.ADMIN), this.updateList.bind(this));
    this.router.patch(
      '/:id/position',
      authenticateToken,
      permit(Roles.ADMIN),
      this.updateListPosition.bind(this)
    );
  }

  async createList(req: Request, res: Response) {
    try {
      const { parentId, name, _id } = req.body;
      const department = req.headers.department;

      const lastItem = await List.findOne({ parentId, isActive: true })
        .sort({ positionKey: -1 })
        .select('positionKey');

      const newList = new List({
        _id,
        name: name || '',
        department,
        parentId,
        positionKey: generateJitteredKeyBetween(lastItem?.positionKey || null, null),
        path: parentId ? [...((await List.findById(parentId))?.path || []), parentId] : [],
      });

      await newList.save();
      res.status(201).json(newList);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getLists(req: Request, res: Response) {
    try {
      const lists = await List.find({ department: req.headers.department })
        .select('_id name tasks parentId positionKey isActive')
        .sort({ positionKey: 1 })
        .lean();
      res.json(
        lists.map((list) => ({
          _id: list._id,
          name: list.name,
          isActive: list.isActive,
          positionKey: list.positionKey,
          parentId: list.parentId,
          count: list.tasks.length,
          newOrders: list.tasks.filter((task) => task.status === Status.PENDING || !task.status)
            .length,
        }))
      );
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
  async getSidebarLists(req: Request, res: Response) {
    try {
      const lists = await List.find({ department: req.headers.department, isActive: true })
        .select('_id name tasks parentId positionKey isActive')
        .sort({ positionKey: 1 })
        .lean();
      const treeStructure = buildTree(lists);
      res.json(treeStructure);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getListById(req: Request, res: Response) {
    try {
      const list = await List.findById(req.params.id);
      if (!list) {
        return res.status(404).json({ message: 'List not found' });
      }
      if (list.tasks) {
        list.tasks.sort((a, b) => a.positionKey.localeCompare(b.positionKey));
      }
      res.json(list);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async deleteList(req: Request, res: Response) {
    try {
      const list = await List.findByIdAndDelete(req.params.id);
      if (!list) {
        return res.status(404).json({ message: 'List not found' });
      }
      // Also delete all child lists
      await List.deleteMany({ path: req.params.id });
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async updateList(req: Request, res: Response) {
    try {
      const { name, department, isActive } = req.body;
      const list = await List.findByIdAndUpdate(
        req.params.id,
        { name, department, isActive },
        { new: true }
      );
      if (!list) {
        return res.status(404).json({ message: 'List not found' });
      }
      res.json(list);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async updateListPosition(req: Request, res: Response) {
    try {
      const { itemId, newPosition, oldPosition } = req.body;
      await List.updatePosition(itemId, newPosition, oldPosition);
      res.status(200).send();
    } catch (error: any) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  }

  async getListStats(req: Request, res: Response) {
    try {
      const list = await List.findById(req.params.id)
        .populate('parentId', 'name')
        .populate('path', 'name');

      if (!list) {
        return res.status(404).json({ message: 'List not found' });
      }

      const taskStats = {
        total: list.tasks.length,
        byStatus: Object.values(Status).reduce(
          (acc, status) => {
            acc[status] = list.tasks.filter((task) => task.status === status).length;
            return acc;
          },
          {} as Record<Status, number>
        ),
        totalValue: list.tasks.reduce(
          (sum, task) => sum + (task.price || 0) * (task.quantity || 1),
          0
        ),
        averagePrice:
          list.tasks.length > 0
            ? list.tasks.reduce((sum, task) => sum + (task.price || 0), 0) / list.tasks.length
            : 0,
        pendingDeliveries: list.tasks.filter(
          (task) => task.deliveryDate && task.deliveryDate > new Date()
        ).length,
        overdueTasks: list.tasks.filter(
          (task) =>
            task.deliveryDate && task.deliveryDate < new Date() && task.status !== Status.DONE
        ).length,
      };

      const uniqueValues = {
        orderedBy: [...new Set(list.tasks.map((task) => task.orderedBy))],
        units: [...new Set(list.tasks.map((task) => task.unit))],
        paymentMethods: [...new Set(list.tasks.map((task) => task.payment))],
      };

      const hierarchyInfo = {
        depth: list.path.length,
        pathNames: list.path.map((item: any) => item.name),
        parentName: list.parentId ? (list.parentId as any).name : null,
      };

      const response = {
        listInfo: {
          id: list._id,
          name: list.name,
          department: list.department,
          isActive: list.isActive,
          positionKey: list.positionKey,
        },
        taskStats,
        uniqueValues,
        hierarchyInfo,
        hasUnfinishedTasks: list.hasUnfinishedTasks,
        lastUpdated: list.updatedAt,
      };

      res.json(response);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}

const listRouter = new ListService();
export default listRouter.router as Router;
