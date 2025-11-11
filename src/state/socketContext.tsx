import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { eventEmitter } from './EventEmitter';
import { useAppSelector } from '../store';
import { registerReportEventHandlers, type ReportReadyPayload } from './socketEventHandlers/reportEventsHandler';
import { useDispatch } from 'react-redux';
import { registerOcrJobEventHandlers } from './socketEventHandlers/ocrJobEventsHandler';

interface ServerToClientEvents {
  'report-ready': (data: ReportReadyPayload) => void;
  'ocr-job-updated': (data: { jobId: string }) => void;
}

interface ClientToServerEvents {
  'join-department': (department: string) => void;
}

export type SocketType = Socket<ServerToClientEvents, ClientToServerEvents> | null;

const SocketContext = createContext(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const {token, department} = useAppSelector((state) => state.auth);
  const socketRef = useRef<Socket | null>(null);
  const dispatch = useDispatch();
  useEffect(() => {
    if (token && department) {
      const socket = io('http://localhost:4500', {
        path: '/notifications',
        query: { token },
        transports: ['websocket', 'polling'],
      }) as SocketType;
      
    socketRef.current = socket;
    socket?.on('connect', () => {
        console.log('Connected to socket server');
        socket.emit('join-department', department);
    });
    registerReportEventHandlers(socket, dispatch);
    registerOcrJobEventHandlers(socket, dispatch);
    return () => socket?.close();
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return <SocketContext.Provider value={null}>{children}</SocketContext.Provider>;
};

export const useSocket = (): Socket<ServerToClientEvents, ClientToServerEvents> => {
  const socket = useContext(SocketContext);
  if (!socket) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return socket;
};
