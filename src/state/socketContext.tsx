import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAppState } from './AppStateContext';
import { addList, addTask, editTask, moveFromArchive, moveToArchive, removeList, removeTask } from './actions';
import { eventEmitter } from './EventEmitter';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [isLoggedIn] = useState(!!localStorage.getItem('token'));
  const [socket, setSocket] = useState(null);
  const { dispatch } = useAppState();

  //@ts-ignore
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (token) {
      const newSocket = io('http://localhost:4500', {
        query: { token, role }
      });

      newSocket.on('connect', () => {
        newSocket.emit('join_room', role);
      });
      //@ts-ignore
      setSocket(newSocket);

      return () => newSocket.close();
    }
  }, []);

  useEffect(() => {
    if (socket) {
      const handleUpdatedMaterials = (data) => {
        dispatch(editTask(
          data.material.id,
          data.projectId,
          data.material.text,
          data.material.article,
          data.material.price,
          data.material.quantity,
          data.material.date,
          data.material.unit,
          data.material.comment,
          data.material.deliveryDate,
          data.material.orderedBy,
          data.material.status,
          data.material.payment,
          false
        ));
      };

      const handleAddedList = (data) => {
        dispatch(addList(data.text, data.department, false, data.id));
      };

      const handleNewMaterial = (data) => {
        dispatch(addTask(
          data.material.text,
          data.projectId,
          data.material.article,
          data.material.price,
          data.material.quantity,
          data.material.date,
          data.material.unit,
          data.material.comment,
          data.material.deliveryDate,
          data.material.orderedBy,
          data.material.status,
          data.material.payment,
          false,
          data.material.id,
        ));
      };

      const handleRemovedMaterial = (data) => {
        dispatch(removeTask(
          data.projectId,
          data.material,
          false
        ))
      }

      const handleMoveToArchive = (listId) => {
        dispatch(moveToArchive(listId,false))
      }

      const handleMoveFromArchive = (listId) => {
        dispatch(moveFromArchive(listId,false))
      }

      const handleRemoveList = (listId) => {
        dispatch(removeList(listId,false))
      }

      //@ts-expect-error
      socket?.on('receive_updated_materials', handleUpdatedMaterials);
      //@ts-expect-error
      socket?.on('receive_added_list', handleAddedList);
      //@ts-expect-error
      socket?.on('receive_new_material', handleNewMaterial);
      //@ts-expect-error
      socket?.on('receive_removed_material', handleRemovedMaterial);
      //@ts-expect-error
      socket?.on('receive_moved_to_archive', handleMoveToArchive);
      //@ts-expect-error
      socket?.on('receive_moved_from_archive', handleMoveFromArchive);
      //@ts-expect-error
      socket?.on('receive_removed_list', handleRemoveList);

      
      return () => {
        //@ts-expect-error
        socket.off('receive_updated_materials', handleUpdatedMaterials);
        //@ts-expect-error
        socket.off('receive_added_list', handleAddedList);
        //@ts-expect-error
        socket.off('receive_new_material', handleNewMaterial);
        //@ts-expect-error
        socket.off('receive_removed_material', handleRemovedMaterial);
        //@ts-expect-error
        socket?.off('receive_moved_to_archive', handleMoveToArchive);
        //@ts-expect-error
        socket?.off('receive_moved_from_archive', handleMoveFromArchive);
        //@ts-expect-error
        socket?.off('receive_removed_list', handleRemoveList);
      };
    }
  }, [socket, dispatch]);

  useEffect(() => {
    const addedListListener = (list) => {
      //@ts-expect-error
      socket?.emit('send_added_list', list);
    };

    const addedMaterialListener = (material) => {
      //@ts-expect-error
      socket?.emit('send_new_material', material);
    };

    const removedMaterialListener = (material) => {
      //@ts-expect-error
      socket?.emit('send_removed_material', material);
    };

    const moveToArchiveListener = (listId) => {
      //@ts-expect-error
      socket?.emit('send_move_to_archive', listId);
    }

    const moveFromArchiveListener = (listId) => {
      //@ts-expect-error
      socket?.emit('send_move_from_archive', listId);
    }

    const removeListListener = (listId) => {
      //@ts-expect-error
      socket?.emit('send_remove_list', listId);
    }

    const unSelectedProject = () => {
      //@ts-expect-error
      socket?.emit('unselected_project', {});
    }

    
    eventEmitter.on('added_list', addedListListener);
    eventEmitter.on('added_material', addedMaterialListener);
    eventEmitter.on('removed_material', removedMaterialListener);
    eventEmitter.on('move_to_archive', moveToArchiveListener)
    eventEmitter.on('move_from_archive', moveFromArchiveListener)
    eventEmitter.on('remove_list', removeListListener)
    eventEmitter.on('unselected_project', unSelectedProject)
    return () => {
      eventEmitter.off('added_list', addedListListener);
      eventEmitter.off('added_material', addedMaterialListener);
      eventEmitter.off('removed_material', removedMaterialListener);
      eventEmitter.off('move_to_archive', moveToArchiveListener)
      eventEmitter.off('move_from_archive', moveFromArchiveListener)
      eventEmitter.off('remove_list', removeListListener)
      eventEmitter.off('unselected_project', unSelectedProject)
    };
  }, [socket]); // Ensure socket is part of the dependency array if used in the listener

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
