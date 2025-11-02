import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authenticate';

const verifyDepartment = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const department = req.headers['department'];
    if (department && department.toString() !== 'null') {
      next();
    } else {
      res.status(400).json({ message: 'Department header is missing' });
      return;
    }
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
    next();
    return;
  }
};

export default verifyDepartment;
