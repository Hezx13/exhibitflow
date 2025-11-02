import { Response, Router } from 'express';
import User from './models/user';
import 'dotenv/config';
import authenticateToken, { AuthenticatedRequest } from 'server/middleware/authenticate';

const router: Router = Router();

router.get('/user', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.userId).select('-password');
    if (!user) return res.status(404).send('User not found');
    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal Server Error');
  }
});

router.get('/users', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.userRole !== 'Admin') {
      return res.status(403).send('Access denied');
    }
    const users = await User.find().select('-password').lean();
    return res.status(200).json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal Server Error');
  }
});

router.post('/removeUser', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.userRole !== 'Admin') {
      return res.status(403).send('Access denied');
    }

    const { userToRemove } = req.body;
    const fetchedUser = await User.findOneAndDelete({ username: userToRemove });
    if (!fetchedUser) return res.status(404).send('User not found');
    return res.status(200).send('Deleted');
  } catch (err) {
    console.error('Remove user error: ', err instanceof Error ? err.message : err);
    return res.status(500).send('Internal Server Error');
  }
});

router.post('/promoteUser', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.userRole !== 'Admin') {
      return res.status(403).send('Access denied');
    }
    const { userToPromote } = req.body;
    const fetchedUser = await User.findOneAndUpdate({ username: userToPromote }, { role: 'Admin' });
    console.log('Promoted: ', fetchedUser);
    return res.status(200).send('Promoted');
  } catch (err) {
    console.error('Promote user error: ', err instanceof Error ? err.message : err);
    return res.status(500).send('Internal server error');
  }
});

router.post('/demoteUser', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.userRole !== 'Admin') {
      return res.status(403).send('Access denied');
    }
    const { userToDemote } = req.body;
    const fetchedUser = await User.findOneAndUpdate({ username: userToDemote }, { role: 'User' });
    console.log('Disapproved: ', fetchedUser);
    return res.status(200).send('Demoted');
  } catch (err) {
    console.error('Demote user error: ', err instanceof Error ? err.message : err);
    return res.status(500).send('Internal server error');
  }
});

router.post(
  '/resetUserPassword',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user?.userRole !== 'Admin') {
        return res.status(403).send('Access denied');
      }
      const { userToReset } = req.body;
      const _fetchedUser = await User.findOneAndUpdate(
        { username: userToReset },
        { password: 'Reset' }
      );
      return res.status(200).send('Reset successful');
    } catch (err) {
      console.error('RESET PASS ERROR: ', err instanceof Error ? err.message : err);
      return res.status(500).send('Internal server error');
    }
  }
);

router.patch('/department', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { user, department } = req.body;
    if (user) {
      if (req.user?.userRole !== 'Admin') return res.status(403).send('Access denied');
      const fetchedUser = await User.findOneAndUpdate(
        { username: user },
        { department: department }
      );

      if (fetchedUser) {
        return res.status(200).send();
      }
      return res.status(401).send('Bad request');
    } else {
      const fetchedUser = await User.findByIdAndUpdate(req.user?.userId, {
        department: department,
      });
      if (fetchedUser) {
        return res.status(200).send();
      }
      return res.status(401).send('Bad request');
    }
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    return res.status(500).send('Internal server error');
  }
});

export { router };
