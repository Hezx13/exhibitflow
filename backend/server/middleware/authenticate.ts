import { Response, NextFunction, Request } from 'express';
import jwt from 'jsonwebtoken';
import { Roles } from './permit';

export interface DecodedToken {
  userId: string;
  userRole: Roles;
  userName: string;
}

export interface AuthenticatedRequest extends Request {
  user?: DecodedToken;
}

export const decodeToken = (token: string): DecodedToken | null => {
  let decoded = null;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET_KEY ?? 'fallbackSecret');
  } catch (err) {
    console.error(err);
  }
  return decoded as DecodedToken | null;
};

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers['authorization'];
    const department = req.headers['department'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    if (token == null) {
      res.sendStatus(401);
      return;
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY ?? 'fallbackSecret', (err, user) => {
      if (err || !user) {
        res.sendStatus(403);
        return;
      }
      req.user = user as DecodedToken;
      next();
    });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
    next();
    return;
  }
};

export default authenticateToken;
