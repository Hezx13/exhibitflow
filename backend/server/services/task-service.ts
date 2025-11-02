import { Router } from 'express';
import type { Request, Response } from 'express';
import List, { ITask } from '../models/List/list.model';
import { generateJitteredKeyBetween, generateKeyBetween } from 'fractional-indexing-jittered';
import { ObjectId } from 'mongodb';
import { authenticateToken, DecodedToken } from 'server/middleware/authenticate';
import { permit, Roles } from 'server/middleware/permit';
import { LogRequest } from 'server/middleware/requestLogger';
import verifyDepartment from 'server/middleware/department';

class TaskService {
  public router = Router();

  constructor() {
    this.initializeRoutes();
    this.router.use(verifyDepartment);
  }

  private initializeRoutes() {
    this.router.post(
      '/:listId/tasks',
      authenticateToken,
      permit(Roles.USER),
      this.addTask.bind(this)
    );
    this.router.patch(
      '/:listId/tasks/:taskId',
      authenticateToken,
      permit(Roles.USER),
      this.updateTask.bind(this)
    );
    this.router.delete(
      '/:listId/tasks',
      authenticateToken,
      permit(Roles.MANAGER),
      this.deleteTasks.bind(this)
    );
    this.router.post(
      '/:listId/tasks/duplicate',
      authenticateToken,
      permit(Roles.USER),
      this.duplicateTasks.bind(this)
    );
  }
  
  @LogRequest
  async addTask(req: Request & { user?: DecodedToken }, res: Response) {
    try {
      const { userName } = req.user!;
      const { listId } = req.params;  
      const taskData = req.body;

      const list = await List.findById(listId);
      if (!list) {
        return res.status(404).json({ message: 'List not found' });
      }

      // Get the last task's position key
      const lastTask = list.tasks.length > 0 ? list.tasks[list.tasks.length - 1] : null;

      const newTask: ITask = {
        ...taskData,
        orderedBy: userName,
        date: taskData.date ? new Date(taskData.date) : new Date(),
        positionKey: generateJitteredKeyBetween(lastTask?.positionKey || null, null),
      };

      list.tasks.push(newTask);
      await list.save();

      return res.status(201).json(newTask);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  @LogRequest
  async updateTask(req: Request, res: Response) {
    try {
      const { listId, taskId } = req.params;
      const { taskData } = req.body;

      // Create update object only with defined fields
      const updateFields = Object.entries(taskData)
        .filter(([_, value]) => value !== undefined)
        .reduce(
          (acc, [key, value]) => {
            acc[`tasks.$.${key}`] = value;
            return acc;
          },
          {} as Record<string, any>
        );

      const result = await List.findOneAndUpdate(
        { _id: listId, 'tasks._id': taskId },
        { $set: updateFields },
        { new: true } // Return the updated document
      );

      if (!result) {
        return res.status(404).json({ message: 'List or task not found' });
      }

      return res.status(200).send();
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  @LogRequest
  async deleteTasks(req: Request, res: Response) {
    try {
      const { listId } = req.params;
      const { taskIds } = req.body;

      const result = await List.updateOne(
        { _id: listId },
        { $pull: { tasks: { _id: { $in: Array.isArray(taskIds) ? taskIds : [taskIds] } } } }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'List or task not found' });
      }

      return res.status(204).send();
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  @LogRequest
  async duplicateTasks(req: Request, res: Response) {
    const { listId } = req.params;
    const { taskIds } = req.body;
    if (!Array.isArray(taskIds)) {
      return res.status(400).json({ message: 'Task IDs are required' });
    }
    try {
      const list = await List.findOne({ _id: listId }).select('tasks');
      if (!list) {
        return res.status(404).json({ message: 'List not found' });
      }
      const { tasks } = list;
      const newTasks: ITask[] = [];
      for (const task of tasks) {
        if (taskIds.includes((task._id as any).toString())) {
          newTasks.push({
            ...task.toObject(),
            _id: new ObjectId(),
            name: task.name + ' - copy',
            positionKey: generateKeyBetween(
              task.positionKey,
              tasks[tasks.indexOf(task) + 1]?.positionKey || null
            ),
          });
        }
      }
      list.tasks.push(...(newTasks as ITask[]));
      await list.save();
      return res.status(200).json();
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}

const taskRouter = new TaskService();
export default taskRouter.router as Router;
