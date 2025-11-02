import { Router } from 'express';
import User from '../models/user';
import { AuthenticatedRequest, authenticateToken } from 'server/middleware/authenticate';
import { Response } from 'express';
import { Roles, permit } from 'server/middleware/permit';
import { Department } from 'server/models/List/list.model';

class AuthZService {
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      '/users',
      authenticateToken,
      permit(Roles.ADMIN),
      this.handleGetUsers.bind(this)
    );
    this.router.post(
      '/removeUser',
      authenticateToken,
      permit(Roles.ADMIN),
      this.handleRemoveUser.bind(this)
    );
    this.router.post(
      '/promoteUser',
      authenticateToken,
      permit(Roles.ADMIN),
      this.handlePromoteUser.bind(this)
    );
    this.router.post(
      '/demoteUser',
      authenticateToken,
      permit(Roles.ADMIN),
      this.handleDemoteUser.bind(this)
    );
    this.router.post(
      '/resetUserPassword',
      authenticateToken,
      permit(Roles.ADMIN),
      this.handleResetPassword.bind(this)
    );
    this.router.patch('/department', authenticateToken, this.handleDepartment.bind(this));
    this.router.post(
      '/approveUser',
      authenticateToken,
      permit(Roles.ADMIN),
      this.handleApproveUser.bind(this)
    );
    this.router.post(
      '/disapproveUser',
      authenticateToken,
      permit(Roles.ADMIN),
      this.handleDisapproveUser.bind(this)
    );
    this.router.patch(
      '/user/:id',
      authenticateToken,
      permit(Roles.ADMIN),
      this.handlePatchUser.bind(this)
    );
    this.router.patch(
      '/user',
      authenticateToken,
      permit(Roles.ADMIN),
      this.handlePatchUser.bind(this)
    );
  }

  private async handleGetUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const users = await User.find().select('-password').populate('departments');
      return res.status(200).json(users);
    } catch (error) {
      console.error(error);
      return res.status(500).send('Internal Server Error');
    }
  }

  private async handleRemoveUser(req: AuthenticatedRequest, res: Response) {
    try {
      const { userToRemove } = req.body;
      const fetchedUser = await User.findOneAndDelete({ username: userToRemove });
      if (!fetchedUser) return res.status(404).send('User not found');
      return res.status(200).send('Deleted');
    } catch (err) {
      console.error('Remove user error: ', err instanceof Error ? err.message : err);
      return res.status(500).send('Internal Server Error');
    }
  }

  private async handlePromoteUser(req: AuthenticatedRequest, res: Response) {
    try {
      const { userToPromote } = req.body;
      await User.findOneAndUpdate({ username: userToPromote }, { role: 'Admin' });
      return res.status(200).send('Promoted');
    } catch (err) {
      console.error('Promote user error: ', err instanceof Error ? err.message : err);
      return res.status(500).send('Internal server error');
    }
  }

  private async handleDemoteUser(req: AuthenticatedRequest, res: Response) {
    try {
      const { userToDemote } = req.body;
      await User.findOneAndUpdate({ username: userToDemote }, { role: 'User' });
      return res.status(200).send('Demoted');
    } catch (err) {
      console.error('Demote user error: ', err instanceof Error ? err.message : err);
      return res.status(500).send('Internal server error');
    }
  }

  private async handleResetPassword(req: AuthenticatedRequest, res: Response) {
    try {
      const { userToReset } = req.body;
      await User.findOneAndUpdate({ username: userToReset }, { password: 'Reset' });
      return res.status(200).send('Reset successful');
    } catch (err) {
      console.error('RESET PASS ERROR: ', err instanceof Error ? err.message : err);
      return res.status(500).send('Internal server error');
    }
  }

  private async handleDepartment(req: AuthenticatedRequest, res: Response) {
    try {
      const { user, department } = req.body;
      const filter = user ? { username: user } : { _id: req.user?.userId };

      if (user && req.user?.userRole !== 'Admin') {
        return res.status(403).send('Access denied');
      }

      const fetchedUser = await User.findOneAndUpdate(filter, { department });
      return fetchedUser ? res.status(200).send() : res.status(401).send('Bad request');
    } catch (err) {
      console.error(err instanceof Error ? err.message : err);
      return res.status(500).send('Internal server error');
    }
  }

  private async handleApproveUser(req: AuthenticatedRequest, res: Response) {
    try {
      const { userToApprove } = req.body;
      const fetchedUser = await User.findOneAndUpdate(
        { username: userToApprove },
        { isApproved: true }
      );
      return res.status(200).send('Approved');
    } catch (err) {
      console.error('Approve user error: ', err instanceof Error ? err.message : err);
      return res.status(500).send('Internal server error');
    }
  }

  private async handleDisapproveUser(req: AuthenticatedRequest, res: Response) {
    try {
      const { userToApprove } = req.body;
      await User.findOneAndUpdate({ username: userToApprove }, { isApproved: false });
      return res.status(200).send('Disapproved');
    } catch (err) {
      console.error('Disapprove user error: ', err instanceof Error ? err.message : err);
      return res.status(500).send('Internal server error');
    }
  }

  private async handlePatchUser(req: AuthenticatedRequest, res: Response) {
    try {
      const { ...updateData } = req.body;
      const _id = updateData._id || req.user?.userId;
      const user = await User.findById(_id);
      // Prevent updating sensitive fields
      delete updateData.password;
      const allowedFields = [
        'email',
        'departments',
        'role',
        'isApproved',
        'username',
        'selectedDepartment',
        'adminAccess',
      ];

      const updates = Object.keys(updateData).reduce((acc: any, key) => {
        if (allowedFields.includes(key)) {
          acc[key] = updateData[key];
        }
        return acc;
      }, {});

      if (Object.keys(updates).length === 0) {
        return res.status(400).send('No valid fields to update');
      }

      const updatedUser = await user?.updateOne(updates, { new: true }).select('-password');
      if (!updatedUser) {
        return res.status(404).send('User not found');
      }

      if (updates.departments) {
        // add user to departments he is in
        const userDepartments = await Department.find({ _id: { $in: updateData.departments } });
        console.log(userDepartments);
        for (const department of userDepartments) {
          if (!department.users.includes(_id as string)) {
            department.users.push(_id as string);
            await department.save();
          }
        }
        // remove user from departments he is not in
        const previousDepartments = await Department.find({
          _id: { $nin: updateData.departments },
        });
        console.log(previousDepartments);
        for (const department of previousDepartments) {
          department.users = department.users.filter((user: string) => user !== _id);
          await department.save();
        }
      }

      return res.status(200).json(updatedUser);
    } catch (err) {
      console.error('Patch user error:', err instanceof Error ? err.message : err);
      return res.status(500).send('Internal server error');
    }
  }
}

const authZService = new AuthZService();
export default authZService.router as Router;
