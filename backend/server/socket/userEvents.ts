import { Server, Socket } from 'socket.io';
import { mapHasValue } from '../../utils/structuresUtils';
import { SocketUser } from './socketMain';

interface ProjectData {
  id: string;
}
export default (
  io: Server,
  socket: Socket,
  users: Record<string, string>,
  occupiedProjects: Map<string, string>,
  usr: SocketUser
): void => {
  socket.on('join_room', (roomName: string) => {
    socket.join(roomName);
    socket.join('app');
    console.log(`User ${socket.id} joined room: ${roomName}`);
    io.to('Admin').emit('receive_active_users', Object.values(users));
    socket.emit('receive_active_users', Object.values(users));
  });

  socket.on('get_active_users', () => {
    io.to('Admin').emit('receive_active_users', Object.values(users));
    io.to('Admin').emit('user_in_project', Object.fromEntries(occupiedProjects));
  });

  socket.on('send_users_in_project', () => {
    io.emit('user_in_project', Object.fromEntries(occupiedProjects));
  });

  socket.on('selected_project', (data: ProjectData) => {
    if (!mapHasValue(occupiedProjects, data.id)) occupiedProjects.set(usr.userId, data.id);
    console.log('selected_project:');
    console.log(occupiedProjects);
    io.emit('user_in_project', Object.fromEntries(occupiedProjects));
  });

  socket.on('unselected_project', (data: ProjectData) => {
    if (mapHasValue(occupiedProjects, data.id)) occupiedProjects.delete(users[socket.id] as string);
    console.log('unselected_project:');
    console.log(occupiedProjects);
    io.emit('user_in_project', Object.fromEntries(occupiedProjects));
  });

  socket.on('disconnect', () => {
    console.log('User disconnected: ', socket.id);
    if (users[socket.id]) {
      occupiedProjects.delete(users[socket.id] as string);
      delete users[socket.id];
    }
    io.to('Admin').emit('receive_active_users', Object.values(users));
  });
};
