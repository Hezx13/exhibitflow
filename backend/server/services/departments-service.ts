import { Router, Request, Response } from 'express';
import { Department } from '../models/List/list.model';
import authenticateToken, { AuthenticatedRequest } from 'server/middleware/authenticate';
import User from '../models/user';
import { permit, Roles } from 'server/middleware/permit';

class DepartmentService {
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/', authenticateToken, permit(Roles.ADMIN), this.createDepartment.bind(this));
    this.router.get('/', authenticateToken, permit(Roles.USER), this.getDepartments.bind(this));
    this.router.delete(
      '/:id',
      authenticateToken,
      permit(Roles.ADMIN),
      this.deleteDepartment.bind(this)
    );
    this.router.patch(
      '/:id',
      authenticateToken,
      permit(Roles.ADMIN),
      this.updateDepartment.bind(this)
    );
  }

  async createDepartment(req: AuthenticatedRequest, res: Response) {
    try {
      const { name } = req.body;

      const usersWithinDepartmentObjects = await User.find({ department: name })
        .select('username -_id')
        .lean();
      const usernames = usersWithinDepartmentObjects.map((user) => user.username);

      const dep = new Department({
        name: name,
        users: usernames,
      });
      await dep.save();
      return res.status(200).send();
    } catch (err: any) {
      console.error(err.message);
      return res.status(500).send('Internal server error');
    }
  }

  async updateDepartment(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { name } = req.body;
      await Department.findByIdAndUpdate(id, { name });
      return res.status(200).send();
    } catch (err: any) {
      console.error(err.message);
      return res.status(500).send('Internal server error');
    }
  }

  async getDepartments(_req: Request, res: Response) {
    try {
      const deps = await Department.find().lean();
      return res.status(200).json(deps);
    } catch (err: any) {
      console.error(err.message);
      return res.status(500).send();
    }
  }

  async deleteDepartment(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      await Department.findByIdAndDelete(id);
      return res.status(200).send();
    } catch (err: any) {
      console.error(err);
      return res.status(500).send();
    }
  }
}

const departmentService = new DepartmentService();
export default departmentService.router as Router;
