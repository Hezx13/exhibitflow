import { Router, Request } from 'express';
import User from '../models/user';
import { AuthenticatedRequest, authenticateToken } from 'server/middleware/authenticate';
import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Roles } from 'server/middleware/permit';
import { permit } from 'server/middleware/permit';
import { Department } from 'server/models/List/list.model';

dotenv.config();

class AuthNService {
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/register', this.handleRegister.bind(this));
    this.router.post('/login', this.handleLogin.bind(this));
    this.router.get('/user', authenticateToken, permit(Roles.USER), this.handleGetUser.bind(this));
  }

  private async handleRegister(req: Request, res: Response) {
    try {
      const {
        username,
        password,
        email,
      }: {
        username: string;
        password: string;
        email: string;
      } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }

      const existingUser = await User.findOne({ 
        $or: [{ username }, { email }] 
      });
      if (existingUser) {
        return res.status(400).json({ message: 'Username or email already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const department = await Department.find().lean();
      const user = new User({
        username: username,
        password: hashedPassword,
        email: email,
        department: department?.[0]?._id,
      });
      await Department.updateOne({ _id: department?.[0]?._id }, { $push: { users: user._id } });
      await user.save();

      return res.status(201).json({ message: 'User created' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  private async handleLogin(req: Request, res: Response) {
    try {
      const { username, password }: { username: string; password: string } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }

      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).send('User not found');
      }

      if (!user.isApproved) {
        return res.status(403).send('Not approved');
      }

      if (user.password === 'Reset') {
        const hashedPassword = await bcrypt.hash(password, 12);
        user.password = hashedPassword;
        await user.save();
        const token = jwt.sign(
          { userId: user._id, userRole: user.role, userName: username },
          process.env.JWT_SECRET_KEY || 'fallbackSecret'
        );
        return res.status(200).json({ token, role: user.role, username: username });
      }

      const isPasswordValid = await bcrypt.compare(password.trim(), user.password.trim());
      if (!isPasswordValid) {
        return res.status(401).send('Invalid credentials');
      }

      const token = jwt.sign(
        { userId: user._id, userRole: user.role, userName: username },
        process.env.JWT_SECRET_KEY || 'fallbackSecret'
      );
      return res.status(200).json({ token, role: user.role, username: username });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  private async handleGetUser(req: AuthenticatedRequest, res: Response) {
    try {
      const user = await User.findById(req.user?.userId)
        .select('-password')
        .populate('departments', '_id name');
      if (user?.adminAccess) {
        const departments = await Department.find().select('_id name');
        return res.json({ ...user.toObject(), departments });
      }
      if (!user) return res.status(404).send('User not found');
      return res.json(user);
    } catch (error) {
      console.error(error);
      return res.status(500).send('Internal Server Error');
    }
  }
}

const authNService = new AuthNService();
export default authNService.router;
