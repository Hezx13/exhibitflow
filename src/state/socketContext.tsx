// import React, { createContext, useContext, useEffect, useState } from 'react';
// import { io, Socket } from 'socket.io-client';
// import { useAppState } from './AppStateContext';
// import {
//   addList,
//   addTask,
//   editTask,
//   moveFromArchive,
//   moveToArchive,
//   removeList,
//   removeTask,
// } from './actions';
// import { eventEmitter } from './EventEmitter';

// interface ServerToClientEvents {
//   receive_updated_materials: (data: any) => void;
//   receive_added_list: (data: any) => void;
//   receive_new_material: (data: any) => void;
//   receive_removed_material: (data: any) => void;
//   receive_moved_to_archive: (listId: string) => void;
//   receive_moved_from_archive: (listId: string) => void;
//   receive_removed_list: (listId: string) => void;
// }

// interface ClientToServerEvents {
//   join_room: (role: string) => void;
//   selected_project: (data: { id: string; user: string | null }) => void;
//   send_users_in_project: () => void;
//   send_updated_materials: (data: any) => void;
//   send_added_list: (list: any) => void;
//   send_new_material: (material: any) => void;
//   send_removed_material: (material: any) => void;
//   send_move_to_archive: (listId: string) => void;
//   send_move_from_archive: (listId: string) => void;
//   send_remove_list: (listId: string) => void;
//   unselected_project: (data: any) => void;
// }

// type SocketType = Socket<ServerToClientEvents, ClientToServerEvents> | null;

// const SocketContext = createContext<SocketType>(null);

// export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
//   const [isLoggedIn] = useState(!!localStorage.getItem('token'));
//   const [socket, setSocket] = useState<SocketType>(null);
//   const { dispatch } = useAppState();

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     const role = localStorage.getItem('role');

//     if (token) {
//       const newSocket = io('http://localhost:4500', {
//         query: { token, role },
//       }) as Socket<ServerToClientEvents, ClientToServerEvents>;

//       newSocket.on('connect', () => {
//         newSocket.emit('join_room', role || '');
//       });

//       setSocket(newSocket);

//       return () => newSocket.close();
//     }
//     return () => {
//       if (socket) {
//         socket.disconnect();
//         setSocket(null);
//       }
//     };
//   }, []);

//   useEffect(() => {
//     if (socket) {
//       const handleUpdatedMaterials = (data) => {
//         dispatch(
//           editTask(
//             data.material.id,
//             data.projectId,
//             data.material.text,
//             data.material.article,
//             data.material.price,
//             data.material.quantity,
//             data.material.date,
//             data.material.unit,
//             data.material.comment,
//             data.material.deliveryDate,
//             data.material.orderedBy,
//             data.material.status,
//             data.material.payment,
//             false
//           )
//         );
//       };

//       const handleAddedList = (data) => {
//         dispatch(addList(data.text, data.department, false, data.id));
//       };

//       const handleNewMaterial = (data) => {
//         dispatch(
//           addTask(
//             data.material.text,
//             data.projectId,
//             data.material.article,
//             data.material.price,
//             data.material.quantity,
//             data.material.date,
//             data.material.unit,
//             data.material.comment,
//             data.material.deliveryDate,
//             data.material.orderedBy,
//             data.material.status,
//             data.material.payment,
//             false,
//             data.material.id
//           )
//         );
//       };

//       const handleRemovedMaterial = (data) => {
//         dispatch(removeTask(data.projectId, data.material, false));
//       };

//       const handleMoveToArchive = (listId) => {
//         dispatch(moveToArchive(listId, false));
//       };

//       const handleMoveFromArchive = (listId) => {
//         dispatch(moveFromArchive(listId, false));
//       };

//       const handleRemoveList = (listId) => {
//         dispatch(removeList(listId, false));
//       };

//       socket.on('receive_updated_materials', handleUpdatedMaterials);
//       socket.on('receive_added_list', handleAddedList);
//       socket.on('receive_new_material', handleNewMaterial);
//       socket.on('receive_removed_material', handleRemovedMaterial);
//       socket.on('receive_moved_to_archive', handleMoveToArchive);
//       socket.on('receive_moved_from_archive', handleMoveFromArchive);
//       socket.on('receive_removed_list', handleRemoveList);

//       return () => {
//         socket.off('receive_updated_materials', handleUpdatedMaterials);
//         socket.off('receive_added_list', handleAddedList);
//         socket.off('receive_new_material', handleNewMaterial);
//         socket.off('receive_removed_material', handleRemovedMaterial);
//         socket.off('receive_moved_to_archive', handleMoveToArchive);
//         socket.off('receive_moved_from_archive', handleMoveFromArchive);
//         socket.off('receive_removed_list', handleRemoveList);
//       };
//     }
//   }, [socket, dispatch]);

//   useEffect(() => {
//     const addedListListener = (list) => {
//       socket?.emit('send_added_list', list);
//     };

//     const addedMaterialListener = (material) => {
//       socket?.emit('send_new_material', material);
//     };

//     const removedMaterialListener = (material) => {
//       socket?.emit('send_removed_material', material);
//     };

//     const moveToArchiveListener = (listId) => {
//       socket?.emit('send_move_to_archive', listId);
//     };

//     const moveFromArchiveListener = (listId) => {
//       socket?.emit('send_move_from_archive', listId);
//     };

//     const removeListListener = (listId) => {
//       socket?.emit('send_remove_list', listId);
//     };

//     const unSelectedProject = () => {
//       socket?.emit('unselected_project', {});
//     };

//     eventEmitter.on('added_list', addedListListener);
//     eventEmitter.on('added_material', addedMaterialListener);
//     eventEmitter.on('removed_material', removedMaterialListener);
//     eventEmitter.on('move_to_archive', moveToArchiveListener);
//     eventEmitter.on('move_from_archive', moveFromArchiveListener);
//     eventEmitter.on('remove_list', removeListListener);
//     eventEmitter.on('unselected_project', unSelectedProject);
//     return () => {
//       eventEmitter.off('added_list', addedListListener);
//       eventEmitter.off('added_material', addedMaterialListener);
//       eventEmitter.off('removed_material', removedMaterialListener);
//       eventEmitter.off('move_to_archive', moveToArchiveListener);
//       eventEmitter.off('move_from_archive', moveFromArchiveListener);
//       eventEmitter.off('remove_list', removeListListener);
//       eventEmitter.off('unselected_project', unSelectedProject);
//     };
//   }, [socket]);

//   return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
// };

// export const useSocket = (): Socket<ServerToClientEvents, ClientToServerEvents> => {
//   const socket = useContext(SocketContext);
//   if (!socket) {
//     throw new Error('useSocket must be used within a SocketProvider');
//   }
//   return socket;
// };
