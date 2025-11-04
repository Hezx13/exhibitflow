import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useSnackbar } from 'notistack';

interface ReportReadyPayload {
  status: 'success' | 'error';
  reportId?: string;
  message: string;
  period: {
    start: string;
    end: string;
  };
  payment: string;
  timestamp: string;
}

export const useReportNotifications = () => {
  const socketRef = useRef<Socket | null>(null);
  const department = useSelector((state: RootState) => state.auth.department);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (!department) return;

    const socket = io('http://localhost:4500', {
      path: '/notifications',
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to notification service');
      socket.emit('join-department', department);
    });

    socket.on('report-ready', (data: ReportReadyPayload) => {
      console.log('Report ready notification received:', data);

      if (data.status === 'success') {
        enqueueSnackbar(data.message, {
          variant: 'success',
          autoHideDuration: 5000,
        });
        
        // Trigger refetch of reports list
        window.dispatchEvent(new CustomEvent('report-generated'));
      } else {
        enqueueSnackbar(data.message, {
          variant: 'error',
          autoHideDuration: 5000,
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from notification service');
    });

    return () => {
      socket.disconnect();
    };
  }, [department, enqueueSnackbar]);

  return socketRef.current;
};
