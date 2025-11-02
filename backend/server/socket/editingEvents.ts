import { Server, Socket } from 'socket.io';
import { SocketUser } from './socketMain';

interface Users {
  [socketId: string]: string;
}

interface MaterialData {
  id: string;
  name: string;
  quantity: number;
}

interface ListData {
  id: string;
  title: string;
  tasks: any[];
}

export default (_io: Server, socket: Socket, _users: Users, _usr: SocketUser): void => {
  socket.on('send_added_list', (data: ListData) => {
    socket.broadcast.emit('receive_added_list', data); // Emit to all clients
  });

  socket.on('send_removed_material', (data: MaterialData) => {
    socket.broadcast.emit('receive_removed_material', data);
  });

  socket.on('send_move_to_archive', (listId: string) => {
    socket.broadcast.emit('receive_moved_to_archive', listId);
  });

  socket.on('send_move_from_archive', (listId: string) => {
    socket.broadcast.emit('receive_moved_from_archive', listId);
  });

  socket.on('send_remove_list', (listId: string) => {
    socket.broadcast.emit('receive_removed_list', listId);
  });

  socket.on('send_new_material', (data: MaterialData) => {
    socket.broadcast.emit('receive_new_material', data);
  });

  socket.on('send_updated_materials', (data: MaterialData[]) => {
    console.log(data);
    socket.broadcast.emit('receive_updated_materials', data);
  });
};
