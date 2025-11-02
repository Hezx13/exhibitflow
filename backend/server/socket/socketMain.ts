import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import userEvents from './userEvents';
import editingEvents from './editingEvents';

export interface SocketUser {
  userId: string;
  username: string;
  role: string;
}

interface Users {
  [socketId: string]: string;
}

const users: Users = {};
const occupiedProjects: Map<string, any> = new Map();

const socketMain = (io: Server): void => {
  io.on('connection', (socket: Socket) => {
    let usr: SocketUser | undefined;

    jwt.verify(
      socket.handshake.query.token as string,
      process.env.JWT_SECRET_KEY ?? 'fallbackSecret',
      (err: jwt.VerifyErrors | null, user: any) => {
        if (err) {
          console.log(err);
          return;
        }

        usr = user;
        console.log('User connected: ', usr?.userId);
        users[socket.id] = usr?.userId ?? '';

        // Pass socket and shared state to the handlers
        userEvents(io, socket, users, occupiedProjects, usr as SocketUser);
        editingEvents(io, socket, users, usr as SocketUser);
      }
    );
  });
};

export default socketMain;
