import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from 'server/middleware/authenticate';
import User from 'server/models/user';

export enum Roles {
  ADMIN = 'Admin',
  MANAGER = 'Manager',
  USER = 'User',
}

const roleHierarchy: { [key in Roles]: number } = {
  [Roles.USER]: 0,
  [Roles.MANAGER]: 1,
  [Roles.ADMIN]: 2,
};

export const permit = (...allowedRoles: Roles[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const currentUser = await User.findById(req.user?.userId);
    if (!currentUser || !currentUser.isApproved) {
      return res.status(401).send('Unauthorized');
    }
    if (
      allowedRoles.some((role) => roleHierarchy[req.user!.userRole as Roles] >= roleHierarchy[role])
    ) {
      return next();
    }

    return res.status(403).send('Forbidden');
  };
};
