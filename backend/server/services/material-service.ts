import { Response, Router } from 'express';
import List, { List as IList, Category, ITask, Status } from '../models/List/list.model';
import User, { IUser } from '../models/user';
import { Material, Supplier, ISupplier } from '../models/savedMaterials';
import { nanoid } from 'nanoid';
import { getCurrentDateAndTime } from '../../utils/timeUtils';
import { authenticateToken, AuthenticatedRequest } from 'server/middleware/authenticate';
import { permit, Roles } from 'server/middleware/permit';

class MaterialService {
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/', authenticateToken, permit(Roles.ADMIN), this.saveMaterial.bind(this));
    this.router.get('/savedMaterialCount', authenticateToken, permit(Roles.ADMIN), this.getSavedMaterialCount.bind(this));
    this.router.get('/', authenticateToken, permit(Roles.ADMIN), this.getMaterials.bind(this));
    this.router.delete('/removeMaterial', authenticateToken, permit(Roles.ADMIN), this.removeMaterial.bind(this));
    this.router.patch('/', authenticateToken, permit(Roles.ADMIN), this.updateMaterial.bind(this));
    this.router.put('/addToProject', authenticateToken, permit(Roles.ADMIN), this.addToProject.bind(this));
    this.router.post('/createCategory', authenticateToken, permit(Roles.ADMIN), this.createCategory.bind(this));
    this.router.get('/categories', authenticateToken, permit(Roles.ADMIN), this.getCategories.bind(this));
    this.router.post('/supplier', authenticateToken, permit(Roles.ADMIN), this.createSupplier.bind(this));
    this.router.get('/suppliers', authenticateToken, permit(Roles.ADMIN), this.getSuppliers.bind(this));
  }

  async saveMaterial(req: AuthenticatedRequest, res: Response) {
    try {
      const { materialId, listId }: { materialId: string[]; listId: string } = req.body;
      if (!materialId || !listId) {
        return res.status(400).send('No params');
      }

      const results = await List.aggregate([
        { $match: { id: listId } }, // Match the document by its id
        {
          $project: {
            id: 1, // Include the list id
            name: 1, // Include the list name
            tasks: {
              $filter: {
                input: '$tasks',
                as: 'task',
                cond: { $in: ['$$task.id', materialId] }, // Filter tasks by the array of taskIds
              },
            },
          },
        },
      ]);

      if (!results) return res.status(400).send('Bad params');
      results[0].tasks.forEach((task: Record<string, any>) => {
        delete task.date;
        delete task.deliveryDate;
        delete task.status;
        delete task.orderedBy;
        task.supplier = null;
        task.category = null;
        task.listParent = [
          {
            name: results[0].name,
            id: results[0].id,
          },
        ];
      });
      await Material.insertMany(results[0].tasks);

      return res.status(200).send('Material saved');
    } catch (err: any) {
      console.error(err.message);
      return res.status(500).send('Internal server error');
    }
  }

  async getSavedMaterialCount(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await Material.find().lean();
      return res.status(200).json(result.length);
    } catch (err: any) {
      console.error(err.message);
      return res.status(500).send('Internal server error');
    }
  }

  async getMaterials(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await Material.find().lean();
      return res.status(200).json(result);
    } catch (err: any) {
      console.error(err.message);
      return res.status(500).send('Internal server error');
    }
  }

  async removeMaterial(req: AuthenticatedRequest, res: Response) {
    try {
      const { idToRemove } = req.query;

      await Material.deleteMany({ _id: { $in: idToRemove } });
      return res.status(200).send('Removed');
    } catch (err: any) {
      console.error(err.message);
      return res.status(500).send('Internal server error');
    }
  }

  async updateMaterial(req: AuthenticatedRequest, res: Response) {
    try {
      const { _id, ...newMaterial } = req.body;

      await Material.findByIdAndUpdate(_id, { ...newMaterial });
      return res.status(200).send('Updated');
    } catch (err: any) {
      console.error(err.message);
      return res.status(500).send('Internal server error');
    }
  }

  async addToProject(req: AuthenticatedRequest, res: Response) {
    try {
      const { materialId, projectId }: { materialId: string[]; projectId: string } = req.body;

      const project: IList | null = await List.findById(projectId);
      if (!project) return res.status(404).send('Project not found');

      const materials = await Material.find({ id: { $in: materialId } }).lean();
      if (!materials.length) return res.status(404).send('Material not found');

      const user: IUser | null = await User.findById(req.user!.userId).lean();
      if (!user) return res.status(404).send('User not found');
      
      const newMaterials: ITask[] = [];
      for (const material of materials) {
        const newMaterial = {
          id: nanoid(),
          date: getCurrentDateAndTime(),
          status: Status.IN_PROCESS,
          comment: '',
          deliveryDate: null,
          payment: '',
          quantity: 1,
          orderedBy: user.username,
          name: material.name,
          article: material.article,
          price: material.price,
          unit: material.unit,
        } as ITask;
        newMaterials.push(newMaterial);
      }

      project.tasks.push(...newMaterials);
      await project.save();
      const alreadyInProject = await Material.find({ id: project.id });
      if (!alreadyInProject) {
        await Material.updateMany(
          { id: { $in: materialId } },
          { $addToSet: { listParent: { name: project.name, id: project.id } } }
        );
      }
      return res.status(200).send('Material added');
    } catch (err) {
      console.error(err instanceof Error ? err.message : 'Unknown error');
      return res.status(500).send('Internal server error');
    }
  }

  async createCategory(req: AuthenticatedRequest, res: Response) {
    try {
      const { name }: { name: string } = req.body;
      
      const cat = new Category({
        name: name,
      });
      await cat.save();
      return res.status(200).send('Category created');
    } catch (err) {
      console.error(err);
      return res.status(500).send('Internal server error');
    }
  }

  async getCategories(req: AuthenticatedRequest, res: Response) {
    try {
      const cat = await Category.find().select('name -_id').lean();
      return res.status(200).json(cat.map((category) => category.name));
    } catch (err: any) {
      console.error(err.message);
      return res.status(500).send('Internal server error');
    }
  }

  async createSupplier(req: AuthenticatedRequest, res: Response) {
    try {
      const supplier: Partial<ISupplier> = req.body;
      const sup = new Supplier({
        ...supplier,
      });
      await sup.save();
      return res.status(200).send('Created');
    } catch (err: any) {
      console.error(err.message);
      return res.status(500).send('Internal server error');
    }
  }

  async getSuppliers(req: AuthenticatedRequest, res: Response) {
    try {
      const sups = await Supplier.find().lean();
      return res.status(200).json(sups);
    } catch (err: any) {
      console.error(err.message);
      return res.status(500).send('Internal server error');
    }
  }
}

const materialRouter = new MaterialService();
export default materialRouter.router as Router; 